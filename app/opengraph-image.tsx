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
 */

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = `${BRAND.name} — ${BRAND.tagline}`;

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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logoSrc} alt="" width={740} height={161} />

      <div
        style={{
          marginTop: 44,
          fontSize: 38,
          color: '#f4ede4',
          letterSpacing: -0.5,
        }}
      >
        {BRAND.tagline}
      </div>

      <div
        style={{
          marginTop: 20,
          fontSize: 26,
          color: AMBER,
          letterSpacing: 2,
        }}
      >
        {BRAND.siteUrl.replace(/^https?:\/\//, '').toUpperCase()}
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
