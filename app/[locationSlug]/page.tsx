import { headers, cookies } from 'next/headers';
import { getHomeCards } from '@/lib/getHomeCards';
import HomeComponent from './HomeComponent'; 
import { JamCard } from '@/types/jam';
import { Metadata } from 'next';
import { BRAND } from '@/lib/brand';

const FOUR_HOURS = 4 * 60 * 60 * 1000;

export async function generateMetadata({ params }: { params: Promise<{ locationSlug: string }> }): Promise<Metadata> {
  const { locationSlug } = await params;
  const siteUrl = BRAND.siteUrl;
  
  // Formateo del nombre de la ciudad
  const cityName = decodeURIComponent(locationSlug).replace(/-/g, ' ');
  const capitalizedCity = cityName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // The root layout appends "| <brand>", so this must not repeat it.
  const title = `Jam Sessions in ${capitalizedCity}`;
  const description = `Discover the best open mics and jam sessions in ${capitalizedCity}. Live map, dates, and up-to-date schedules for local musicians.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${locationSlug}`,
      siteName: BRAND.name,
      images: [
        {
          url: `${siteUrl}${BRAND.ogImage}`, // Cambiar por una imagen de la ciudad si algún día la hay
          width: 1200,
          height: 630,
          alt: `Jam Sessions in ${capitalizedCity}`,
        },
      ],
      locale: 'en',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${siteUrl}${BRAND.ogImage}`],
    },
  };
}

async function getCoordsFromSlug(slug: string) {
  const query = decodeURIComponent(slug).replace(/-/g, ' ');
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${apiKey}`,
      { next: { revalidate: 86400 } } 
    );
    const data = await response.json();
     
    if (data.results?.[0]) {
      const { lat, lng } = data.results[0].geometry.location;
      return { city: data.results[0].formatted_address, latitude: lat, longitude: lng };
    }
  } catch (e) { return null; }
  return null;
}

export default async function CityPage({ params }: { params: Promise<{ locationSlug: string }> }) {
  const { locationSlug } = await params;
  const headerList = await headers();
  const cookieStore = await cookies();

  // 1️⃣ PRIORIDAD 1: Intentar por Slug
  let userLocation = await getCoordsFromSlug(locationSlug);

 

  // 2️⃣ PRIORIDAD 2: Si no hay slug o falla, usar tu lógica de Cookie
  if (!userLocation) {
    const locationCookie = cookieStore.get('user_location');
    if (locationCookie) {

      try {
        const parsed = JSON.parse(decodeURIComponent(locationCookie.value));
        if (Date.now() - parsed.timestamp < FOUR_HOURS) {
          userLocation = { city: parsed.city, latitude: parsed.latitude, longitude: parsed.longitude };
        }
      } catch (e) { console.error("Error cookie", e); }
    }
  }

  // 3️⃣ PRIORIDAD 3: Si sigue sin haber ubicación, Vercel Headers o Madrid
  if (!userLocation) {
    const cityHeader = headerList.get('x-vercel-ip-city');
    const latHeader = headerList.get('x-vercel-ip-latitude');
    const lonHeader = headerList.get('x-vercel-ip-longitude');

    

    userLocation = cityHeader && latHeader && lonHeader
      ? { city: decodeURIComponent(cityHeader), latitude: Number(latHeader), longitude: Number(lonHeader) }
      : { city: 'Madrid, Spain', latitude: 40.4168, longitude: -3.7038 };
  }

  // 4️⃣ FETCH DATA
  const paramsCards = {
    dateOptions: 'week',
    lat: userLocation.latitude,
    lng: userLocation.longitude,
    distance: '60',
    styles: JSON.stringify([]),
    modality: JSON.stringify(['jam', 'open_mic']),
    order: 'soonest',
  };

  const homeCards = await getHomeCards(paramsCards);
  const validJams = homeCards?.slice(0, 20).filter((jam) => jam.slug && jam.jam_title) || [];

  // 5️⃣ JSON-LD COMPLETO (Tu versión original recuperada y mejorada)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Jam Sessions in ${userLocation.city}`,
    description: `Discover the best jam sessions and open mics in ${userLocation.city}.`,
    itemListElement: validJams.map((jam, index: number) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${BRAND.siteUrl}/jam/${jam.slug}`,
      item: {
        '@type': 'Event',
        name: jam.jam_title,
        startDate: jam.next_date_local,
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        location: {
          '@type': 'Place',
          name: jam.location_title || 'Venue',
          address: {
            '@type': 'PostalAddress',
            streetAddress: jam.location_address || '',
            addressLocality: userLocation?.city || ''
          },
        },
        image: jam.images?.[0] || `${BRAND.siteUrl}${BRAND.ogImage}`,
        description: `Join the ${jam.jam_title} at ${jam.location_title}. Open stage for musicians.`,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeComponent
        cards={(homeCards || []) as JamCard[]}
        userLocation={userLocation}
        currentUsedPath={locationSlug}
      />
    </>
  );
}