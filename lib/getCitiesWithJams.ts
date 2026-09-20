import 'server-only';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export type CityWithJams = {
  city: string;
  country: string | null;
  count: number;
};

/**
 * The cities that have at least one jam with a session still ahead of it,
 * busiest first.
 *
 * Shared by the directory page and the sitemap on purpose. Those two used to
 * carry their own copies of a hand-written list of 39 cities, so the sitemap
 * could advertise a city the directory no longer showed, and adding a city
 * meant remembering both files. Now there is one source and it is the data.
 *
 * Counted here rather than in SQL because supabase-js has no GROUP BY. Two
 * indexed queries and a loop; if these tables grow enough for that to hurt,
 * this function is the single place to swap for an RPC.
 */
export async function getCitiesWithJams(
  limit?: number,
): Promise<CityWithJams[]> {
  const [jamsResult, datesResult] = await Promise.all([
    supabaseAdmin
      .from('sessions')
      .select('id, city, country')
      .not('city', 'is', null),

    supabaseAdmin
      .from('jam_dates')
      .select('jam_id')
      .gt('utc_datetime', new Date().toISOString()),
  ]);

  if (jamsResult.error || datesResult.error) {
    console.error(
      'getCitiesWithJams failed:',
      jamsResult.error ?? datesResult.error,
    );
    return [];
  }

  const alive = new Set((datesResult.data ?? []).map((row) => row.jam_id));

  const byCity = new Map<string, CityWithJams>();

  for (const jam of jamsResult.data ?? []) {
    if (!jam.city || !alive.has(jam.id)) continue;

    const key = `${jam.city}|${jam.country ?? ''}`;
    const existing = byCity.get(key);

    if (existing) {
      existing.count += 1;
    } else {
      byCity.set(key, { city: jam.city, country: jam.country, count: 1 });
    }
  }

  const ordered = [...byCity.values()].sort(
    (a, b) => b.count - a.count || a.city.localeCompare(b.city),
  );

  return limit ? ordered.slice(0, limit) : ordered;
}

/** The URL a city links to. Must match what `/[locationSlug]` geocodes. */
export const citySlug = (city: string) =>
  city.toLowerCase().replace(/\s+/g, '-');
