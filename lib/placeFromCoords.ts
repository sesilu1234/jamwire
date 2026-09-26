import 'server-only';

export type Place = {
  city: string | null;
  country: string | null;
  countryCode: string | null;
};

const EMPTY: Place = { city: null, country: null, countryCode: null };

/**
 * The town a set of coordinates is in, as Google names it.
 *
 * Why not parse `location_address`? Because it is free text, and the city is
 * "the second-to-last comma-separated part" only some of the time. An address
 * with a district has one part too many, one without a city has one too few,
 * and Google's own formatting differs per country. Split that way, one city
 * turns into "Madrid", "Community of Madrid" and "Comunidad de Madrid", which
 * a directory then lists as three places.
 *
 * Reverse geocoding gives structured `address_components` instead, and the
 * `locality` of a point is one canonical string.
 *
 * Never throws. A jam whose city could not be resolved is still a perfectly
 * good jam; it just stays out of the city directory until someone re-saves it
 * in the editor.
 */
export async function placeFromCoords(
  lat: number,
  lng: number,
): Promise<Place> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey || !Number.isFinite(lat) || !Number.isFinite(lng)) return EMPTY;

  try {
    /**
     * Bounded deliberately. This call is decoration - the jam saves fine
     * without a city - but it used to be able to hold a create request open
     * for as long as Google felt like taking, and the user just watched the
     * spinner. An abort here lands in the catch below and returns EMPTY.
     */
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=en`,
      { next: { revalidate: 86400 }, signal: AbortSignal.timeout(6000) },
    );

    const data = await response.json();

    if (data.status !== 'OK' || !Array.isArray(data.results)) {
      console.warn(`placeFromCoords: ${data.status} for ${lat},${lng}`);
      return EMPTY;
    }

    const components = data.results.flatMap(
      (result: any) => result.address_components ?? [],
    );

    const pick = (type: string) =>
      components.find((c: any) => c.types?.includes(type));

    /**
     * In priority order, because not every point has a `locality`: British
     * towns are often `postal_town`, and a venue outside any town falls back
     * to its administrative area rather than to nothing.
     */
    const cityComponent =
      pick('locality') ??
      pick('postal_town') ??
      pick('administrative_area_level_3') ??
      pick('administrative_area_level_2');

    const countryComponent = pick('country');

    return {
      city: cityComponent?.long_name ?? null,
      country: countryComponent?.long_name ?? null,
      countryCode: countryComponent?.short_name ?? null,
    };
  } catch (e) {
    console.error('placeFromCoords failed:', e);
    return EMPTY;
  }
}
