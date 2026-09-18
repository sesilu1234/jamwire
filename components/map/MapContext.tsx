'use client';

import React, { createContext, useContext } from 'react';
import type { Map as LeafletMap } from 'leaflet';

/**
 * The map context object and its hook, shared by the home map and the city
 * pages.
 *
 * Both routes used to declare their own `createContext` call, which meant the
 * map components had to be duplicated per route as well — a component can only
 * read the one context object it imports. The *value* shape was identical in
 * both; only the bootstrap differs (home restores from a cookie, a city page
 * geocodes its slug). So the context lives here and each route keeps its own
 * `MapProvider` that fills it.
 */

export type LocationSearch = {
  coordinates: { lat: number; lng: number };
};

export type SearchLocation = string;

export type Marker = {
  id: string;
  lat: number;
  lng: number;
};

export type MapContextType = {
  map: LeafletMap | null;
  setMap: React.Dispatch<React.SetStateAction<LeafletMap | null>>;
  locationSearch: LocationSearch | null;
  googleSearchLocation: SearchLocation | null;
  setGoogleSearchLocation: React.Dispatch<React.SetStateAction<SearchLocation>>;
  setLocationSearch: React.Dispatch<
    React.SetStateAction<LocationSearch | null>
  >;
  markersData: Marker[];
  setMarkersData: React.Dispatch<React.SetStateAction<Marker[]>>;
  /**
   * Radius of the applied local search, in km, or null while showing the whole
   * world. The map draws this so the distance slider has something to mean —
   * without it there is no way to see what "60km" covers.
   */
  searchRadiusKm: number | null;
  setSearchRadiusKm: React.Dispatch<React.SetStateAction<number | null>>;
};

export const MapContext = createContext<MapContextType | undefined>(undefined);

export const useMapContext = () => {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error('useMapContext must be used within MapProvider');
  return ctx;
};
