'use client';
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import type { Map as LeafletMap } from 'leaflet';
import {
  MapContext,
  type LocationSearch,
  type Marker,
} from '@/components/map/MapContext';
export type {
  LocationSearch,
  SearchLocation,
} from '@/components/map/MapContext';

import Cookies from 'js-cookie';
const FOUR_HOURS = 4 * 60 * 60 * 1000;

interface MapProviderProps {
  children: React.ReactNode;
  initialUserLocation: {
    latitude: number;
    longitude: number;
    city: string;
  };
  resCards: JamCard[];
  currentUsedPath: string;
}

import { JamCard } from '@/types/jam';
import { usePathname } from 'next/navigation';

export const MapProvider = ({
  children,
  initialUserLocation,
  resCards,
  currentUsedPath,
}: MapProviderProps) => {
  const [map, setMap] = useState<LeafletMap | null>(null);
  // 60km matches the default distance in the filter panel.
  const [searchRadiusKm, setSearchRadiusKm] = useState<number | null>(60);
  const [locationSearch, setLocationSearch] = useState<LocationSearch | null>({
    coordinates: {
      lat: initialUserLocation.latitude,
      lng: initialUserLocation.longitude,
    },
  });
  const [googleSearchLocation, setGoogleSearchLocation] = useState(
    initialUserLocation.city || '',
  );

  const [markersData, setMarkersData] = useState<Marker[]>(
    resCards?.map((jam: JamCard) => ({
      id: jam.id,
      lat: jam.lat,
      lng: jam.lng,
    })),
  );
  /**
   * Both sides get decoded before they are compared, because the same city
   * arrives spelled two different ways.
   *
   * For the URL /Toledo,%20Spain, usePathname() reports "Toledo,%20Spain"
   * while the server's param is "Toledo%2C%20Spain" - Next escapes the comma,
   * the browser does not. Compared raw they never match, so the effect below
   * treated the page as the wrong city and re-geocoded the encoded string.
   * Google reads the literal "%20" as noise and answers Toledo, Ohio, so
   * reloading a two-word city moved the map to the wrong continent.
   *
   * Decoded, both read "Toledo, Spain" and the effect correctly does nothing.
   */
  const decodePath = (value: string) => {
    try {
      return decodeURIComponent(value);
    } catch {
      // A malformed escape sequence cannot be decoded; use it as given.
      return value;
    }
  };

  const pathname = decodePath(usePathname()?.substring(1) || '');
  const targetPath = decodePath(currentUsedPath ?? '');

  useEffect(() => {
    if (!map) return; // wait for map

    try {
      if (pathname !== targetPath) {
        // Fetch coordinates from internal API
        fetch(`/api/public/geocoding?address=${encodeURIComponent(pathname)}`)
          .then((res) => res.json())
          .then((parsed) => {
            if (!parsed || !parsed[0]) return;

            const firstResult = parsed[0];
            const { formatted_address: city, geometry } = firstResult;

            setGoogleSearchLocation(city || '');
            setLocationSearch({
              coordinates: {
                lat: geometry.location.lat,
                lng: geometry.location.lng,
              },
            });

            map.flyTo([geometry.location.lat, geometry.location.lng], 11, {
              duration: 1.5,
            });
          });

        return; // done
      }
    } catch {
      // ignore malformed state
    }

    // fallback: initial user location
    if (initialUserLocation) {
      map.flyTo(
        [initialUserLocation.latitude, initialUserLocation.longitude],
        11,
        { duration: 1.5 },
      );
      const cookieData = {
        city: initialUserLocation.city || '',
        latitude: initialUserLocation.latitude,
        longitude: initialUserLocation.longitude,
        timestamp: Date.now(),
      };
      document.cookie = `user_location=${encodeURIComponent(JSON.stringify(cookieData))}; path=/; max-age=14400; SameSite=Lax`;
    }
  }, [map]);

  return (
    <MapContext.Provider
      value={{
        map,
        setMap,
        locationSearch,
        setLocationSearch,
        googleSearchLocation,
        setGoogleSearchLocation,
        markersData,
        setMarkersData,
        searchRadiusKm,
        setSearchRadiusKm,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};
