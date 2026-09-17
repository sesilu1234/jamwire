import Link from 'next/link';
import type { Metadata } from 'next';
import { BRAND } from '@/lib/brand';
import BrandLogo from '@/components/BrandLogo';

export const metadata: Metadata = {
  title: 'About',
  description: `${BRAND.tagline} ${BRAND.name} is a live map of jam sessions and open mics.`,
};

/** Three-beat pitch. Kept short on purpose — the map is the product. */
const BEATS = [
  {
    emoji: '🎸',
    title: 'Play',
    body: 'Bring your instrument, get on the list, take a solo. No audition, no band required.',
  },
  {
    emoji: '🍻',
    title: 'Watch',
    body: 'Or just show up, order something, and let the night happen around you.',
  },
  {
    emoji: '📍',
    title: 'Host',
    body: 'Run a jam or an open mic? Put it on the map so people can actually find it.',
  },
];

export default function About() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-tone-5 text-tone-0">
      {/* Warm glow behind the fold — the logo's amber, very diffuse. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] opacity-60"
        style={{
          background:
            'radial-gradient(60% 70% at 50% 0%, oklch(78% 0.16 75 / 0.35) 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto w-full max-w-3xl px-6 py-10 lg:py-16">
        <Link href="/" className="inline-block">
          <BrandLogo className="h-12 w-auto object-contain" />
        </Link>

        <h1 className="mt-14 text-4xl leading-tight font-semibold text-balance lg:text-5xl">
          Music happens somewhere tonight.
          <br />
          <span style={{ color: 'oklch(78% 0.16 75)' }}>This is where.</span>
        </h1>

        <p className="mt-6 max-w-xl text-lg text-tone-0/70">
          {BRAND.name} is a live map of jam sessions and open mics — the
          recurring, unticketed, show-up-and-play kind. The ones that are
          usually only findable if someone already told you about them.
        </p>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {BEATS.map((beat) => (
            <div
              key={beat.title}
              className="rounded-2xl border border-tone-0/10 bg-tone-6/40 p-5 transition-colors hover:border-tone-0/25"
            >
              <span className="text-2xl" aria-hidden>
                {beat.emoji}
              </span>
              <p className="mt-3 font-semibold">{beat.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-tone-0/65">
                {beat.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="rounded-full px-6 py-3 font-semibold text-tone-6 transition-transform hover:scale-[1.03]"
            style={{ backgroundColor: 'oklch(78% 0.16 75)' }}
          >
            Open the map
          </Link>
          <Link
            href="/host"
            className="rounded-full border border-tone-0/20 px-6 py-3 font-semibold transition-colors hover:border-tone-0/40"
          >
            Add a jam
          </Link>
        </div>

        <p className="mt-16 border-t border-tone-0/10 pt-6 text-sm text-tone-0/50">
          Built by one person who got tired of hearing about a great jam the
          morning after.{' '}
          <Link href="/contact" className="underline hover:text-tone-0/80">
            Say hi
          </Link>{' '}
          or{' '}
          <Link href="/help" className="underline hover:text-tone-0/80">
            read the FAQ
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
