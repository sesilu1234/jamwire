import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import type { RecentJam } from '@/lib/getRecentJams';

/**
 * "New on Jamwire" — the most recently added spots that still have a date
 * ahead of them.
 *
 * A horizontal scroller rather than a grid: the point is freshness, not
 * completeness, so it shouldn't claim a whole screen of vertical space.
 */
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Formats a date-only `nextDate` ("2026-10-04") as "Sun 4 Oct".
 *
 * Written out by hand rather than with toLocaleDateString, which broke
 * hydration twice over. First the locale: passing `undefined` let the server
 * format in its locale and the browser in the visitor's, so "Sun, 4 Oct" met
 * "dom, 4 oct". Pinning it to en-GB was not enough either, because Node and
 * Chrome ship different ICU data — Node renders "Sun, 4 Oct" and Chrome
 * "Sun 4 Oct" from the very same options. Any Intl call here is a hydration
 * mismatch waiting for the next Node upgrade.
 *
 * The value carries no time and no zone, so it is read back as UTC: parsed
 * as local time, a date-only string lands on the previous day for every
 * visitor west of UTC. This is the calendar date the host chose, printed the
 * same everywhere. The jam's actual local start time is a separate field
 * (`display_date`) and is not touched here.
 */
function formatJamDate(nextDate: string) {
  const [y, m, d] = nextDate.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return '';
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${weekday} ${d} ${MONTHS[m - 1]}`;
}

export default function NewJams({ jams }: { jams: RecentJam[] }) {
  // Nothing new and upcoming is a normal state on a quiet week — show nothing
  // rather than an empty shelf.
  if (jams.length === 0) return null;

  return (
    <section className="w-full py-10">
      <div className="mx-auto w-[1300px] max-w-[90%] px-6">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h3 className="text-sm font-bold tracking-[0.2em] text-tone-1/40 uppercase">
            New on Jamwire
          </h3>
          <Link
            href="/cities"
            className="group inline-flex items-center gap-1 text-sm font-semibold text-primary-1 hover:underline"
          >
            Browse every city
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <ul className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]">
          {jams.map((jam) => (
            <li key={jam.id} className="w-56 shrink-0">
              <Link
                href={`/jam/${jam.slug}`}
                className="group block overflow-hidden rounded-xl border border-tone-0/10 bg-surface-raised transition-colors hover:border-tone-0/25"
              >
                <div className="relative h-28 w-full overflow-hidden bg-tone-4/40">
                  {jam.image ? (
                    <Image
                      src={jam.image}
                      alt=""
                      fill
                      sizes="224px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : null}
                  {jam.modality ? (
                    <span className="absolute top-2 left-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase backdrop-blur-sm">
                      {jam.modality === 'open_mic' ? 'Open mic' : 'Jam'}
                    </span>
                  ) : null}
                </div>

                <div className="p-3">
                  <p className="truncate text-sm font-semibold">
                    {jam.jam_title}
                  </p>
                  {jam.location_title ? (
                    <p className="mt-0.5 truncate text-xs text-tone-1/60">
                      {jam.location_title}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs font-medium tabular-nums text-tone-1/50">
                    {formatJamDate(jam.nextDate)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
