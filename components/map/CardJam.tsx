import { Card } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin } from 'lucide-react';

type JamCardProps = {
  jamName: string;
  spotName: string;
  address: string;
  display_date: string;
  /** 'jam' | 'open_mic'. Anything else is treated as a jam. */
  modality?: string;
  tags?: string[];
  src?: string;
  slug?: string;
  classname?: string;
};

/**
 * `display_date` arrives from getHomeCards as "Sun 20 Sep, 18:00", or
 * "Date TBD" when the jam has no upcoming session. Split rather than reformat
 * so the timezone work already done server-side isn't repeated here.
 */
function splitDate(display_date: string) {
  const [datePart = '', time = ''] = display_date.split(', ');
  const [weekday = '', day = '', month = ''] = datePart.split(' ');
  return { weekday, day, month, time, hasDate: Boolean(day && month) };
}

export default function JamCard({
  jamName,
  spotName,
  address,
  display_date,
  modality,
  tags,
  src,
  slug,
  classname,
}: JamCardProps) {
  const { weekday, day, month, time, hasDate } = splitDate(display_date);
  const [leadTag, ...restTags] = tags ?? [];

  // Same two variables the jam page uses for its modality label, so a card and
  // the page it opens agree on the colour. They're defined per theme, which is
  // why this reads the variable rather than hardcoding a green and a purple.
  const accent =
    modality === 'open_mic'
      ? 'var(--text-tone-modality-open-mic)'
      : 'var(--text-tone-modality-jam)';

  return (
    <Card
      className={`group w-64 shrink-0 overflow-hidden rounded-xl bg-card-jams/85 p-0 shadow-md ${classname ?? ''}`}
    >
      <Link href={`/jam/${slug}`} prefetch={false} className="block">
        <div className="relative h-44 overflow-hidden bg-tone-4/30">
          {src && (
            <Image
              src={src}
              alt={`${jamName} at ${spotName}`}
              fill
              sizes="256px"
              className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.04]"
            />
          )}

          {/* Torn-off calendar block. The date used to sit mid-card in the same
              grey as the address; up here it's the first thing read. */}
          {hasDate && (
            <div className="absolute top-2.5 left-2.5 w-12 overflow-hidden rounded-lg bg-card-jams shadow-lg ring-1 ring-tone-0/15">
              <div className="bg-tone-0/10 py-0.5 text-center text-[9px] font-bold tracking-wider text-tone-0/70 uppercase">
                {weekday}
              </div>
              <div className="pt-1 text-center text-lg leading-none font-extrabold text-tone-0">
                {day}
              </div>
              <div className="pt-0.5 pb-1 text-center text-[9px] font-bold tracking-wider text-tone-0/60 uppercase">
                {month}
              </div>
            </div>
          )}

          {leadTag && (
            // Dark translucent base rather than a filled pill: it sits on a
            // photo, and the modality colours are tuned as text on the theme
            // background, not as backgrounds themselves.
            <span
              className="absolute top-2.5 right-2.5 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase shadow backdrop-blur-sm"
              style={{ color: accent }}
            >
              {leadTag}
            </span>
          )}
        </div>

        <div className="p-3.5">
          {time ? (
            <p
              className="text-xs font-bold tracking-wide tabular-nums"
              style={{ color: accent }}
            >
              {time}
            </p>
          ) : (
            <p className="text-xs font-bold tracking-wide text-tone-0/50 uppercase">
              {display_date}
            </p>
          )}

          <p
            className="mt-1 line-clamp-2 text-base leading-tight font-bold text-tone-0"
            title={`${jamName} at ${spotName}`}
          >
            {jamName}
          </p>
          <p className="mt-0.5 truncate text-sm text-tone-0/70">{spotName}</p>

          <p className="mt-2.5 flex items-start gap-1.5 text-xs text-tone-0/55">
            <MapPin className="mt-0.5 size-3 shrink-0" strokeWidth={2} />
            <span className="line-clamp-2">{address}</span>
          </p>

          {restTags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {restTags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-tone-0/25 px-2 py-0.5 text-[10px] font-medium text-tone-0/80"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </Card>
  );
}
