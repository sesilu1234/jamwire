'use client';

import { useRef, useState } from 'react';
import { TileLayer } from 'react-leaflet';

/**
 * The basemap: Stadia's Alidade Bright.
 *
 * Not theme-aware on purpose — one basemap was chosen deliberately, and a map
 * that flips between light and dark under the same amber pins would need two
 * sets of marker colours to stay legible.
 *
 * AUTHENTICATION
 * Stadia accepts either an API key in the URL or the requesting domain being
 * registered in their dashboard, and it serves localhost freely either way.
 * Domain auth is preferable here: a tile key has to travel to the browser to
 * be usable, so NEXT_PUBLIC_STADIA_API_KEY is readable by anyone who opens
 * devtools, and someone else could spend your quota with it. A registered
 * domain can't be lifted the same way — a copied Referer header doesn't help
 * an attacker serving from their own site.
 *
 * So the key is optional. If it isn't set we still request Stadia, which works
 * on localhost and on any domain you've registered.
 *
 * If those tiles fail — no key, unregistered domain, quota exhausted, Stadia
 * down — we switch to Esri's Light Gray Canvas, which needs no key at all. A
 * plainer map is far better than an empty grey rectangle.
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
  const [stadiaFailed, setStadiaFailed] = useState(false);

  // A single failed tile is NOT enough to condemn the layer: tiles legitimately
  // 404 over open water, past the edge of coverage, and on flaky connections.
  // Only a run of failures with nothing loading in between means the layer is
  // actually broken — which is what an auth or quota problem looks like, since
  // then every single tile fails.
  const consecutiveFailures = useRef(0);

  if (!stadiaFailed) {
    return (
      <TileLayer
        key="stadia-alidade-bright"
        url={STADIA_URL}
        attribution={STADIA_ATTRIBUTION}
        maxZoom={20}
        eventHandlers={{
          tileerror: () => {
            consecutiveFailures.current += 1;
            if (consecutiveFailures.current >= 8) setStadiaFailed(true);
          },
          tileload: () => {
            consecutiveFailures.current = 0;
          },
        }}
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
