import JamCardShadcn from '@/components/map/CardJam';
import { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { JamCard } from '@/types/jam';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';

type JamCarouselProps = {
  jams: JamCard[];
  loading: boolean;
  searchType: 'local' | 'global';
};

type Snap = 'peek' | 'half' | 'full';

/**
 * Sheet height at rest in the peek state.
 *
 * It has to fit the handle and one row card exactly, because in peek the
 * sheet is transparent and `overflow-visible` — anything taller spills past
 * the sheet and gets clipped by the map, which is `overflow-hidden`.
 * Handle 52 + card 104 + the list's own 8 top and 16 bottom = 180.
 */
const PEEK_H = 188;

/** Fractions of the map's height for the two expanded stops. */
const HALF_F = 0.52;
const FULL_F = 0.9;

/**
 * The jam list over the map: a draggable bottom sheet on the phone, the
 * original floating panel from md up.
 *
 * Phone. Three stops, in the Google Maps / Airbnb shape. `peek` is a strip
 * above the tab bar holding a horizontal carousel of row cards; `half` and
 * `full` are the vertical list of poster cards. Drag the handle to move
 * between them, or tap it to toggle peek and half. There is no collapse bar
 * at this size — a handle and the count say the same thing, and are the
 * control as well as the label.
 *
 * Desktop. Untouched: the panel at the top left of the map, with the
 * "Hide cards" button and its max-height collapse.
 *
 * Note the `max-md:` on every `group-data-[snap=…]` below, here and in
 * CardJam. `snap` starts at 'peek' on the server for everyone, desktop
 * included, so without it the desktop panel would lay itself out as a
 * horizontal strip until hydration corrected it.
 */
export default function JamCarousel({
  jams,
  loading,
  searchType,
}: JamCarouselProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [snap, setSnap] = useState<Snap>('peek');

  /** Live height while a drag is in progress; null when resting on a stop. */
  const [dragH, setDragH] = useState<number | null>(null);

  /** Measured height of the map — the stops are fractions of it. */
  const [mapH, setMapH] = useState(0);

  const sheetRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ y: number; h: number; moved: boolean } | null>(null);

  const stops: Record<Snap, number> = {
    peek: PEEK_H,
    half: mapH ? Math.max(PEEK_H, Math.round(mapH * HALF_F)) : PEEK_H,
    full: mapH ? Math.max(PEEK_H, Math.round(mapH * FULL_F)) : PEEK_H,
  };

  // Measured against the parent, the map, rather than the viewport: the map
  // is already 100dvh minus the two fixed bars, and repeating that sum here
  // is exactly how the two drift apart.
  useEffect(() => {
    const el = sheetRef.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setMapH(entry.contentRect.height),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (searchType === 'local') {
      setCollapsed(false);
    } else {
      setCollapsed(true);
      setSnap('peek');
    }
  }, [searchType]);

  // Nothing to peek at means peek is the wrong state: the sheet is
  // transparent there, so the empty state was white text straight onto the
  // map and unreadable. Open it so those words get the sheet behind them.
  // A nudge, not a lock — dragging it back down still works.
  useEffect(() => {
    if (loading) return;
    if (searchType === 'local' && jams.length === 0) setSnap('half');
  }, [jams, loading, searchType]);

  // The strip keeps the scroll offset of the previous results, so without
  // this a new search opens part-way along the list.
  useEffect(() => {
    listRef.current?.scrollTo({ left: 0, top: 0 });
  }, [jams]);

  function nearestSnap(h: number): Snap {
    return (Object.keys(stops) as Snap[]).reduce((best, key) =>
      Math.abs(stops[key] - h) < Math.abs(stops[best] - h) ? key : best,
    );
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    drag.current = { y: e.clientY, h: dragH ?? stops[snap], moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;
    const delta = d.y - e.clientY;
    // A few pixels of slop, so a tap that wobbles is still a tap.
    if (Math.abs(delta) > 4) d.moved = true;
    setDragH(Math.min(Math.max(d.h + delta, PEEK_H), stops.full));
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);

    if (d.moved) setSnap(nearestSnap(dragH ?? d.h));
    else setSnap(snap === 'peek' ? 'half' : 'peek');

    setDragH(null);
  }

  const dragging = dragH !== null;
  const countLabel = loading
    ? 'Searching…'
    : jams.length === 0
      ? 'No jams here'
      : `${jams.length} ${jams.length === 1 ? 'jam' : 'jams'}`;

  return (
    <div
      ref={sheetRef}
      data-snap={snap}
      style={
        { '--sheet-h': `${dragH ?? stops[snap]}px` } as React.CSSProperties
      }
      className={`group/sheet absolute inset-x-0 bottom-0 z-50 flex h-[var(--sheet-h)] flex-col overflow-hidden rounded-t-2xl border-x-0 border-b-0 border-t border-tone-0/10 bg-surface-inset/62 shadow-[0_-8px_24px_rgba(0,0,0,0.28)] backdrop-blur-[2px] backdrop-saturate-[0.7]
        ${searchType === 'global' ? 'max-md:hidden' : ''}
        data-[snap=peek]:overflow-visible data-[snap=peek]:border-t-transparent data-[snap=peek]:bg-transparent data-[snap=peek]:shadow-none data-[snap=peek]:backdrop-filter-none
        ${dragging ? '' : 'transition-[height] duration-300 ease-out'}
        md:inset-auto md:top-8 md:left-18 md:h-auto md:max-w-[95%] md:gap-1 md:overflow-visible md:rounded-none md:border-0 md:bg-transparent md:shadow-none md:backdrop-filter-none`}
    >
      {/* Phone handle. The drag target and the count in one, which is why
          there is no separate bar: on a sheet the grip is the header.
          touch-action none, or the browser pans the map under the finger. */}
      <div
        role="button"
        tabIndex={0}
        aria-label={snap === 'peek' ? 'Expand jam list' : 'Collapse jam list'}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setSnap(snap === 'peek' ? 'half' : 'peek');
          }
        }}
        style={{ touchAction: 'none' }}
        className="flex shrink-0 cursor-grab flex-col items-center gap-1.5 px-4 pt-2 pb-2 select-none active:cursor-grabbing group-data-[snap=peek]/sheet:items-start md:hidden"
      >
        {/* Over a transparent sheet the grip sits on the map, so in peek it
            needs its own contrast rather than the sheet's. */}
        <span className="h-1 w-10 rounded-full bg-tone-0/25 group-data-[snap=peek]/sheet:self-center group-data-[snap=peek]/sheet:bg-white/70 group-data-[snap=peek]/sheet:shadow" />

        {/* Same reason: in peek this collapses from a full-width row into a
            pill, so the count stays readable against whatever is under it. */}
        <span className="flex w-full items-center justify-between group-data-[snap=peek]/sheet:w-auto group-data-[snap=peek]/sheet:gap-1.5 group-data-[snap=peek]/sheet:rounded-full group-data-[snap=peek]/sheet:bg-[#0c0e12d9] group-data-[snap=peek]/sheet:px-3 group-data-[snap=peek]/sheet:py-1 group-data-[snap=peek]/sheet:shadow-lg">
          <span className="text-sm font-semibold text-tone-0 group-data-[snap=peek]/sheet:text-xs group-data-[snap=peek]/sheet:text-white">
            {countLabel}
          </span>
          <ChevronUp
            className={`size-4 text-tone-0/40 transition-transform duration-200 group-data-[snap=peek]/sheet:text-white/70 ${
              snap === 'peek' ? '' : 'rotate-180'
            }`}
          />
        </span>
      </div>

      {/* Desktop header. Was a full-width bar reading "Collapse cards" with no
          indication of how many there were; the count is the useful part. */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        aria-expanded={!collapsed}
        className={`hidden cursor-pointer items-center justify-between gap-3 border border-tone-0/10 bg-surface-raised/90 px-4 py-2.5 backdrop-blur-md transition-colors hover:bg-surface-raised md:flex ${
          collapsed ? 'rounded-xl' : 'rounded-t-xl border-b-0'
        }`}
      >
        <span className="text-sm font-semibold text-tone-0">
          {collapsed ? 'Show cards' : 'Hide cards'}
        </span>

        <span className="flex items-center gap-2">
          {!loading && jams.length > 0 && (
            <span className="rounded-full bg-tone-0/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-tone-0/70">
              {jams.length}
            </span>
          )}
          <ChevronDown
            className={`size-4 text-tone-0/50 transition-transform duration-200 ${
              collapsed ? '' : 'rotate-180'
            }`}
          />
        </span>
      </button>

      {/* Card container */}
      <div
        ref={listRef}
        className={`card-container flex min-h-0 flex-1 flex-col items-center gap-4 overflow-y-auto px-4 pb-4
          max-md:group-data-[snap=peek]/sheet:flex-row max-md:group-data-[snap=peek]/sheet:gap-3 max-md:group-data-[snap=peek]/sheet:overflow-x-auto max-md:group-data-[snap=peek]/sheet:overflow-y-hidden max-md:group-data-[snap=peek]/sheet:px-3 max-md:group-data-[snap=peek]/sheet:pt-2 max-md:group-data-[snap=peek]/sheet:pb-6
          md:flex-none md:gap-6 md:rounded-b-xl md:border md:border-black/20 md:bg-tone-3/45 md:transition-all md:duration-700 md:ease-in-out ${
            collapsed
              ? 'md:max-h-0 md:px-0 md:pt-0 md:pb-0 md:opacity-0'
              : 'md:max-h-108 md:px-6 md:pt-6 md:pr-4 md:pb-6 md:opacity-100'
          }`}
      >
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : jams.length === 0 ? (
          searchType === 'global' ? (
            <div className="w-full shrink-0 p-2 text-center font-light">
              Cards not available with global search
            </div>
          ) : (
            <div className="animate-fadeIn mx-auto flex w-full max-w-sm shrink-0 flex-col items-center justify-center p-4 text-center md:p-8">
              <h3 className="mb-2 text-lg font-bold tracking-tight uppercase">
                No active jam sessions found here right now
              </h3>
              <p className="mb-6 text-sm font-medium text-text-2">
                The stage is currently quiet... Help us find the music!
              </p>

              <Link
                href="/host"
                className="
    /* Layout & Text */
    px-4 py-4 md:px-4 md:py-3
    text-white font-black uppercase text-[10px] md:text-xs tracking-[0.2em]
    text-center whitespace-nowrap

    /* Colors & Border */
    bg-[#E63946] border-2 border-black

    /* Shadow & Animation */
    shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
    transition-all duration-100 ease-in-out

    /* Hover (Desktop) */
    hover:bg-[#F1515E]
    hover:shadow-none
    hover:translate-x-[2px]
    hover:translate-y-[2px]

    /* Active (Mobile & Click) */
    active:bg-[#C12E39]
    active:shadow-none
    active:translate-x-[4px]
    active:translate-y-[4px]

    /* Box Model */
    inline-block flex items-center justify-center
  "
              >
                + Add a Jam Spot
              </Link>

              <p className="mt-4 text-[10px] tracking-widest text-tone-0/80 uppercase">
                Be the legend who starts the first one in this city
              </p>
            </div>
          )
        ) : (
          jams.map((jam: JamCard, index: number) => (
            <JamCardShadcn
              key={index}
              classname="cursor-pointer border border-tone-0/10 bg-card-jams shadow-lg shadow-black/40"
              jamName={jam.jam_title}
              spotName={jam.location_title}
              tags={jam.styles}
              address={jam.location_address}
              display_date={jam.display_date}
              modality={jam.modality}
              src={jam.image}
              slug={jam.slug}
            />
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Shaped like whichever card it stands in for — the row in peek, the poster
 * otherwise. One fixed shape made the sheet jump the moment the real cards
 * landed.
 */
export function SkeletonCard() {
  return (
    <div className="flex w-64 shrink-0 flex-col space-y-3 max-md:group-data-[snap=peek]/sheet:w-[78vw] max-md:group-data-[snap=peek]/sheet:max-w-[320px] max-md:group-data-[snap=peek]/sheet:flex-row max-md:group-data-[snap=peek]/sheet:gap-3 max-md:group-data-[snap=peek]/sheet:space-y-0">
      <Skeleton className="h-[125px] w-full rounded-xl max-md:group-data-[snap=peek]/sheet:h-20 max-md:group-data-[snap=peek]/sheet:w-20 max-md:group-data-[snap=peek]/sheet:shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
