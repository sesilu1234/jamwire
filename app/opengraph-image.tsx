import { ImageResponse } from 'next/og';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BRAND } from '@/lib/brand';

/**
 * The social preview card (WhatsApp, Twitter/X, Facebook, Slack, Discord).
 *
 * Generated rather than shipped as a static file so it can never drift from
 * `lib/brand.ts` — replace the logo there and this follows.
 *
 * Deliberately just the wordmark on a flat field. Two reasons:
 *
 * 1. Every client renders the title and description as real text beside the
 *    image, so a tagline baked into the picture is duplicated — and at
 *    thumbnail size it degrades into unreadable grey mush.
 * 2. Several clients (the WhatsApp composer, Slack compact, Telegram,
 *    Discord) centre-crop this to a square and display it around 200px wide.
 *    One mark survives that. A stacked layout does not.
 *
 * So: nothing here that has to be legible at 200px except the logo itself.
 */

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = `${BRAND.name} — ${BRAND.tagline}`;

/**
 * The square centre-crop keeps only the middle 630x630. The wordmark sits
 * inside that with a margin, so it is never sliced.
 */
const LOGO_W = 560;

/** Logo is 876x191; keep the aspect ratio exact so it never distorts. */
const LOGO_H = Math.round((LOGO_W * 191) / 876);

/**
 * Not pure black: the wordmark is drawn with a heavy black outline, which
 * disappears into a near-black field and leaves the letters looking eroded.
 */
const INK = '#1b1714';

export default async function OpengraphImage() {
  const logo = readFileSync(join(process.cwd(), 'public', 'jamwire_icon.png'));
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: INK,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logoSrc} alt="" width={LOGO_W} height={LOGO_H} />
    </div>,
    size,
  );
}
