'use client';
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_CLIENT_API_KEY!;

/**
 * Visual variant of `@/app/createJam/primary`, scoped to /host/create.
 * Same props, same behaviour — only the markup/styling differs.
 */

type PrimaryProps = {
  jamTitleRef: React.RefObject<string>;
  locationTitleRef: React.RefObject<string>;
  locationAddressRef: React.RefObject<string>;
  coordinatesRef: React.RefObject<{ lat: string | null; lng: string | null }>;
};

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FieldLabel, inputSkin } from './ui';

export default function PrimaryFields({
  jamTitleRef,
  locationTitleRef,
  locationAddressRef,
  coordinatesRef,
}: PrimaryProps) {
  const [dataLocation, setdataLocation] = useState({
    jam_name: jamTitleRef.current,
    location_name: locationTitleRef.current,
    address: locationAddressRef.current,
    coordinates: coordinatesRef.current,
  });

  jamTitleRef.current = dataLocation.jam_name;
  locationTitleRef.current = dataLocation.location_name;
  locationAddressRef.current = dataLocation.address;
  coordinatesRef.current = dataLocation.coordinates;

  const hasCoords =
    dataLocation?.coordinates?.lat && dataLocation?.coordinates?.lng;
  const center = hasCoords
    ? `${dataLocation.coordinates.lat},${dataLocation.coordinates.lng}`
    : '0,0';
  const zoom = hasCoords ? 15 : 2;
  const marker = hasCoords ? `&markers=color:red%7C${center}` : '';

  useEffect(() => {
    const channel = new BroadcastChannel('location_broadcast');
    channel.onmessage = (event) => {
      // The map popup can post null if nothing was picked — ignore it
      // instead of crashing on `.name`.
      if (!event.data) return;

      setdataLocation((prev) => ({
        jam_name: prev.jam_name,
        location_name: prev.location_name || `${event.data.name}`,
        address: event.data.address,
        coordinates: event.data.coordinates,
      }));
    };

    return () => channel.close();
  }, []);

  const openPopup = () => {
    window.open('/createJam/selectOnMap', 'createJam', 'width=600,height=500');
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
      {/* ---- names ---- */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="jam-name">Jam name</FieldLabel>
          <input
            id="jam-name"
            className={inputSkin}
            value={dataLocation.jam_name}
            placeholder="e.g. Tuesday Blues Jam"
            onChange={(e) =>
              setdataLocation((prev) => ({
                ...prev,
                jam_name: e.target.value,
              }))
            }
          />
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="location-name">Location name</FieldLabel>
          <input
            id="location-name"
            className={inputSkin}
            value={dataLocation.location_name}
            placeholder="e.g. Café Central"
            onChange={(e) =>
              setdataLocation((prev) => ({
                ...prev,
                location_name: e.target.value,
              }))
            }
          />
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel>Address</FieldLabel>
          <div
            className="min-h-[42px] rounded-xl border border-dashed border-zinc-300 bg-zinc-50/60 px-3.5 py-2.5 text-[14px]"
            onChange={(e) =>
              setdataLocation((prev) => ({
                ...prev,
                address: (e.target as HTMLInputElement).value,
              }))
            }
          >
            {dataLocation.address ? (
              <span className="text-zinc-800">{dataLocation.address}</span>
            ) : (
              <span className="select-none text-zinc-400">
                Pick a point on the map to set the address
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ---- map ---- */}
      <div className="flex flex-col gap-2">
        <FieldLabel>Location on the map</FieldLabel>

        <button
          type="button"
          onClick={openPopup}
          className={`group relative block w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 cursor-pointer ${
            hasCoords ? '' : 'animate-glow-ring-strong'
          }`}
        >
          <Image
            src={`https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=${zoom}&size=400x200&scale=2${marker}&style=feature:poi|element:labels|visibility:off&key=${API_KEY}`}
            alt="Map"
            width={400}
            height={200}
            className="h-[190px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />

          <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-gradient-to-t from-zinc-950/75 to-transparent px-3 pb-2.5 pt-8 text-[12px] font-medium text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="14px"
              viewBox="0 -960 960 960"
              width="14px"
              fill="currentColor"
            >
              <path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Z" />
            </svg>
            {hasCoords ? 'Change location' : 'Click to select on the map'}
          </span>
        </button>

        <p className="text-[12px] text-zinc-500">
          Opens a small map window — pick the spot and it fills the address for
          you.
        </p>
      </div>
    </div>
  );
}
