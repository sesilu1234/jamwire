import JamCardShadcn from './CardJam';
import { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { JamCard } from '@/types/jam';
import Link from 'next/link';

type JamCarouselProps = {
  jams: JamCard[];
  loading: boolean;
  searchType: 'local' | 'global';
};

export default function JamCarousel({
  jams,
  loading,
  searchType,
}: JamCarouselProps) {
  // ...rest of your component

  const [collapsed, setCollapsed] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    searchType === 'local' ? setCollapsed(false) : setCollapsed(true);
  }, [searchType]);

  // observer-based uncollapse

  return (
    <div
      className={`flex flex-col absolute z-[50] gap-1
        inset-x-2 bottom-2
        md:inset-x-auto md:bottom-auto md:max-w-[95%] md:top-8 md:left-18`}
    >
      {/* Collapse button */}
      <div
        className="p-2 flex items-center justify-center rounded-t-sm
               bg-collapse-butt/80 text-white cursor-pointer 
               hover:bg-collapse-butt/70 transition-all duration-200"
        onClick={() => setCollapsed(!collapsed)}
      >
        {!collapsed ? 'Collapse cards' : 'Show cards'}
      </div>

      {/* Card container */}
      <div
        ref={containerRef}
        className={`
    card-container flex flex-col items-center bg-tone-3/45 rounded-b-xl border border-black/20 gap-6
    overflow-y-auto transition-all duration-700 ease-in-out
    ${
      collapsed
        ? 'max-h-0 p-0 opacity-0'
        : 'max-h-[45vh] p-4 md:max-h-108 md:p-6 md:pr-4 opacity-100'
    }
   
  `}
      >
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : jams.length === 0 ? (
          searchType === 'global' ? (
            <div className="p-2  text-center font-light w-64">
              Cards not available with global search
            </div>
          ) : (
    <div className="flex flex-col items-center justify-center p-8 text-center w-full max-w-sm mx-auto animate-fadeIn">
 
      <h3 className="text-lg font-bold uppercase tracking-tight mb-2">
        No active jam sessions found here right now
      </h3>
      <p className="text-sm text-text-2 font-medium mb-6">
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
      
      <p className="mt-4 text-[10px] text-tone-0/80 uppercase tracking-widest">
        Be the legend who starts the first one in this city
      </p>
    </div>
  )
        ) : (
          jams.map((jam: JamCard, index: number) => (
            <JamCardShadcn
              key={index}
              classname="cursor-pointer border-2 border-tone-0/75"
              jamName={jam.jam_title}
              spotName={jam.location_title}
              tags={jam.styles}
              address={jam.location_address}
              display_date={jam.display_date}
              src={jam.image}
              slug={jam.slug}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="flex flex-col space-y-3  w-64 ">
      <Skeleton className="h-[125px] w-[250px] rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}
