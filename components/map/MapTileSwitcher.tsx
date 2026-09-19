'use client';

import { useEffect, useState } from 'react';
import { TileLayer } from 'react-leaflet';

/**
 * The basemap: Stadia's Alidade Bright.
 *
 * Not theme-aware on purpose — one basemap was chosen deliberately, and a map
 * that flips between light and dark under the same amber pins ends up needing
 * two sets of marker colours to stay legible.
 *
 * Stadia serves keyless from localhost, so development works with no setup,
 * but a deployed site needs either NEXT_PUBLIC_STADIA_API_KEY or the domain
 * registered in the Stadia dashboard. If neither is available we fall back to
 * Esri's Light Gray Canvas, which needs no key at all — a plainer map is much
 * better than an empty one.
 */

const STADIA_KEY = process.env.NEXT_PUBLIC_STADIA_API_KEY;

const STADIA_URL = `https://tiles.stadiamaps.com/tiles/alidade_bright/{z}/{x}/{y}{r}.png${
  STADIA_KEY ? `?api_key=${STADIA_KEY}` : ''
}`;

const STADIA_ATTRIBUTION =
  '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services';
const ESRI_ATTRIBUTION =
  'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors';

export default function MapTileSwitcher({
  selectedIndex,
}: {
  /** Kept so existing call sites don't break; there is one basemap now. */
  selectedIndex?: number;
}) {
  // Read after mount: the server has no `location`, and guessing during render
  // would desync hydration.
  const [isLocal, setIsLocal] = useState(false);
  useEffect(() => {
    setIsLocal(['localhost', '127.0.0.1'].includes(window.location.hostname));
  }, []);

  const canUseStadia = Boolean(STADIA_KEY) || isLocal;

  if (canUseStadia) {
    return (
      <TileLayer
        // Remount when the source changes: Leaflet caches tiles per layer
        // instance, so the old basemap would otherwise linger until you pan.
        key="stadia-alidade-bright"
        url={STADIA_URL}
        attribution={STADIA_ATTRIBUTION}
        maxZoom={20}
      />
    );
  }

  return (
    <>
      <TileLayer
        key="esri-base"
        url={`${ESRI}/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}`}
        attribution={ESRI_ATTRIBUTION}
        // Canvas is only rendered to z16; without this the map goes blank when
        // you zoom into a street. Esri also orders the path {z}/{y}/{x}.
        maxNativeZoom={16}
        maxZoom={19}
      />
      {/* Esri keeps place names in a separate reference layer. */}
      <TileLayer
        key="esri-labels"
        url={`${ESRI}/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}`}
        maxNativeZoom={16}
        maxZoom={19}
      />
    </>
  );
}
