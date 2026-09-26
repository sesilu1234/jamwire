/**
 * Recompresses images already in the bucket, in place.
 *
 * Every file keeps its exact key, so nothing in the database has to change and
 * no link breaks. The stored bytes become WebP while the name still ends .png;
 * that is fine, because the Content-Type header decides how a browser reads a
 * response, not the extension.
 *
 * Same rules as lib/upload-photos.ts - keep the constants below in step with it.
 *
 *   node --env-file=.env.local scripts/recompress-existing-images.mjs
 *   node --env-file=.env.local scripts/recompress-existing-images.mjs --yes
 *
 * Recovery: .github/workflows/backup_images.yml holds the last three nightly
 * copies of the whole bucket in S3.
 */
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

const BUCKET = 'jamspots_imageBucket';
const PREFIX = 'images';

const DIMENSION_LADDER = [2048, 1600, 1280];
const QUALITY = 82;
const TARGET_BYTES = 400 * 1024;

/** Below this a rewrite is not worth the risk or the cache churn. */
const REWRITE_OVER_BYTES = 400 * 1024;

/**
 * A rewrite that saves almost nothing still invalidates the CDN copy and burns
 * a version, so skip anything that would not shrink by at least this much.
 */
const MIN_SAVING_RATIO = 0.15;

const PAGE = 1000;
const commit = process.argv.includes('--yes');

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    'Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.\n' +
      'Run with: node --env-file=.env.local scripts/recompress-existing-images.mjs',
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const kb = (bytes) => Math.round(bytes / 1024);

/** Same ladder as the upload path: decide on bytes, turn the dimension knob. */
async function compress(input) {
  const meta = await sharp(input).metadata();
  const longestSide = Math.max(meta.width ?? 0, meta.height ?? 0);
  const rungs = [
    ...new Set(DIMENSION_LADDER.map((d) => Math.min(d, longestSide))),
  ];

  let result;
  for (const dimension of rungs) {
    const buffer = await sharp(input)
      .rotate()
      .resize({
        width: dimension,
        height: dimension,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: QUALITY })
      .toBuffer();

    const out = await sharp(buffer).metadata();
    result = { buffer, width: out.width, height: out.height, source: meta };

    if (buffer.byteLength <= TARGET_BYTES) break;
  }
  return result;
}

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
  return objects.filter((o) => o.metadata);
}

const objects = await listAllObjects();
const candidates = objects.filter(
  (o) => (o.metadata.size ?? 0) > REWRITE_OVER_BYTES,
);

const bucketBytes = objects.reduce((sum, o) => sum + (o.metadata.size ?? 0), 0);

console.log(`Objects in bucket: ${objects.length}  (${kb(bucketBytes)} KB)`);
console.log(`Over ${kb(REWRITE_OVER_BYTES)} KB:      ${candidates.length}`);
console.log(commit ? '\nRewriting.\n' : '\nDry run - nothing is written.\n');

let before = 0;
let after = 0;
let rewritten = 0;
let skipped = 0;
let failed = 0;

for (const [i, object] of candidates.entries()) {
  const path = `${PREFIX}/${object.name}`;
  const originalBytes = object.metadata.size ?? 0;
  const position = `[${i + 1}/${candidates.length}]`;

  try {
    const { data: blob, error: downloadError } = await supabase.storage
      .from(BUCKET)
      .download(path);
    if (downloadError) throw new Error(downloadError.message);

    const input = Buffer.from(await blob.arrayBuffer());
    const result = await compress(input);

    const saving = 1 - result.buffer.byteLength / originalBytes;
    if (saving < MIN_SAVING_RATIO) {
      skipped += 1;
      console.log(
        `${position} skip   ${object.name}  (${kb(originalBytes)} KB, only -${Math.round(saving * 100)}%)`,
      );
      continue;
    }

    if (commit) {
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, result.buffer, {
          contentType: 'image/webp',
          cacheControl: '3600',
          upsert: true,
        });
      if (uploadError) throw new Error(uploadError.message);
    }

    before += originalBytes;
    after += result.buffer.byteLength;
    rewritten += 1;

    console.log(
      `${position} ${commit ? 'wrote ' : 'would '} ${object.name}  ` +
        `${kb(originalBytes)} KB ${result.source.width}x${result.source.height} ${result.source.format}` +
        `  ->  ${kb(result.buffer.byteLength)} KB ${result.width}x${result.height} webp` +
        `  (-${Math.round(saving * 100)}%)`,
    );
  } catch (e) {
    failed += 1;
    console.error(`${position} FAILED ${object.name}: ${e.message}`);
  }
}

console.log(
  `\n${commit ? 'Rewritten' : 'Would rewrite'}: ${rewritten}   skipped: ${skipped}   failed: ${failed}`,
);
console.log(
  `${kb(before)} KB -> ${kb(after)} KB  ` +
    `(bucket ${(bucketBytes / 1048576).toFixed(1)} MB -> ${((bucketBytes - before + after) / 1048576).toFixed(1)} MB)`,
);

if (!commit && rewritten) {
  console.log('\nRe-run with --yes to write these.');
}
