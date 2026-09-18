'use client';
import { useState, useRef, useEffect } from 'react';
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useMapContext } from '@/components/map/MapContext';
import { Search, X } from 'lucide-react'; // npm install lucide-react

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_CLIENT_API_KEY!;

export default function GooglePlacesSearch() {
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted)
    return <div className="w-full h-12 bg-tone-4/20 rounded animate-pulse" />;

  return (
    <APIProvider apiKey={API_KEY} language="en">
      <PlaceAutocomplete />
    </APIProvider>
  );
}

const PlaceAutocomplete = () => {
  const { googleSearchLocation, setGoogleSearchLocation, setLocationSearch, map } =
    useMapContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');

  // Track value locally just to show/hide the 'X' button


  useEffect(() => {
    if (!places || !inputRef.current) return;

    const autocomplete = new places.Autocomplete(inputRef.current, {
      fields: ['geometry', 'name', 'formatted_address'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place?.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        // Update context
        setLocationSearch({ coordinates: { lat, lng } });

        const cookieData = {
          city: place.name,
          latitude: lat,
          longitude: lng,
          timestamp: Date.now(),
        };

        document.cookie = `user_location=${encodeURIComponent(JSON.stringify(cookieData))}; path=/; max-age=14400; SameSite=Lax`;

        // Update local state so 'X' shows up if name exists
        setGoogleSearchLocation(place.name || '');

        if (map) {
          map.flyTo([lat, lng], 11, { duration: 1.5 });
        }
      }
    });

    return () => google.maps.event.clearInstanceListeners(autocomplete);
  }, [places, map, setLocationSearch]);

  const handleClear = () => {
    setGoogleSearchLocation('');
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative w-full">
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="w-4 h-4 text-tone-1/40" />
      </div>

      <input
        ref={inputRef}
        value={googleSearchLocation || ''}
        onChange={(e) => setGoogleSearchLocation(e.target.value)}
        placeholder="Search a location..."
        className="
          w-full h-12 pl-10 pr-10 text-sm
          bg-tone-4/60 text-tone-1
          placeholder:text-tone-1/60
          border border-tone-3 rounded
          focus:outline-none focus:ring-2 focus:ring-primary
        "
      />

      {/* Clear Button */}
      {googleSearchLocation && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-tone-1/40 hover:text-tone-1 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
