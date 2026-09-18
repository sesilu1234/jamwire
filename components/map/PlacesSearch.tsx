// 'use client';
// import { useState, useRef, useEffect } from 'react';
// import { useMapContext } from '@/components/map/MapContext';

// type Place = {
//   display_name: string;
//   lat: string;
//   lon: string;
// };

// export default function PlaceSearch() {
//   const [query, setQuery] = useState('');
//   const [results, setResults] = useState<Place[]>([]);
//   const debounceRef = useRef<NodeJS.Timeout | null>(null);
//   const abortRef = useRef<AbortController | null>(null);

//   const { map } = useMapContext();

//   const fetchPlaces = async (q: string) => {
//     if (!q) {
//       setResults([]);
//       return;
//     }

//     if (abortRef.current) abortRef.current.abort();
//     const controller = new AbortController();
//     abortRef.current = controller;

//     try {
//       const res = await fetch(
//         `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
//           q,
//         )}&limit=5`,
//         { signal: controller.signal },
//       );
//       const data = await res.json();

//       const places: Place[] = data.map((f: any) => ({
//         display_name: f.display_name,
//         lat: parseFloat(f.lat),
//         lon: parseFloat(f.lon),
//       }));

//       setResults(places);
//     } catch (err) {
//       if ((err as any).name === 'AbortError') return;
//       console.error(err);
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     setQuery(value);

//     if (debounceRef.current) clearTimeout(debounceRef.current);
//     if (value.length < 3) {
//       setResults([]);
//       return;
//     }

//     debounceRef.current = setTimeout(() => {
//       fetchPlaces(value);
//     }, 1000);
//   };

//   const handleSelect = (place: Place) => {
//     setQuery(place.display_name);
//     setResults([]);
//     if (map) {
//       map.flyTo([parseFloat(place.lat), parseFloat(place.lon)], 13, {
//         duration: 1.5,
//       });
//     }
//   };

//   const clearSearch = () => {
//     setQuery('');
//     setResults([]);
//   };

//   return (
//     <div className="relative w-48 max-w-md">
//       <div className="relative">
//         <input
//           type="text"
//           value={query}
//           onChange={handleChange}
//           placeholder="Search places..."
//           className="w-full border rounded p-2 pr-8"
//         />
//         {query && (
//           <button
//             onClick={clearSearch}
//             className="absolute right-2 top-1/2 -translate-y-1/2  text-lg"
//           >
//             ×
//           </button>
//         )}
//       </div>

//       {results.length > 0 && (
//         <ul className="absolute top-full left-0 right-0 bg-white border mt-1 max-h-60 overflow-y-auto z-[1000] shadow-md">
//           {results.map((place, idx) => (
//             <li
//               key={idx}
//               className="p-2 hover:bg-gray-200 cursor-pointer"
//               onClick={() => handleSelect(place)}
//             >
//               {place.display_name}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }
