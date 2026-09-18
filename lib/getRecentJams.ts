import 'server-only';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export type RecentJam = {
  id: string;
  jam_title: string;
  location_title: string | null;
  slug: string;
  image: string | null;
  modality: string | null;
  /** ISO date of the next session still to come. */
  nextDate: string;
};

/**
 * The most recently added jams that still have a session ahead of them.
 *
 * Deliberately *not* the same query the map runs. The map is "what's near me,
 * filtered"; this is "what has just appeared anywhere", which is the one thing
 * a returning visitor can't get from the map itself.
 *
 * `dates` is an array on the row rather than a joined table, so the upcoming
 * check has to happen here rather than in SQL — hence over-fetching and then
 * trimming. A jam whose dates have all passed is dead content and is dropped.
 */
export const getRecentJams = async (limit = 8): Promise<RecentJam[]> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('sessions')
      .select(
        'id, jam_title, location_title, slug, images, dates, modality, created_at',
      )
      .order('created_at', { ascending: false })
      .limit(limit * 4);

    if (error) throw error;

    const now = Date.now();

    return (data ?? [])
      .map((jam) => {
        const upcoming = (jam.dates ?? [])
          .filter((d: string) => new Date(d).getTime() >= now)
          .sort();

        return {
          id: jam.id,
          jam_title: jam.jam_title,
          location_title: jam.location_title ?? null,
          slug: jam.slug,
          image: jam.images?.[0] ?? null,
          modality: jam.modality ?? null,
          nextDate: upcoming[0] ?? null,
        };
      })
      .filter((jam): jam is RecentJam => Boolean(jam.nextDate && jam.slug))
      .slice(0, limit);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('getRecentJams failure:', message);
    // A failed strip should never take the home page down with it.
    return [];
  }
};
