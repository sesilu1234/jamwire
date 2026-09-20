import Link from 'next/link';
import { BRAND } from '@/lib/brand';
import BrandLogo from '@/components/BrandLogo';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * Rebuilt at most once an hour. The underlying numbers move when a jam is
 * added or its last date passes, neither of which is worth a fresh query on
 * every visit.
 */
export const revalidate = 3600;

/** How many cities the directory shows. */
const TOP_N = 30;

type CityRow = {
  city: string;
  country: string | null;
  count: number;
};

/**
 * The cities that actually have jams, busiest first.
 *
 * This page used to be a hand-written list of 39 famous cities. Half of them
 * had nothing in them, so the directory's main job - telling a visitor where
 * there is something to go to - was the one thing it could not do, and each
 * dead name was a page of boilerplate for search engines to wade through.
 *
 * Only jams with a session still ahead of them count. A venue that closed two
 * years ago should not be holding a city up the list.
 *
 * Counted in JavaScript because supabase-js has no GROUP BY. At this size that
 * is two indexed queries and a loop; if the tables ever get big enough for it
 * to matter, this is the thing to replace with an RPC.
 */
async function getCitiesWithJams(): Promise<CityRow[]> {
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
      'Cities query failed:',
      jamsResult.error ?? datesResult.error,
    );
    return [];
  }

  const alive = new Set((datesResult.data ?? []).map((row) => row.jam_id));

  const byCity = new Map<string, CityRow>();

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

  return [...byCity.values()]
    .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city))
    .slice(0, TOP_N);
}

const citySlug = (city: string) => city.toLowerCase().replace(/\s+/g, '-');

export default async function CitiesPage() {
  const cities = await getCitiesWithJams();

  return (
    <div className="bg-background-0 min-h-screen">
      {/* HEADER / LOGO AREA */}
      <div className="max-w-[1300px] w-[90%] mx-auto pt-10 pb-16">
        <Link href="/" className="inline-flex items-center gap-4 group">
          <BrandLogo className="h-10 w-auto object-contain group-hover:rotate-12 transition-transform duration-300" />
          {/* The logo is itself a wordmark, so the name is not repeated here. */}
          <div className="flex flex-col border-l border-tone-0/10 pl-4">
            <p className="hidden sm:block text-[10px] uppercase tracking-widest text-gray-500 font-bold">
              {BRAND.tagline}
            </p>
          </div>
        </Link>
      </div>

      {/* CONTENT */}
      <div className="max-w-[1300px] w-[90%] mx-auto pb-24">
        <header className="mb-20">
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter uppercase leading-[0.85]">
            Global
            <br />
            <span className="text-primary-1">Jam Directory</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl leading-relaxed font-medium">
            {cities.length > 0
              ? 'Every city with a session coming up. Pick one to see where the next night is happening.'
              : 'Select a city to discover where the next session is happening or add your local spot to the global map.'}
          </p>
        </header>

        {cities.length > 0 ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-5">
            {cities.map(({ city, country, count }) => (
              <li key={`${city}-${country}`}>
                <Link
                  href={`/${citySlug(city)}`}
                  className="group flex items-baseline justify-between gap-4 border-b border-tone-0/10 pb-2 transition-colors hover:border-primary-1/40"
                >
                  <span className="min-w-0 truncate text-lg font-bold transition-colors group-hover:text-primary-1">
                    {city}
                    {country && (
                      <span className="font-medium text-gray-500">
                        {' '}
                        &middot; {country}
                      </span>
                    )}
                  </span>

                  {/* The count is the reason to click one city over another. */}
                  <span className="shrink-0 text-xs font-bold uppercase tracking-widest text-gray-400">
                    {count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          /**
           * Reached before the backfill has run, and on a genuinely empty
           * database. Not an error state - there is simply nothing to list -
           * so it points at the map instead of apologising.
           */
          <div className="border border-tone-0/10 rounded-2xl p-10 text-center">
            <p className="text-lg font-bold mb-2">No cities to show yet</p>
            <p className="text-gray-500 mb-6">
              As soon as jams have upcoming dates, the busiest cities appear
              here.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-tone-0/15 px-5 py-2.5 text-sm font-medium transition-colors hover:border-tone-0/35"
            >
              Explore the map
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
