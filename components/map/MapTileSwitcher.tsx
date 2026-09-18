import { TileLayer } from "react-leaflet";
import { useState } from "react";

const tileLayers = [
	{
		url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
		attribution: "&copy; OpenStreetMap contributors",
		name: "OSM Default",
	},
	{
		url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
		name: "Carto Voyager",
	},
	{
		url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
		name: "Carto Dark Matter",
	},
	
];

export default function MapTileSwitcher({
	selectedIndex,
}: {
	selectedIndex: number;
}) {
	const layer = tileLayers[selectedIndex] || tileLayers[0];

	return <TileLayer url={layer.url} attribution={layer.attribution} />;
}
