import Link from 'next/link';
import { BRAND } from '@/lib/brand';
import BrandLogo from '@/components/BrandLogo';

const GLOBAL_CITIES = {
  "Europe": ["London", "Berlin", "Paris", "Madrid", "Barcelona", "Amsterdam", "Lisbon", "Rome", "Dublin", "Vienna", "Prague", "Copenhagen", "Stockholm"],
  "North America": ["New York", "Chicago", "Austin", "Nashville", "New Orleans", "Los Angeles", "Toronto", "Montreal", "San Francisco", "Seattle", "Denver", "Atlanta"],
  "Australia & Oceania": ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Auckland", "Wellington"],
  "Rest of World": ["Tokyo", "Seoul", "Mexico City", "Buenos Aires", "São Paulo", "Cape Town"]
};

export default function CitiesPage() {
  return (
    <div className="bg-background-0 min-h-screen">
      {/* HEADER / LOGO AREA */}
      <div className="max-w-[1300px] w-[90%] mx-auto pt-10 pb-16">
        <Link href="/" className="inline-flex items-center gap-4 group">
          <BrandLogo className="h-10 w-auto object-contain group-hover:rotate-12 transition-transform duration-300" />
          {/* The logo is itself a wordmark, so the name is not repeated here. */}
          <div className="flex flex-col border-l border-tone-0/10 pl-4">
            <p className="hidden sm:block text-[10px] uppercase tracking-widest text-gray-500 font-bold">
              {BRAND.tagline}
            </p>
          </div>
        </Link>
      </div>

      {/* CONTENT */}
      <div className="max-w-[1300px] w-[90%] mx-auto pb-24">
        <header className="mb-20">
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter uppercase leading-[0.85]">
            Global<br />
            <span className="text-primary-1">Jam Directory</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl leading-relaxed font-medium">
            Select a city to discover where the next session is happening or add your local spot to the global map.
          </p>
        </header>

        {/* CITIES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16">
          {Object.entries(GLOBAL_CITIES).map(([region, cities]) => (
            <div key={region} className="flex flex-col gap-6">
              <h2 className="text-xs font-black tracking-[0.3em] text-gray-400 uppercase border-b border-black/5 pb-3">
                {region}
              </h2>
              <ul className="flex flex-col gap-3">
                {cities.sort().map((city) => (
                  <li key={city}>
                    <Link 
                      href={`/${city.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-lg font-bold hover:text-primary-1 transition-all group flex items-center justify-between border-b border-transparent hover:border-primary-1/20 pb-1"
                    >
                      {city}
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-primary-1 text-sm">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}