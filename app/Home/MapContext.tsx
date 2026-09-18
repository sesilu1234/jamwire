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
export type { LocationSearch, SearchLocation } from '@/components/map/MapContext';

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
}


import { JamCard } from '@/types/jam';


export const MapProvider = ({
  children,
  initialUserLocation,
  resCards,
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

  useEffect(() => {
    if (!map) return; // wait for map to be ready

    const raw = Cookies.get('user_location');

    try {

      
      if (raw) {
        const parsed = JSON.parse(decodeURIComponent(raw));
   

        // Only update if timestamp is fresh and location differs
        const isFresh = Date.now() - parsed.timestamp < FOUR_HOURS;
        const hasChanged =
          !initialUserLocation ||
          initialUserLocation.latitude !== parsed.latitude ||
          initialUserLocation.longitude !== parsed.longitude;

        if (isFresh && hasChanged) {
          const newLocation = {
            city: parsed.city,
            latitude: parsed.latitude,
            longitude: parsed.longitude,
          };

          setGoogleSearchLocation(parsed.city || '');

          setLocationSearch({
            coordinates: {
              lat: parsed.latitude,
              lng: parsed.longitude,
            },
          });

          map.flyTo([parsed.latitude, parsed.longitude], 11, { duration: 1.5 });
          return; // done
        }
      }
    } catch {
      // ignore malformed cookie
    }

    // fallback: fly to initial user location if cookie is missing or invalid
    if (initialUserLocation) {
      map.flyTo(
        [initialUserLocation.latitude, initialUserLocation.longitude],
        11,
        {
          duration: 1.5,
        },
      );
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
