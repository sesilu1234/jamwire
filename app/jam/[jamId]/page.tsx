// app/jam/[jamId]/page.tsx
import { getJam } from '@/lib/getJam';
import { getHomeCards } from '@/lib/getHomeCards';
import { JamCard } from '@/types/jam';
import JamComponent from './JamComponent';
import { Metadata } from 'next';
import { BRAND } from '@/lib/brand';
import { notFound } from 'next/navigation';
import { Jam } from '../types/jam';
export type JamWithComments = Jam & {
  comments: any;
    host_name: string;
};

type Props = {
  params: Promise<{ jamId: string }>;
}

// 🛡️ Helper para extraer localización de forma segura
const getLocationData = (address: string | null) => {
  if (!address) return { street: '', city: '', country: '', countryCode: '' };
  const parts = address.split(',').map(s => s.trim());
  const country = parts.length > 0 ? parts[parts.length - 1] : '';
  const city = parts.length > 1 ? parts[parts.length - 2] : '';
  
  // Mapeo básico de moneda y código (esto lo ideal sería tenerlo en DB)
  const isSpain = country.toLowerCase() === 'españa' || country.toLowerCase() === 'spain';
  return {
    street: address,
    city: city,
    country: country,
    countryCode: isSpain ? 'ES' : country, // Si no es España, ponemos el nombre del país
    currency: isSpain ? 'EUR' : 'USD' // Fallback básico
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { jamId } = await params;
  const jam = await getJam(jamId);

  if (!jam) return { title: 'Jam Not Found' };

  const styleArray = Array.isArray(jam.styles) 
    ? jam.styles 
    : (jam.styles || '').split(',').map((s: string) => s.trim());

  const firstRealStyle = styleArray.find((s: string) => s.toLowerCase() !== 'all styles');
  const displayModality = jam.modality === 'open_mic' ? 'Open Mic' : 'Jam';
  const eventType = firstRealStyle ? `${firstRealStyle} ${displayModality}` : displayModality;

  const { city, country } = getLocationData(jam.location_address);

  const title = `${jam.jam_title} – ${jam.location_title}, ${city}`;
  const description = `Check out the ${eventType} at ${jam.location_title} in ${city}, ${country}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [jam.images?.[0] || BRAND.ogImage],
    },
  };
}

export default async function JamPage({ params }: Props) {
  const { jamId } = await params;
  const jam = await getJam(jamId);

  // 1️⃣ El guardián: Si no hay jam, salimos antes de que nada falle
  if (!jam) notFound();

  // 2️⃣ Datos de localización dinámicos
  /**
   * Other jams within 10 km.
   *
   * Reuses the same RPC the map runs, centred on this venue instead of on the
   * visitor. A jam page arrived at from Google used to be a dead end: the only
   * way onward was back to the map. Kept deliberately narrow - 10 km, the next
   * seven days, soonest first - so what shows up is somewhere you could
   * actually go this week. If nothing matches, the section doesn't render.
   */
  const nearbyRaw = await getHomeCards({
    dateOptions: 'week',
    lat: jam.lat,
    lng: jam.lng,
    distance: '10',
    styles: JSON.stringify([]),
    modality: JSON.stringify(['jam', 'open_mic']),
    order: 'soonest',
  });

  const nearbyJams = ((nearbyRaw ?? []) as JamCard[])
    .filter((card) => card.slug && card.slug !== jam.slug)
    .slice(0, 3);

  const { street, city, country, countryCode, currency } = getLocationData(jam.location_address);

  const styleArray = Array.isArray(jam.styles) 
    ? jam.styles 
    : (jam.styles || '').split(',').map((s: string) => s.trim());
  const firstRealStyle = styleArray.find((s: string) => s.toLowerCase() !== 'all styles') || 'Music';
  const displayModality = jam.modality === 'open_mic' ? 'Open Mic' : 'Jam';
  const eventType = `${firstRealStyle} ${displayModality}`;


const simpleDescription = `${eventType} at ${jam.location_title}, ${city}. Open stage and live music community.`;

  // 3️⃣ JSON-LD Blindado
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": jam.jam_title || "Jam Session",
    "startDate": jam.iso_date, 
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "eventStatus": "https://schema.org/EventScheduled",
    "location": {
      "@type": "Place",
      "name": jam.location_title,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": street,
        "addressLocality": city,
        "addressCountry": countryCode // Dinámico
      }
    },
    "description": simpleDescription,
    "image": jam.images?.[0] || `${BRAND.siteUrl}${BRAND.ogImage}`,
    "url": `${BRAND.siteUrl}/jam/${jam.slug}`,
    "offers": {
      "@type": "Offer",
      "url": `${BRAND.siteUrl}/jam/${jam.slug}`,
      "price": "0",
      "priceCurrency": currency, // Dinámico
      "availability": "https://schema.org/InStock",
      "validFrom": new Date().toISOString().split('T')[0]
    },
    "organizer": {
      "@type": "Organization",
      "name": BRAND.name,
      "url": BRAND.siteUrl
    }
  };

  

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <JamComponent
        jam={jam as unknown as JamWithComments}
        nearbyJams={nearbyJams}
      />
    </>
  );
}