import { ImageResponse } from 'next/og';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BRAND } from '@/lib/brand';

/**
 * The social preview card (WhatsApp, Twitter/X, Facebook, Slack, Discord).
 *
 * Generated rather than shipped as a static file so it can never drift from
 * `lib/brand.ts` — change the name, tagline or logo there and this follows.
 * 1200x630 is the size every platform crops from; anything else letterboxes.
 *
 * SAFE ZONE: several clients (the WhatsApp composer, Slack compact mode,
 * Telegram, Discord) don't show the wide card at all — they centre-crop it to
 * a square thumbnail. That crop keeps only the middle 630x630, so everything
 * that must stay readable lives inside SAFE_W below. Widen the logo past that
 * and the ends of the wordmark get sliced off.
 */

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = `${BRAND.name} — ${BRAND.tagline}`;

/** Centre-crop width, minus a little breathing room. */
const SAFE_W = 540;

const AMBER = '#f5a623';
const INK = '#14100c';

export default async function OpengraphImage() {
  const logo = readFileSync(join(process.cwd(), 'public', 'jamwire_icon.png'));
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: INK,
        backgroundImage: `radial-gradient(circle at 50% 8%, rgba(245,166,35,0.28) 0%, rgba(245,166,35,0) 62%)`,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          width: SAFE_W,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt="" width={SAFE_W} height={118} />

        <div
          style={{
            marginTop: 36,
            // Narrower than SAFE_W so the tagline breaks into two even lines
            // rather than leaving one orphan word on the second.
            width: 440,
            fontSize: 34,
            lineHeight: 1.3,
            color: '#f4ede4',
            letterSpacing: -0.5,
          }}
        >
          {BRAND.tagline}
        </div>

        <div
          style={{
            marginTop: 26,
            fontSize: 24,
            color: AMBER,
            letterSpacing: 2,
          }}
        >
          {BRAND.siteUrl.replace(/^https?:\/\//, '').toUpperCase()}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          height: 10,
          backgroundColor: AMBER,
        }}
      />
    </div>,
    size,
  );
}
