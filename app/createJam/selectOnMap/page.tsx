// page.tsx
"use client";
import React from "react";
import { MapProvider } from "./components/mapContext";
import MapRender from "./components/mapApi";
import Button from "./components/button";

export default function Home() {
	return (
		<MapProvider>
			<div className="flex h-screen w-full flex-col overflow-hidden bg-zinc-950 text-zinc-100">
				{/* ---- header ---- */}
				<header className="flex shrink-0 items-center gap-3 border-b border-white/10 px-5 py-3.5">
					<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/15">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							height="18px"
							viewBox="0 -960 960 960"
							width="18px"
							fill="#fbbf24"
						>
							<path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Z" />
						</svg>
					</span>
					<div className="min-w-0">
						<h1 className="text-[14px] font-bold leading-tight tracking-tight text-white">
							Pick the location
						</h1>
						<p className="truncate text-[12px] leading-tight text-zinc-500">
							Search the venue by name or address.
						</p>
					</div>
				</header>

				{/* ---- map ---- */}
				<div className="relative min-h-0 flex-1">
					<MapRender />
				</div>

				{/* ---- footer ---- */}
				<Button />
			</div>
		</MapProvider>
	);
}
