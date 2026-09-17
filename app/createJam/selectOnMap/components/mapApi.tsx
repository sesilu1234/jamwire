"use client";

import { useEffect, useRef, useState } from "react";
import {
	APIProvider,
	Map,
	useMap,
	AdvancedMarker,
	MapControl,
	useMapsLibrary,
	ControlPosition,
} from "@vis.gl/react-google-maps";
import { useMapContext } from "./mapContext";
import type { LocationData } from "./mapContext"; // adjust path as needed

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_CLIENT_API_KEY!;

// type Poi = { key: string; location: google.maps.LatLngLiteral };

interface PlaceAutocompleteProps {
	onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
}

export default function MapRender() {
	const { map, locationData, setLocation } = useMapContext();

	const [markerPos, setMarkerPos] = useState({
		lat: -33.8567844,
		lng: 151.213108,
	});


	return (
		<APIProvider apiKey={API_KEY} language="en">
			<Map mapId="da37f3254c6a6d1c" defaultZoom={13} defaultCenter={markerPos}>
				<MapProviderInside />

				{/* Only shown once a real, searched place is picked — the address
				    has to come from the Places result, so there is nothing to
				    point at until then. */}
				{locationData ? <MarkerLocation position={markerPos} /> : null}

				<MapControl position={ControlPosition.TOP}>
				<div className="w-full relative top-3 px-3 z-[500] ">
						<PlaceAutocomplete
							onPlaceSelect={(place) => {
								if (!place) {
									setLocation(null);
									return;
								}

								const data: LocationData = {
									name: place.name || "",
									address: place.formatted_address || "",
									coordinates: {
										lat: place.geometry!.location!.lat(),
										lng: place.geometry!.location!.lng(),
									},
								};

								setLocation(data);
								setMarkerPos(data.coordinates);
								if (map) {
									map.panTo(data.coordinates);
									map.setZoom(14); // set your desired zoom
								}
							}}
						/>
					</div>
				</MapControl>
			</Map>
		</APIProvider>
	);
}

function MapProviderInside() {
	const { setMap } = useMapContext();
	const map = useMap();

	useEffect(() => {
		if (map) setMap(map);
	}, [map]);

	return null;
}

function MarkerLocation({ position }: { position: google.maps.LatLngLiteral }) {
	// Not draggable on purpose: a dragged pin has no street address, and the
	// jam listing needs a real one. The position always comes from a Places
	// result instead.
	return <AdvancedMarker position={position} />;
}

function PlaceAutocomplete({ onPlaceSelect }: PlaceAutocompleteProps) {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const places = useMapsLibrary("places");

	useEffect(() => {
		if (!places || !inputRef.current) return;

		const autocomplete = new places.Autocomplete(inputRef.current, {
			fields: ["geometry", "name", "formatted_address"],
		});

		autocomplete.addListener("place_changed", () => {
			onPlaceSelect(autocomplete.getPlace() || null);
		});

		return () => google.maps.event.clearInstanceListeners(autocomplete);
	}, [places]);

	return (
		<div className="relative w-full">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				height="18px"
				viewBox="0 -960 960 960"
				width="18px"
				fill="currentColor"
				className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
			>
				<path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
			</svg>
			<input
				ref={inputRef}
				placeholder="Search a venue, bar or address…"
				className="h-11 w-full rounded-xl border border-zinc-900/10 bg-white pl-10 pr-3 text-[14px] text-zinc-900 shadow-lg outline-none transition-all placeholder:text-zinc-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/25"
			/>
		</div>
	);
}
