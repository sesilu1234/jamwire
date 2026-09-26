import 'server-only';
import { unstable_cache } from 'next/cache';
import { DateTime } from 'luxon';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export type RecentJam = {
  id: string;
  jam_title: string;
  location_title: string | null;
  slug: string;
  image: string | null;
  modality: string | null;
  /** The jam's lead style, which is what the card badges. */
  style: string | null;
  /** Date-only ("2026-10-04") of the next session, in the jam's own timezone. */
  nextDate: string;
};

/**
 * The most recently added jams that still have a session ahead of them.
 *
 * Deliberately *not* the same query the map runs. The map is "what's near me,
 * filtered"; this is "what has just appeared anywhere", which is the one thing
 * a returning visitor can't get from the map itself.
 *
 * Freshness comes from `sessions.created_at`; the upcoming session comes from
 * `jam_dates`. It has to: `sessions.dates` is only the raw form input, empty
 * for every weekly jam and in practice empty across the board, and there is no
 * `next_date` column on `sessions` - that field is computed inside the RPCs.
 * Reading `sessions.dates` here is what silently emptied this strip.
 *
 * One round trip rather than two. `!inner` drops jams with no future date
 * before the limit is applied, so three rows in means three cards out, and the
 * embedded side is capped at the single earliest date per jam.
 */
/**
 * How many jams the rotation draws from. Wider than the strip so the page has
 * something different to show on the next hour; narrow enough that everything
 * in it is still genuinely recent, which is what the heading promises.
 */
const POOL_SIZE = 12;

/** Deterministic PRNG, so one hour always produces the same three cards. */
const mulberry32 = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/**
 * Fisher-Yates against a seeded PRNG rather than Math.random: the strip has to
 * be stable for everyone inside the hour, or two visitors comparing the page -
 * or one visitor refreshing - would see it flicker.
 */
const pickForHour = <T>(items: T[], count: number, hour: number): T[] => {
  const shuffled = [...items];
  const random = mulberry32(hour);

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
};

const fetchRecentJams = async (
  hour: number,
  limit = 3,
): Promise<RecentJam[]> => {
  try {
    /**
     * Frozen for the lifetime of the cache entry below, so a jam can stay on
     * the shelf for up to an hour after it has started. Harmless here - the
     * card advertises the day, not the door time.
     */
    const now = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('sessions')
      .select(
        'id, jam_title, location_title, slug, images, modality, styles, created_at, jam_dates!inner(utc_datetime, jam_timezone)',
      )
      .gt('jam_dates.utc_datetime', now)
      .order('utc_datetime', { referencedTable: 'jam_dates', ascending: true })
      .limit(1, { referencedTable: 'jam_dates' })
      .order('created_at', { ascending: false })
      .limit(POOL_SIZE);

    if (error) throw error;

    const jams = (data ?? [])
      .map((jam) => {
        const next = jam.jam_dates?.[0];

        /**
         * Resolved to the jam's own timezone and handed on as a plain date, so
         * the component keeps printing a date it can format without Intl - see
         * the hydration note in NewJams. A jam at 02:00 UTC in Los Angeles is
         * the previous evening locally, and that is the day to show.
         */
        const local = next
          ? DateTime.fromISO(next.utc_datetime, { zone: 'utc' }).setZone(
              next.jam_timezone ?? 'utc',
            )
          : null;

        return {
          id: jam.id,
          jam_title: jam.jam_title,
          location_title: jam.location_title ?? null,
          slug: jam.slug,
          image: jam.images?.[0] ?? null,
          modality: jam.modality ?? null,
          style: jam.styles?.[0] ?? null,
          nextDate: local?.isValid ? local.toFormat('yyyy-MM-dd') : null,
        };
      })
      .filter((jam): jam is RecentJam => Boolean(jam.nextDate && jam.slug));

    return pickForHour(jams, limit, hour);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('getRecentJams failure:', message);
    // A failed strip should never take the home page down with it.
    return [];
  }
};

/**
 * Cached for an hour rather than per request. The home page reads cookies and
 * headers for geolocation, which pins the whole route to dynamic rendering, so
 * a page-level `export const revalidate` would be ignored - the cache has to
 * sit on the query itself. New jams are not so frequent that an hour of
 * staleness is visible, and the tag is here for the create/update routes to
 * call `revalidateTag('recent-jams')` if that ever stops being true.
 */
const getCachedRecentJams = unstable_cache(fetchRecentJams, ['recent-jams'], {
  revalidate: 3600,
  tags: ['recent-jams'],
});

/**
 * The hour is passed in rather than read inside, because it is what gives each
 * hour its own cache entry - arguments are part of the key, the key parts above
 * are fixed. Without it the rotation would be at the mercy of when the entry
 * happened to be revalidated.
 */
export const getRecentJams = () =>
  getCachedRecentJams(Math.floor(Date.now() / 3_600_000));
