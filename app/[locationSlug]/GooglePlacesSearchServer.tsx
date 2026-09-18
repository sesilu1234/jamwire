'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useMapContext } from '@/components/map/MapContext';
import { Search, X, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GooglePlacesSearch() {

  const router = useRouter();

  const { googleSearchLocation, setGoogleSearchLocation, setLocationSearch, map } = useMapContext();
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [sessionToken, setSessionToken] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
const inputRef = useRef<HTMLInputElement>(null);

  const searchReady = useRef<boolean>(false);

  // 1. Initialize custom UUID session token
  useEffect(() => {
    setSessionToken(self.crypto.randomUUID());
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 2. Debounced API Search (Autocomplete)
  useEffect(() => {
    const val = googleSearchLocation?.trim();
    if (!val || val.length < 2 || !searchReady.current) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        // Calling your own server API
        const res = await fetch(`/api/public/places?input=${encodeURIComponent(val)}&token=${sessionToken}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setResults(data);
          setIsOpen(true);
        }
      } catch (e) { console.error("Search error:", e); }
    }, 300);

    return () => clearTimeout(timer);
  }, [googleSearchLocation, sessionToken]);

  // 3. Handle Selection (Place Details)
  const handleSelect = async (place: any) => {
    // Optimistically update the input UI
    setGoogleSearchLocation(place.description);
    setIsOpen(false);
    searchReady.current = false;

    try {
      // Fetch details (lat/lng) from your own server API
      const res = await fetch(`/api/public/places-details?placeId=${place.place_id}&token=${sessionToken}`);
      const coords = await res.json();


      if (coords.lat && coords.lng) {
        setLocationSearch({ coordinates: { lat: coords.lat, lng: coords.lng } });
        const newPath = `/${coords.address}`;
        window.history.pushState(null, '', newPath);
        
        // Cookie logic for persistence
        const cookieData = { city: coords.name, latitude: coords.lat, longitude: coords.lng, timestamp: Date.now() };
        document.cookie = `user_location=${encodeURIComponent(JSON.stringify(cookieData))}; path=/; max-age=14400; SameSite=Lax`;

        if (map) {
          map.flyTo([coords.lat, coords.lng], 11, { duration: 1.5 });
        }

        // Refresh token for the NEXT session
        setSessionToken(self.crypto.randomUUID());
      }
    } catch (e) { console.error("Details error:", e); }
  };

  const handleClear = () => {
    setGoogleSearchLocation('');
    setResults([]);
     inputRef.current?.focus(); // <— focus after clearing
  };


  
  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="w-4 h-4 text-tone-1/40" />
      </div>

      <input
      ref={inputRef}  // <— add this
        value={googleSearchLocation || ''}
        onChange={(e) => {
           searchReady.current = true;
           setGoogleSearchLocation(e.target.value);
           if (e.target.value === '') setIsOpen(false);
        }}
        onFocus={() => googleSearchLocation && googleSearchLocation.length > 1 && setIsOpen(true)}
        placeholder="Search a city..."
        className="w-full h-12 pl-10 pr-10 text-sm bg-tone-4/60 text-tone-1 placeholder:text-tone-1/60 border border-tone-3 rounded focus:outline-none focus:ring-2 focus:ring-primary"
      />

      {googleSearchLocation && (
        <button onClick={handleClear} className="absolute inset-y-0 right-0 flex items-center pr-3 text-tone-1/40 hover:text-tone-1 transition-colors">
          <X className="w-4 h-4" />
        </button>
      )}

      {isOpen && results.length > 0 && (
        <ul className="absolute z-[100] w-full mt-1 bg-white border border-tone-3 rounded shadow-lg max-h-60 overflow-y-auto">
          {results.map((p: any) => (
            <li
              key={p.place_id}
              onClick={() => handleSelect(p)}
              className="flex items-center px-4 py-3 hover:bg-tone-4/10 cursor-pointer border-b last:border-none border-tone-4/20"
            >
              <MapPin className="w-4 h-4 mr-3 text-primary/60 flex-shrink-0" />
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium text-slate-700 truncate">{p.structured_formatting?.main_text || p.description}</span>
                <span className="text-xs text-slate-400 truncate">{p.structured_formatting?.secondary_text || ''}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}