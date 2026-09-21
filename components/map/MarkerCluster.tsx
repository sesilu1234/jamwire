'use client';
import { useEffect, useState, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import Image from 'next/image';
import Link from 'next/link';
import { useMapContext } from '@/components/map/MapContext';
import { Card, CardContent } from '@/components/ui/card';
import './markersStyle.css';

type Marker = {
  id: string;
  lat: number;
  lng: number;
};

type JamCardMarkerProps = {
  slug: string;
  images?: string;
  jam_title: string;
  location_title: string;
  location_address: string;
  time: string;
  styles?: string[];
  display_date:string;
};
import { X } from 'lucide-react';


export default function MapMarkersCluster() {
  const map = useMap();

  const { markersData, setMarkersData } = useMapContext();

  // const [markersDetails, setMarkersDetails] = useState<Record<number, MarkerDetail>>({});
  const [selectedMarker, setSelectedMarker] =
    useState<JamCardMarkerProps | null>(null);

  const [showSkeleton, setShowSkeleton] = useState<boolean>(false);

  async function fetchMarker(id: string) {
    try {
      setShowSkeleton(true); // force skeleton visible immediately

      const res = await fetch(`/api/public/get-jam-by-id/${id}`);
      const markerDetail: JamCardMarkerProps = await res.json();

      setSelectedMarker(markerDetail);
      setShowSkeleton(false);
    } catch (err) {
      console.error('Failed to fetch marker details:', err);
      setShowSkeleton(false);
    }
  }

  const onClickMarker = async (id: string) => {
    setSelectedMarker(null);

    setShowSkeleton(true);

    await fetchMarker(id);
  };

  useEffect(() => {
    if (!map || markersData.length === 0) return;

    // @ts-expect-error makerExists
    const clusterGroup = L.markerClusterGroup({
      // @ts-expect-error makerExists
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();

        // Size carries the count, not colour. The old blue/yellow/red ramp
        // implied severity — red for "lots of jams" reads as a warning — and
        // none of the three related to the brand.
        const size = count > 50 ? 52 : count > 10 ? 44 : 36;

        return L.divIcon({
          html: `
        <div class="custom-cluster" style="width:${size}px;height:${size}px;font-size:${
          size > 44 ? 15 : 13
        }px;">
          ${count}
        </div>
      `,
          className: '', // important to prevent default styles
          iconSize: [size, size],
        });
      },
    });

    // markersData.forEach((m) => {
    //   const marker = L.marker([m.lat, m.lng]);
    //   marker.on('click', () => onClickMarker(m.id));
    //   clusterGroup.addLayer(marker);
    // });

    // Inline SVG rather than <img src="/markerLeaf.svg">: an <img> can't be
    // recoloured, so the `color` rule in markersStyle.css was doing nothing and
    // the pins stayed magenta regardless of the theme.
    const markerIcon = L.divIcon({
      html: `
        <svg class="marker-svg" viewBox="0 0 26 36" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M13 0C5.82 0 0 5.82 0 13c0 9.2 11.2 21.3 11.68 21.8a1.8 1.8 0 0 0 2.64 0C14.8 34.3 26 22.2 26 13 26 5.82 20.18 0 13 0Z"
            fill="#F2A93B" stroke="#1B1F2A" stroke-width="1.6"
          />
          <circle cx="13" cy="13" r="4.6" fill="#1B1F2A" />
        </svg>`,
      className: '',
      iconSize: [26, 36],
      iconAnchor: [13, 36],
    });

    markersData.forEach((m) => {
      const marker = L.marker([m.lat, m.lng], { icon: markerIcon });

      marker.on('click', () => onClickMarker(m.id));
      clusterGroup.addLayer(marker);
    });

    map.addLayer(clusterGroup);

    // ✅ Cleanup function: remove the cluster from map
    return () => {
      map.removeLayer(clusterGroup);
    };
  }, [map, markersData]);

  if (selectedMarker)
    return (
      <div className="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2     lg:translate-x-0 lg:-translate-y-0      lg:top-4 lg:right-4 z-[401] max-w-[90%] w-80 overflow-hidden rounded-sm sm:rounded-2xl shadow-2xl">
        {/* Transparent Header Overlay */}
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-end p-3">
          {/* Subtle Badge */}

          {/* Circular Glass Button */}
          <button
            onClick={() => setSelectedMarker(null)}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-black transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <JamCardMarker
          jamData={selectedMarker}
          className="border-none shadow-2xl"
        />
      </div>
    );

  if (showSkeleton) return <CardSkeleton />; // nothing to show

  return null;
}

// export function JamCardMarker({
//   jamData,
//   classname,
// }: {
//   jamData: JamCardMarkerProps;
//   classname?: string;
// }) {
//   return (
//     <Card
//       className={`flex flex-col p-2    w-82   border-1 border-black/30  ${classname}`}
//     >
//       <Link href={`/jam/${jamData.slug}`} prefetch={false}>
//         {/* Image left (desktop) / top (mobile) */}
//         <div className="relative   h-64">
//           {jamData.images && (
//             <Image
//               src={jamData.images}
//               alt={`${jamData.jam_title} at ${jamData.location_title}`}
//               fill
//               className="object-cover"
//             />
//           )}
//         </div>
//         <CardContent className="flex flex-col gap-2 justify-between text-xs mt-3 mb-1  ">
//           <div className="font-bold text-lg text-black line-clamp-2 leading-tight">
//             {jamData.jam_title} at {jamData.location_title}
//           </div>

