/**
 * Deletes files in the image bucket that no jam points at any more.
 *
 * Recomputes the orphan set on every run rather than reading a CSV, because a
 * list exported minutes ago can already name a file a new jam has claimed.
 *
 * Dry run unless you pass --yes:
 *
 *   node --env-file=.env.local scripts/delete-orphan-images.mjs
 *   node --env-file=.env.local scripts/delete-orphan-images.mjs --yes
 *
 * Recovery, if this ever takes something it should not: the nightly workflow in
 * .github/workflows/backup_images.yml keeps the last three copies of the whole
 * bucket in S3.
 */
import { createClient } from '@supabase/supabase-js';

const BUCKET = 'jamspots_imageBucket';
const PREFIX = 'images';

/**
 * A file uploaded seconds ago may belong to a row that is still being written.
 * Nothing younger than this is ever a candidate.
 */
const MIN_AGE_HOURS = 24;

/** storage.remove() takes at most 1000 keys; stay well under it. */
const DELETE_BATCH = 100;

const PAGE = 1000;

const commit = process.argv.includes('--yes');

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    'Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.\n' +
      'Run with: node --env-file=.env.local scripts/delete-orphan-images.mjs',
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1);

/** Every object under images/, following the pagination to the end. */
async function listAllObjects() {
  const objects = [];
  for (let offset = 0; ; offset += PAGE) {
    const { data, error } = await supabase.storage.from(BUCKET).list(PREFIX, {
      limit: PAGE,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    });

    if (error) throw new Error(`Listing storage failed: ${error.message}`);
    if (!data?.length) break;

    objects.push(...data);
    if (data.length < PAGE) break;
  }
  return objects;
}

/**
 * The filenames every jam still points at.
 *
 * Paginated deliberately. Supabase caps a select at 1000 rows, and a truncated
 * "in use" set here would mark live photos as orphans and delete them.
 */
async function listUsedFilenames() {
  const used = new Set();
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from('sessions')
      .select('images')
      .range(from, from + PAGE - 1);

    if (error) throw new Error(`Reading sessions failed: ${error.message}`);
    if (!data?.length) break;

    for (const row of data) {
      for (const url of row.images ?? []) {
        if (typeof url !== 'string') continue;
        const withoutQuery = url.split('?')[0];
        used.add(withoutQuery.substring(withoutQuery.lastIndexOf('/') + 1));
      }
    }

    if (data.length < PAGE) break;
  }
  return used;
}

const [objects, used] = await Promise.all([
  listAllObjects(),
  listUsedFilenames(),
]);

const cutoff = Date.now() - MIN_AGE_HOURS * 60 * 60 * 1000;

const orphans = [];
let tooYoung = 0;

for (const object of objects) {
  // The bucket has a placeholder row for the folder itself; it has no metadata.
  if (!object.metadata) continue;
  if (used.has(object.name)) continue;

  if (new Date(object.created_at).getTime() > cutoff) {
    tooYoung += 1;
    continue;
  }

  orphans.push({
    path: `${PREFIX}/${object.name}`,
    bytes: object.metadata.size ?? 0,
    created_at: object.created_at,
  });
}

orphans.sort((a, b) => b.bytes - a.bytes);

console.log(`Found ${orphans.length} orphaned images.`);

console.log(orphans);

const totalBytes = orphans.reduce((sum, o) => sum + o.bytes, 0);

console.log(`Objects in bucket:   ${objects.filter((o) => o.metadata).length}`);
console.log(`Referenced by a jam: ${used.size}`);
console.log(`Orphans:             ${orphans.length}  (${mb(totalBytes)} MB)`);
if (tooYoung) {
  console.log(`Skipped (< ${MIN_AGE_HOURS}h old): ${tooYoung}`);
}
console.log('');

for (const o of orphans) {
  console.log(`  ${o.path}  ${mb(o.bytes).padStart(6)} MB  ${o.created_at}`);
}

if (!orphans.length) {
  console.log('\nNothing to do.');
  process.exit(0);
}

if (!commit) {
  console.log(
    '\nDry run. Nothing was deleted. Re-run with --yes to delete these.',
  );
  process.exit(0);
}

console.log('');
let deleted = 0;

for (let i = 0; i < orphans.length; i += DELETE_BATCH) {
  const batch = orphans.slice(i, i + DELETE_BATCH).map((o) => o.path);

  const { data, error } = await supabase.storage.from(BUCKET).remove(batch);
  if (error) {
    console.error(`Batch starting at ${i} failed: ${error.message}`);
    process.exit(1);
  }

  deleted += data?.length ?? 0;
  console.log(`Deleted ${deleted}/${orphans.length}`);
}

console.log(`\nDone. Freed roughly ${mb(totalBytes)} MB.`);
