/**
 * Single source of truth for brand identity.
 *
 * The app was renamed from "Jamspots" to "Jamwire". Anything user-facing
 * (page titles, OG metadata, headings, logo) reads from here, so a future
 * rename or logo swap is a change in this file only.
 *
 * NOTE: infrastructure identifiers are deliberately NOT here. The Supabase
 * storage bucket (`jamspots_imageBucket`) and the S3 backup bucket
 * (`jamspots-pg-dump`) still carry the old name because renaming them in
 * code without renaming the actual buckets would break uploads and backups.
 */

export const BRAND = {
  /** Display name, title case. */
  name: 'Jamwire',
  /** Display name, lowercase — used where the wordmark is set in lowercase. */
  nameLower: 'jamwire',
  /** Display name, uppercase. */
  nameUpper: 'JAMWIRE',
  /** Tagline used in metadata and marketing copy. */
  tagline: 'Find the next spot where music happens.',
  /**
   * Canonical logo asset. To try a different mark, replace this file in
   * /public (or point this at one of the /public/jamwire-*.png candidates).
   */
  logo: '/jamwire_icon.png',
  /** Alt text for the logo image. */
  logoAlt: 'Jamwire logo',
  /**
   * Production origin. Still the old domain — the site is served from
   * jamspots.xyz. Change this only once the new domain is live, otherwise
   * the sitemap, canonical URLs and OG images will point at nothing.
   */
  siteUrl: 'https://jamwire.xyz',
} as const;
