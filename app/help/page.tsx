import Link from 'next/link';
import type { Metadata } from 'next';
import { BRAND } from '@/lib/brand';
import BrandLogo from '@/components/BrandLogo';
import SiteFooter from '@/components/SiteFooter';
import SignInIcons from '@/components/map/SingInIcons';

export const metadata: Metadata = {
  title: 'Help / FAQ',
  description: `What a jam session is, what to bring, how open mics work, and the basic etiquette. ${BRAND.name}.`,
};

/**
 * Grouped rather than one flat list: the first four answers are about jams and
 * the last two about open mics, and they're different enough that a reader
 * looking for one shouldn't have to scan the other.
 */
const SECTIONS = [
  {
    title: 'Jam sessions',
    items: [
      {
        q: 'What is a jam session?',
        a: 'Musicians getting together to play. Sometimes it is completely free-form, sometimes the group works through a song everyone already knows, and often it is a mix of both.',
      },
      {
        q: 'Where do they happen?',
        a: 'Usually bars, small venues and places built around live music, though they also happen outdoors or in studios.',
      },
      {
        q: 'What should I bring?',
        a: 'Your instrument and the willingness to play. Some venues keep instruments on site, so it is worth checking the listing before you carry anything across town.',
      },
      {
        q: 'Basic etiquette',
        a: 'Respect the rotation, do not play over other musicians, and go along with whoever is running the jam, even when you think they have got it wrong.',
      },
    ],
  },
  {
    title: 'Open mics',
    items: [
      {
        q: 'What is an open mic?',
        a: 'An event where anyone can get on stage to play, sing or recite, usually without signing up in advance. Good for trying out new songs, playing to an actual room, and meeting other musicians.',
      },
      {
        q: 'Tips for taking part',
        a: 'Get there early, prepare a couple of short songs, respect the running order, and enjoy it. Your level does not matter — the point is to share and to learn.',
      },
    ],
  },
];

export default function Help() {
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

        <h1 className="mt-16 text-3xl font-medium tracking-tight">FAQ</h1>
        <p className="mt-2 text-tone-0/55">
          How jams and open mics work, if you have never been to one.
        </p>

        <div className="mt-8 h-px w-12 bg-brand" />

        {SECTIONS.map((section) => (
          <section key={section.title} className="mt-12">
            <h2 className="text-xs font-semibold tracking-[0.12em] text-tone-0/40 uppercase">
              {section.title}
            </h2>

            <dl className="mt-5 divide-y divide-tone-0/10 border-t border-tone-0/10">
              {section.items.map((item) => (
                <div key={item.q} className="py-5">
                  <dt className="font-medium">{item.q}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-tone-0/60">
                    {item.a}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}

        <p className="mt-12 text-sm text-tone-0/50">
          Still stuck, or something on the site is broken?{' '}
          <Link
            href="/contact"
            className="underline underline-offset-4 hover:text-tone-0/80"
          >
            Get in touch
          </Link>
          .
        </p>
      </div>

      <SiteFooter />
    </div>
  );
}
