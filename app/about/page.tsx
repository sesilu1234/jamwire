import Link from 'next/link';
import type { Metadata } from 'next';
import { Guitar, Beer, MapPin } from 'lucide-react';
import { BRAND } from '@/lib/brand';
import BrandLogo from '@/components/BrandLogo';
import SiteFooter from '@/components/SiteFooter';
import SignInIcons from '@/components/map/SingInIcons';

export const metadata: Metadata = {
  title: 'About',
  description: `${BRAND.tagline} ${BRAND.name} is a live map of jam sessions and open mics.`,
};

/** Three-beat pitch. Kept short on purpose — the map is the product. */
const BEATS = [
  {
    icon: Guitar,
    title: 'Play',
    body: 'Bring your instrument, get on the list, take a solo. No audition, no band required.',
  },
  {
    icon: Beer,
    title: 'Watch',
    body: 'Or just show up, order something, and let the night happen around you.',
  },
  {
    icon: MapPin,
    title: 'Host',
    body: 'Run a jam or an open mic? Put it on the map so people can actually find it.',
  },
];

export default function About() {
  return (
    <div className="flex min-h-screen flex-col bg-tone-5 text-tone-0">
      <div className="mx-auto w-full max-w-xl flex-1 px-6 py-12">
        {/* The logo alone used to be the whole header. On a phone the map's
            tab bar is the only account menu in the app, and it does not
            follow you here — so theme and sign out were unreachable from any
            content page. Same pair as the map header, same component. */}
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="inline-block" aria-label={BRAND.name}>
            <BrandLogo className="h-9 w-auto object-contain" />
          </Link>

          <SignInIcons />
        </div>

        <h1 className="mt-16 text-2xl font-medium">About</h1>

        <p className="mt-2 text-sm text-tone-0/60">
          {BRAND.name} is a live map of jam sessions and open mics. The
          recurring, unticketed, show-up-and-play kind. The ones that are
          usually only findable if someone already told you about them.
        </p>

        <dl className="mt-10 space-y-6 border-t border-tone-0/10 pt-10">
          {BEATS.map((beat) => (
            <div key={beat.title} className="flex gap-4">
              <beat.icon
                className="mt-0.5 size-4 shrink-0 text-tone-0/40"
                strokeWidth={1.75}
                aria-hidden
              />
              <div>
                <dt className="text-sm font-medium">{beat.title}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-tone-0/60">
                  {beat.body}
                </dd>
              </div>
            </div>
          ))}
        </dl>

        <div className="mt-10 flex gap-6 border-t border-tone-0/10 pt-10 text-sm">
          <Link href="/" className="underline hover:text-tone-0/70">
            Open the map
          </Link>
          <Link href="/host" className="underline hover:text-tone-0/70">
            Add a jam
          </Link>
        </div>

        <p className="mt-10 text-sm text-tone-0/50">
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

      <SiteFooter />
    </div>
  );
}
