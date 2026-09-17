import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { BRAND } from '@/lib/brand';

// Definición de ciudades globales para el directorio
const GLOBAL_CITIES_DATA = {
  "Europe": [
    "London", "Berlin", "Paris", "Madrid", "Barcelona", "Amsterdam", "Lisbon", 
    "Rome", "Dublin", "Vienna", "Prague", "Copenhagen", "Stockholm"
  ],
  "North America": [
    "New York", "Chicago", "Austin", "Nashville", "New Orleans", "Los Angeles", 
    "Toronto", "Montreal", "San Francisco", "Seattle", "Denver", "Atlanta"
  ],
  "Australia & Oceania": [
    "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Auckland", "Wellington"
  ],
  "Rest of World": [
    "Tokyo", "Seoul", "Mexico City", "Buenos Aires", "São Paulo", "Cape Town"
  ]
};

// Extraemos todos los nombres de ciudades en un array plano y limpio para las URLs
const ALL_CITY_SLUGS = Object.values(GLOBAL_CITIES_DATA)
  .flat()
  .map(city => city.toLowerCase().replace(/\s+/g, '-'));

export async function GET() {
  try {
    const baseUrl = BRAND.siteUrl;

    // 1. Fetch de los slugs de las Jams individuales desde Supabase
    // Traemos solo las jams para construir sus páginas de detalle
    const { data: jams, error } = await supabaseAdmin
      .from('sessions')
      .select('slug');

    if (error) throw error;

    // 2. Generar XML para la Home y páginas estáticas principales
    const staticPages = [
      { url: `${baseUrl}/`, priority: '1.0', changefreq: 'weekly' },
      { url: `${baseUrl}/cities`, priority: '0.9', changefreq: 'weekly' },
      { url: `${baseUrl}/host`, priority: '0.5', changefreq: 'monthly' },
      { url: `${baseUrl}/signIn`, priority: '0.5', changefreq: 'monthly' },
    ];

    // 3. Generar XML para las Landing Pages de Ciudades (SEO Local)
    const cityUrls = ALL_CITY_SLUGS.map(slug => `
  <url>
    <loc>${baseUrl}/${slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

    // 4. Generar XML para las Jams individuales
    const jamUrls = jams.map(j => `
  <url>
    <loc>${baseUrl}/jam/${j.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('');

    // Ensamblaje final del XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `
  <url>
    <loc>${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}
${cityUrls}
${jamUrls}
</urlset>`.trim();

return new Response(xml, {
  headers: { 
    'Content-Type': 'application/xml', // 'application/xml' es algo más estándar que 'text/xml'
    'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200' 
  },
});
  } catch (e) {
    console.error('Sitemap Error:', e);
    return new Response('Error generating sitemap', { status: 500 });
  }
}


