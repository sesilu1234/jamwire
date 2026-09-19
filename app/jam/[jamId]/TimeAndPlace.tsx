import { CalendarClock, MapPin, ExternalLink } from 'lucide-react';

type TimeAndPlaceProps = {
  location_title: string;
  address?: string;
  fallbackLat: number;
  fallbackLng: number;
  slug: string;
  time: string;
};

export default function TimeAndPlace({
  location_title,
  address,
  fallbackLat,
  fallbackLng,
  slug,
  time,
}: TimeAndPlaceProps) {
  const hasAddress = address && address.trim().length > 0;

  const googleMapsUrl = hasAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        address!,
      )}`
    : `https://www.google.com/maps/search/?api=1&query=${fallbackLat},${fallbackLng}`;

  return (
    <div className="flex flex-col gap-6">
      {/* When */}
      <div className="flex items-start gap-4">
        {/* Icons were 43px hand-drawn SVGs at three different sizes, in blue
            and red — the only two off-palette colours on the page. */}
        <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-tone-0/7 text-tone-0/60">
          <CalendarClock className="size-5" strokeWidth={1.75} />
        </span>

        <div className="min-w-0">
          <p className="text-xs font-bold tracking-[0.18em] text-tone-0/40 uppercase">
            When
          </p>
          <p className="mt-1 text-xl leading-tight font-semibold">{time}</p>
        </div>
      </div>

      <div className="h-px w-full bg-tone-0/10" />

      {/* Where — a real link rather than a div with an onClick, so it can be
          opened in a new tab, copied, and reached from the keyboard. */}
      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-start gap-4"
      >
        <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-tone-0/7 text-tone-0/60 transition-colors group-hover:bg-tone-0/12 group-hover:text-tone-0/85">
          <MapPin className="size-5" strokeWidth={1.75} />
        </span>

        <div className="min-w-0">
          <p className="text-xs font-bold tracking-[0.18em] text-tone-0/40 uppercase">
            Where
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-xl leading-tight font-semibold">
            <span className="truncate">{location_title}</span>
            <ExternalLink className="size-3.5 shrink-0 text-tone-0/35 transition-colors group-hover:text-tone-0/70" />
          </p>
          {address && (
            <p className="mt-1 text-sm leading-relaxed text-tone-0/60 group-hover:text-tone-0/80">
              {address}
            </p>
          )}
        </div>
      </a>
    </div>
  );
}
