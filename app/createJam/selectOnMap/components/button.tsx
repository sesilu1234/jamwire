import { useMapContext } from "./mapContext";
import { useState, useRef, useEffect } from "react";

export default function Button({ className }: { className?: string }) {
	const { map, locationData, setLocation } = useMapContext();
	const [submitted, setSubmitted] = useState(false);
	const [countdown, setCountdown] = useState(3);

	const handleSubmit = () => {
		// Never broadcast an empty selection — the opener reads .name/.address
		// off the payload and would crash on null.
		if (!locationData) return;

		const channel = new BroadcastChannel("location_broadcast");
		channel.postMessage(locationData);

		channel.close();

		setSubmitted(true);
	};

	// countdown after submission
	useEffect(() => {
		if (!submitted) return;

		const interval = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					clearInterval(interval);
					if (window.opener) window.opener.focus();
					window.close();
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [submitted]);

	const hasLocation = !!locationData;

	return (
		<footer
			className={`shrink-0 border-t border-white/10 bg-zinc-950 px-5 py-4 ${className ?? ""}`}
		>
			{submitted ? (
				<div className="flex items-center justify-center gap-2.5 py-1 text-[13px] font-medium text-emerald-400">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						height="18px"
						viewBox="0 -960 960 960"
						width="18px"
						fill="currentColor"
					>
						<path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
					</svg>
					Location sent — closing in {countdown}…
				</div>
			) : (
				<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
					{/* selection readout */}
					<div className="min-w-0 flex-1">
						<p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
							Selected
						</p>
						{hasLocation ? (
							<>
								<p className="truncate text-[13px] font-semibold tracking-tight text-white">
									{locationData.name}
								</p>
								<p className="truncate text-[12px] text-zinc-500">
									{locationData.address}
								</p>
							</>
						) : (
							<p className="mt-0.5 text-[12px] text-zinc-500">
								Nothing yet — search for the venue above.
							</p>
						)}
					</div>

					<button
						onClick={handleSubmit}
						disabled={!hasLocation}
						className="
							shrink-0 rounded-xl bg-amber-400 px-5 py-2.5
							text-[13px] font-bold tracking-tight text-zinc-950
							shadow-sm transition-all duration-200
							hover:bg-amber-300 hover:shadow-md
							focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950
							disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500 disabled:shadow-none
							cursor-pointer
						"
					>
						Accept and send
					</button>
				</div>
			)}
		</footer>
	);
}