//           <div className="text-xs text-gray-500">
//             {jamData.location_address}
//           </div>
//           <div className="text-sm text-gray-500">{jamData.time}</div>
//           {jamData.styles && (
//             <div className="flex flex-wrap gap-1">
//               {jamData.styles.map((tag, i) => (
//                 <span
//                   key={i}
//                   className="bg-gray-200 rounded px-2 py-1 text-xs text-black"
//                 >
//                   {tag}
//                 </span>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Link>
//     </Card>
//   );
// }

import { Geist } from 'next/font/google';

// Geist is the modern standard for clean, "Vercel-style" tech aesthetics
const geist = Geist({ subsets: ['latin'] });

export function JamCardMarker({
  jamData,
  className,
}: {
  jamData: JamCardMarkerProps;
  className?: string;
}) {
  return (
    <Card
      className={`${geist.className} group overflow-hidden rounded-lg sm:rounded-2xl  bg-neutral-50 transition-all duration-300 hover:-translate-y-1   ${className}`}
    >
      <Link href={`/jam/${jamData.slug}`} prefetch={false} className="block">
        {/* Image Container */}
        <div className="relative h-52 overflow-hidden">
          {jamData.images ? (
            <Image
              src={jamData.images}
              alt={jamData.jam_title}
              fill
              // This tells the browser:
              // - On small screens (mobile), the image is 100% width
              // - On tablets (768px+), it's roughly 50% width
              // - On desktops (1024px+), it's roughly 33% width
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-400">
              <span className="text-xs font-medium uppercase tracking-widest">
                No Image
              </span>
            </div>
          )}

          {/* Style Tags - Floating atop image for a more modern look */}
          {jamData.styles && (
            <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
              {jamData.styles.slice(0, 2).map((tag, i) => (
                <span
                  key={i}
                  className="rounded-xs bg-white/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-800 "
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <CardContent className="p-5">
          {/* Title */}
          <h3 className="line-clamp-1 text-lg font-semibold tracking-tight text-slate-900 transition-colors">
            {jamData.jam_title}
          </h3>

          {/* Location Info */}
          <div className="mt-2 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <p className="line-clamp-1 text-sm font-medium text-slate-600">
                {jamData.location_title}
              </p>
            </div>
            <p className="line-clamp-1 text-xs text-slate-400 font-normal">
              {jamData.location_address}
            </p>
          </div>

 <div className="mt-3 flex items-center gap-1.5">
    <svg
      className="h-3.5 w-3.5 text-slate-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
    <p className="text-xs font-medium text-slate-500">
      {jamData.display_date}
    </p>
  </div>

          {/* Footer - Date/Time or CTA */}
          <div className="mt-0 flex items-center justify-between pt-3">
            <span className="text-[11px] font-bold uppercase tracking-tighter text-slate-700 group-hover:text-slate-700/80">
              View Details
            </span>
            <svg
              className="h-4 w-4 -translate-x-2 text-zinc-800 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

const tags = ['blues', 'rap'];

/**
 * Placeholder for JamCardMarker while its details are fetched.
 *
 * The blocks are explicit greys, not the `Skeleton` default. That default is
 * `bg-accent`, a theme token that on most of the themes here lands about as
 * light as this card's own `bg-neutral-50` — so the skeleton rendered as a
 * blank white rectangle and read as a bug rather than as loading. The card
 * is hardcoded light in JamCardMarker too, so hardcoded greys is the
 * consistent choice; a theme token would have to track that card, not the
 * page around it.
 *
 * Same box, same positioning and the same run of rows as the real card, so
 * nothing jumps when the data lands.
 */
export function CardSkeleton() {
  return (
    <Card
      className="absolute top-1/2 right-1/2 z-[401] flex w-80 max-w-[90%] translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border-none bg-neutral-50 shadow-2xl sm:rounded-2xl lg:top-4 lg:right-4 lg:translate-x-0 lg:translate-y-0"
    >
      {/* Image, h-52 to match */}
      <div className="relative h-52 w-full">
        <div className="h-full w-full animate-pulse bg-neutral-200" />

        {/* The two style tags that float over the image */}
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          <div className="h-5 w-14 animate-pulse rounded-xs bg-neutral-300" />
          <div className="h-5 w-14 animate-pulse rounded-xs bg-neutral-300" />
        </div>
      </div>

      <CardContent className="p-5">
        {/* Title */}
        <div className="h-5 w-3/4 animate-pulse rounded bg-neutral-200" />

        {/* location_title, location_address */}
        <div className="mt-3 space-y-2">
          <div className="h-3.5 w-2/3 animate-pulse rounded bg-neutral-200" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-200" />
        </div>

        {/* The dated row: calendar glyph plus display_date */}
        <div className="mt-4 flex items-center gap-1.5">
          <div className="size-3.5 animate-pulse rounded bg-neutral-200" />
          <div className="h-3 w-32 animate-pulse rounded bg-neutral-200" />
        </div>

        {/* "View Details" */}
        <div className="mt-3 pt-3">
          <div className="h-3 w-20 animate-pulse rounded bg-neutral-300" />
        </div>
      </CardContent>
    </Card>
  );
}
