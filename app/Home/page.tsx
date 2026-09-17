// app/Home/page.tsx
import { headers, cookies } from 'next/headers';
import { getHomeCards } from '@/lib/getHomeCards';
import HomeComponent from './HomeComponent'; 
import { JamCard } from '@/types/jam';
import { Metadata } from 'next';
import { BRAND } from '@/lib/brand';

const siteUrl = BRAND.siteUrl;

export const metadata: Metadata = {
  // The root layout appends "| <brand>", so this must not repeat it.
  title: 'Find Jam Sessions & Open Mics Near You',
  description: 'Discover where to play tonight. The world’s map for jam sessions and open mics for musicians and live music lovers.',
  openGraph: {
    title: `${BRAND.name} | Find Jam Sessions & Open Mics`,
    description: 'The world’s map for jam sessions and open mics.',
    url: siteUrl,
    siteName: BRAND.name,
    images: [
      {
        url: `${siteUrl}${BRAND.logo}`,
        width: 1200, // Standard OG size
        height: 630,
        alt: `${BRAND.name} - Global Jam Session Map`,
      },
    ],
    locale: 'en', // Generic English for the global music community
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND.name} | Global Jam Session Map`,
    description: 'Find where the music happens tonight.',
    images: [`${siteUrl}${BRAND.logo}`],
  },
};

const FOUR_HOURS = 4 * 60 * 60 * 1000;

export default async function HomePage() {
  const headerList = await headers(); 
  const cookieStore = await cookies();

  let userLocation;

  // Lógica de Cookie (Restaurada)
  const locationCookie = cookieStore.get('user_location');
  if (locationCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(locationCookie.value));
      if (Date.now() - parsed.timestamp < FOUR_HOURS) {
        userLocation = { city: parsed.city, latitude: parsed.latitude, longitude: parsed.longitude };
      }
    } catch (e) { console.error("Failed to parse location cookie", e); }
  }

  // Lógica de Headers (Restaurada)
  if (!userLocation) {
    const cityHeader = headerList.get('x-vercel-ip-city');
    const latHeader = headerList.get('x-vercel-ip-latitude');
    const lonHeader = headerList.get('x-vercel-ip-longitude');

    userLocation = cityHeader && latHeader && lonHeader
      ? { city: decodeURIComponent(cityHeader), latitude: Number(latHeader), longitude: Number(lonHeader) }
      : { city: 'Madrid, Spain', latitude: 40.4168, longitude: -3.7038 };
  }

  const homeCards = await getHomeCards({
    dateOptions: 'week',
    lat: userLocation.latitude,
    lng: userLocation.longitude,
    distance: '60',
    styles: JSON.stringify([]),
    modality: JSON.stringify(['jam', 'open_mic']),
    order: 'soonest',
  });

  const validJams = homeCards?.slice(0, 20).filter((jam) => jam.slug && jam.jam_title) || [];

  // JSON-LD (Restaurado el original)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Upcoming Jam Sessions',
    description: 'Discover the best open mics and jam sessions worldwide.',
    itemListElement: validJams.map((jam, index: number) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${siteUrl}/jam/${jam.slug}`,
      item: {
        '@type': 'Event',
        name: jam.jam_title,
        startDate: jam.next_date_local,
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        location: {
          '@type': 'Place',
          name: jam.location_title || 'Venue',
          address: { '@type': 'PostalAddress', streetAddress: jam.location_address || '' },
        },
        image: jam.images?.[0] || `${siteUrl}${BRAND.logo}`,
        description: `Join the ${jam.jam_title} at ${jam.location_title}.`,
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HomeComponent cards={(homeCards || []) as JamCard[]} userLocation={userLocation} />
    </>
  );
}