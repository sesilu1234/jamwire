import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { BRAND } from '@/lib/brand';
import { getCitiesWithJams, citySlug } from '@/lib/getCitiesWithJams';

/**
 * The sitemap used to carry its own copy of a hand-written list of 39 cities,
 * duplicated from the directory page. So it promised Google a page for Tokyo
 * and Cape Town whether or not a single jam existed there, and adding a city
 * meant editing two files and remembering both.
 *
 * It now advertises the cities that actually have something on. Dropping a
 * city from here does not deindex it - a sitemap only advertises - and
 * `/[locationSlug]` still serves any city Google can resolve, so nothing that
 * was reachable stops being reachable.
 */

/**
 * A <loc> has to survive two layers: percent-encoding for the URL itself and
 * entity-escaping for the XML.
 *
 * The percent-encoding matters now that city slugs come from real place names
 * - Munich comes back from Google as "München", and a raw non-ASCII byte in a
 * <loc> is outside what the sitemap spec allows. `encodeURI` leaves plain
 * ASCII slugs untouched.
 */
const locUrl = (url: string) =>
  encodeURI(url)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export async function GET() {
  try {
    const baseUrl = BRAND.siteUrl;

    const [jamsResult, cities] = await Promise.all([
      supabaseAdmin.from('sessions').select('slug'),
      getCitiesWithJams(),
    ]);

    if (jamsResult.error) throw jamsResult.error;

    const staticPages = [
      { url: `${baseUrl}/`, priority: '1.0', changefreq: 'weekly' },
      { url: `${baseUrl}/cities`, priority: '0.9', changefreq: 'daily' },
      { url: `${baseUrl}/host`, priority: '0.5', changefreq: 'monthly' },
      { url: `${baseUrl}/about`, priority: '0.4', changefreq: 'monthly' },
      { url: `${baseUrl}/help`, priority: '0.4', changefreq: 'monthly' },
      { url: `${baseUrl}/contact`, priority: '0.4', changefreq: 'monthly' },
      { url: `${baseUrl}/privacy`, priority: '0.2', changefreq: 'yearly' },
      { url: `${baseUrl}/signIn`, priority: '0.5', changefreq: 'monthly' },
    ];

    // A city with more jams is worth crawling more often than one with a
    // single listing, so the busiest ones say so.
    const cityUrls = cities
      .map(
        ({ city, count }) => `
  <url>
    <loc>${locUrl(`${baseUrl}/${citySlug(city)}`)}</loc>
    <changefreq>daily</changefreq>
    <priority>${count >= 5 ? '0.8' : '0.6'}</priority>
  </url>`,
      )
      .join('');

    const jamUrls = (jamsResult.data ?? [])
      .filter((jam) => jam.slug)
      .map(
        (jam) => `
  <url>
    <loc>${locUrl(`${baseUrl}/jam/${jam.slug}`)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`,
      )
      .join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
  .map(
    (page) => `
  <url>
    <loc>${locUrl(page.url)}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
  )
  .join('')}
${cityUrls}
${jamUrls}
</urlset>`.trim();

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
      },
    });
  } catch (e) {
    console.error('Sitemap Error:', e);
    return new Response('Error generating sitemap', { status: 500 });
  }
}
