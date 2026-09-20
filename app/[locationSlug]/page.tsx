import { notFound } from 'next/navigation';
import { getHomeCards } from '@/lib/getHomeCards';
import { getRecentJams } from '@/lib/getRecentJams';
import HomeComponent from './HomeComponent'; 
import { JamCard } from '@/types/jam';
import { Metadata } from 'next';
import { BRAND } from '@/lib/brand';

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

/**
 * Geocodes the slug, and distinguishes "this is not a place" from "we couldn't
 * ask".
 *
 * That distinction is the whole safety of the 404 below. It used to return
 * `null` for both cases, which was harmless only because the caller fell back
 * to Madrid. Now that `null` means 404, treating them the same would mean a
 * missing or rate-limited API key deindexes every city page on the site.
 *
 * - `ZERO_RESULTS`: Google is confident the string is not a place -> null -> 404.
 * - Anything else (`REQUEST_DENIED` for a bad or absent key, `OVER_QUERY_LIMIT`,
 *   a network failure): our problem, not the URL's. It throws, so the visitor
 *   gets a 500 that search engines retry, instead of a 404 that removes a real
 *   city from the index.
 */
async function getCoordsFromSlug(slug: string) {
  const query = decodeURIComponent(slug).replace(/-/g, ' ');
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`,
    { next: { revalidate: 86400 } },
  );

  const data = await response.json();

  if (data.results?.[0]) {
    const { lat, lng } = data.results[0].geometry.location;
    return {
      city: data.results[0].formatted_address,
      latitude: lat,
      longitude: lng,
    };
  }

  if (data.status === 'ZERO_RESULTS') return null;

  // Loud on purpose: this is the state where the whole city section is down.
  throw new Error(
    `Geocoding failed for "${slug}": ${data.status ?? response.status}${
      data.error_message ? ` - ${data.error_message}` : ''
    }`,
  );
}

export default async function CityPage({ params }: { params: Promise<{ locationSlug: string }> }) {
  const { locationSlug } = await params;

  /**
   * The URL *is* the place here, so there is nothing to fall back to.
   *
   * This used to fall through to the cookie, then the Vercel IP headers, then
   * Madrid - the same chain the home page uses. On `/` that chain is right: no
   * place is named, so any guess beats nothing. On `/[locationSlug]` it meant
   * every string on the internet resolved to a page: `/asdasd` rendered
   * Madrid's jams under a "Jam Sessions in Asdasd" heading, and every one of
   * them was an indexable URL with a JSON-LD ItemList behind it.
   *
   * This is *not* the "no jams here" case. A real city with nothing in it
   * still renders, with an empty list and the invitation to add the first jam.
   * Only a place that does not exist 404s.
   */
  const userLocation = await getCoordsFromSlug(locationSlug);

  if (!userLocation) {
    notFound();
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


  // Independent of the map query, so a slow or empty result never blocks it.
  const recentJams = await getRecentJams();
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
        recentJams={recentJams}
      />
    </>
  );
}