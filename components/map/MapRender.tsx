// components/MapComponent.tsx
"use client";
import {
	MapContainer,
	TileLayer,
	Marker,
	Popup,
	Circle,
	useMap,
	useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Figtree } from "next/font/google";
import { MIN_DISTANCE_KM, MAX_DISTANCE_KM } from "./Filtro";
import { useMapContext } from '@/components/map/MapContext';
import MapMarkersCluster from "./MarkerCluster";
import MapTileSwitcher from "./MapTileSwitcher";

// Figtree at 600. The global Oswald is condensed — it reads as a headline face
// and sits awkwardly in a small control.
const figtree = Figtree({ subsets: ["latin"], weight: ["600"] });

// Fix default marker icons in TypeScript
const DefaultIcon = L.icon({
	iconRetinaUrl:
		"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
	iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
	shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

function SetMap() {
	const { setMap } = useMapContext();

	const map = useMap();
	useEffect(() => {
		setMap(map);
	}, []);
	return null;
}


/**
 * The area the current local search covers. Drawn as an outline with a barely
 * there fill so it frames the markers without tinting the map underneath —
 * a heavier fill reads as a selected region rather than a search radius.
 * Hidden during a global search, which has no radius.
 */
function SearchRadius() {
	const { locationSearch, searchRadiusKm } = useMapContext();

	if (!locationSearch || !searchRadiusKm) return null;

	return (
		<Circle
			center={[locationSearch.coordinates.lat, locationSearch.coordinates.lng]}
			radius={searchRadiusKm * 1000}
			interactive={false}
			pathOptions={{
				color: "oklch(78% 0.16 75)",
				weight: 1.5,
				opacity: 0.7,
				fillColor: "oklch(78% 0.16 75)",
				fillOpacity: 0.06,
			}}
		/>
	);
}


/**
 * "Search this area" — offered after the reader pans away from the current
 * search, rather than re-querying automatically on every move.
 *
 * Auto-search would fight the map: `handleAccept` flies to the new bounds and
 * MapProvider flies on mount, and Leaflet cannot tell those animations apart
 * from a drag, so the map would keep searching in response to its own motion.
 * Comparing the centre against `locationSearch` sidesteps the problem entirely
 * — every programmatic fly lands ON locationSearch, so the drift is zero and
 * the button stays hidden. Only a real pan can surface it.
 */
function SearchThisArea() {
	const { locationSearch, setLocationSearch, searchRadiusKm, setSearchRadiusKm } =
		useMapContext();
	const [drifted, setDrifted] = useState(false);

	const map = useMapEvents({
		moveend: () => {
			if (!locationSearch || !searchRadiusKm) {
				setDrifted(false);
				return;
			}
			const centre = map.getCenter();
			const drift = map.distance(centre, [
				locationSearch.coordinates.lat,
				locationSearch.coordinates.lng,
			]);
			// A third of the radius: far enough that the results really are about
			// somewhere else, close enough that it appears when you expect it.
			setDrifted(drift > searchRadiusKm * 1000 * 0.33);
		},
	});

	if (!drifted || !searchRadiusKm) return null;

	const searchHere = () => {
		const centre = map.getCenter();
		const bounds = map.getBounds();

		// Radius that fits inside the viewport, so the circle matches what is
		// actually on screen instead of keeping the previous distance.
		const toEdge = Math.min(
			map.distance(centre, [bounds.getNorth(), centre.lng]),
			map.distance(centre, [centre.lat, bounds.getEast()]),
		);
		const km = Math.round(toEdge / 1000);

		setSearchRadiusKm(
			Math.min(MAX_DISTANCE_KM, Math.max(MIN_DISTANCE_KM, km)),
		);
		// Filtro already refetches whenever locationSearch changes.
		setLocationSearch({ coordinates: { lat: centre.lat, lng: centre.lng } });
		setDrifted(false);
	};

	return (
		<div className="pointer-events-none absolute inset-x-0 top-3 z-[500] flex justify-center">
			<button
				type="button"
				onClick={searchHere}
				className={`${figtree.className} pointer-events-auto inline-flex h-10
				           cursor-pointer items-center gap-2 rounded-md border
				           border-[#2A2F3A] bg-white/92 px-4 text-sm font-semibold
				           tracking-tight text-[#1B1F2A] backdrop-blur-sm
				           shadow-[2px_2px_0_0_rgba(27,31,42,0.55)]
				           transition-[transform,box-shadow,background-color] duration-150
				           hover:bg-white hover:shadow-[3px_3px_0_0_rgba(27,31,42,0.65)]
				           active:translate-x-px active:translate-y-px
				           active:shadow-[1px_1px_0_0_rgba(27,31,42,0.55)]
				           focus-visible:outline-none focus-visible:ring-2
				           focus-visible:ring-brand
				           animate-in fade-in slide-in-from-top-2 duration-200`}
			>
				<Search className="size-4 shrink-0" strokeWidth={2.5} />
				Search this area
			</button>
		</div>
	);
}

export default function MapComponent() {
	return (
		<MapContainer
			center={[40.4168, -3.7038]}
			zoom={5}
			style={{ height: "100%", width: "100%" }}
		>
			<SetMap />

			<MapTileSwitcher selectedIndex={0} />

			<SearchRadius />

			<SearchThisArea />

			<MapMarkersCluster />
		</MapContainer>
	);
}
