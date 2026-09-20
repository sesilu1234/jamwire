'use client';
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_CLIENT_API_KEY!;

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Jam } from '../types/jam';
import draftToHtml from 'draftjs-to-html';
import { RawDraftContentState } from 'draft-js';

import SocialLinks from './SocialLinks';
import UpvoteReport from './UpvoteReport';
import Confirmations from './Confirmations';
import StaticMap from './LocationImageGMaps';
import TimeAndPlace from './TimeAndPlace';
import JamChars from './JamChars';
import CommentSection from './CommentSection';

import { Space_Grotesk } from 'next/font/google';
import { BRAND } from '@/lib/brand';
import BrandLogo from '@/components/BrandLogo';
import SiteFooter from '@/components/SiteFooter';
import JamCardShadcn from '@/components/map/CardJam';
import { JamCard } from '@/types/jam';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '700'],
});

interface HtmlReadOnlyProps {
  rawContent: RawDraftContentState;
}

const HtmlReadOnly = ({ rawContent }: HtmlReadOnlyProps) => {
  const html = draftToHtml(rawContent);

  return (
    <div
      className="max-w-prose space-y-4 text-base leading-relaxed tracking-normal text-pretty"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export type JamWithComments = Jam & {
  comments: any;
  host_name: string;
  /** The session after this one, formatted server-side in the jam's own zone. */
  following_date?: string | null;
  /** "Every Thursday", for a weekly jam. */
  recurrence_label?: string | null;
};

/** One measure for every section, so nothing shifts as you scroll. */
const SHELL = 'mx-auto w-full max-w-[1200px] px-6';

/** Small uppercase label above each block. */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold tracking-[0.18em] text-tone-0/40 uppercase">
      {children}
    </h2>
  );
}

export default function JamComponent({
  jam,
  nearbyJams = [],
}: {
  jam: JamWithComments;
  nearbyJams?: JamCard[];
}) {
  if (!jam) return null;

  const isOpenMic = jam.modality === 'open_mic';
  const accent = isOpenMic
    ? 'var(--text-tone-modality-open-mic)'
    : 'var(--text-tone-modality-jam)';

  const hero = jam.images?.[0];
  const gallery = (jam.images ?? []).slice(1, 5);

  return (
    <div
      className={`${spaceGrotesk.className} min-h-screen bg-tone-5 text-tone-0`}
    >
      {/* Sticky: a jam page is usually the first thing someone sees from a
          shared link, so the way into the map shouldn't scroll away. */}
      <header className="sticky top-0 z-50 w-full border-b border-tone-0/10 bg-tone-5/80 backdrop-blur-md">
        <div
          className={`${SHELL} flex items-center justify-between gap-4 py-3`}
        >
          <Link href="/" aria-label={BRAND.name} className="shrink-0">
            <BrandLogo className="h-8 w-auto object-contain" />
          </Link>

          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 rounded-full border border-tone-0/15 px-4 py-2 text-sm font-medium text-tone-1/90 transition-colors hover:border-tone-0/35 hover:text-tone-0"
          >
            <ArrowLeft className="size-4" />
            <span className="sm:hidden">Map</span>
            <span className="hidden sm:inline">Explore the map</span>
          </Link>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────
          The title used to sit in a half-width column next to a floating
          thumbnail. A venue photo is the most persuasive thing on this page,
          so it runs full width with the title set over it. */}
      <section className="relative w-full overflow-hidden">
        <div className="relative h-[52vh] max-h-140 min-h-95 w-full">
          {hero ? (
            <Image
              src={hero}
              alt={`${jam.jam_title} at ${jam.location_title}`}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          ) : (
            <div className="absolute inset-0 bg-tone-4/30" />
          )}

          {/* Two scrims: vertical so the text always has a dark base, and
              horizontal so it survives a bright photo on a wide screen. */}
          <div className="absolute inset-0 bg-linear-to-t from-tone-5 via-tone-5/70 to-tone-5/20" />
          <div className="absolute inset-0 bg-linear-to-r from-tone-5/80 to-transparent" />

          <div className="absolute inset-x-0 bottom-0">
            <div className={`${SHELL} pb-10`}>
              <span
                className="text-xs font-black tracking-[0.25em] uppercase"
                style={{
                  color: accent,
                  textShadow: isOpenMic
                    ? 'var(--neon-glow-mic)'
                    : 'var(--neon-glow-jam)',
                }}
              >
                {isOpenMic ? 'Open Mic' : 'Jam Session'}
              </span>

              <h1 className="mt-3 max-w-4xl text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                {jam.jam_title}
              </h1>

              <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-tone-0/70 sm:text-lg">
                <span className="font-medium">{jam.location_title}</span>
                <span aria-hidden className="text-tone-0/30">
                  •
                </span>
                <span className="font-medium">{jam.display_date}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Body ───────────────────────────────────────────────────────────
          A narrow sticky rail rather than the old 50/50 split: the actions
          are small, and giving them half the page starved the writing. */}
      <div
        className={`${SHELL} grid grid-cols-1 gap-10 pt-12 pb-16 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14`}
      >
        <main className="flex min-w-0 flex-col gap-12">
          {/* The description is the only part of this page written by a
              person, so it gets a lead-in paragraph and an accent rule
              rather than sitting as one more undifferentiated block. */}
          <section>
            <div className="flex items-center gap-4">
              <SectionLabel>About this jam</SectionLabel>
              <span
                aria-hidden
                className="h-px flex-1 bg-linear-to-r from-tone-0/15 to-transparent"
              />
            </div>

            <div className="relative mt-6 pl-5 sm:pl-7">
              <span
                aria-hidden
                className="absolute top-1.5 bottom-1.5 left-0 w-px rounded-full opacity-60"
                style={{
                  backgroundImage: `linear-gradient(to bottom, ${accent}, transparent)`,
                }}
              />
              <div className="text-tone-0/80 [&_p:first-child]:text-lg [&_p:first-child]:text-tone-0/95">
                <HtmlReadOnly
                  rawContent={JSON.parse(jam.description as unknown as string)}
                />
              </div>
            </div>
          </section>

          <section>
            <JamChars
              accent={accent}
              jamDetails={{
                styles: jam.styles,
                drums: jam.drums,
                lista_canciones: jam.lista_canciones,
                instruments_lend: jam.instruments_lend,
              }}
            />
          </section>

          {gallery.length > 0 && (
            <section>
              <SectionLabel>Photos</SectionLabel>
              <div className="mt-4 grid grid-cols-2 gap-4">
                {gallery.map((img, i) => (
                  <div
                    key={img}
                    className={`group relative aspect-4/3 overflow-hidden rounded-xl border border-tone-0/10 ${
                      gallery.length === 1 ? 'col-span-2' : ''
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${jam.jam_title} photo ${i + 2}`}
                      fill
                      sizes="(max-width: 1024px) 50vw, 400px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <SectionLabel>On the map</SectionLabel>
            <div className="mt-4 overflow-hidden rounded-2xl border border-tone-0/10">
              <StaticMap
                address={jam.location_address}
                fallbackLat={jam.lat}
                fallbackLng={jam.lng}
                apiKey={API_KEY}
              />
            </div>
          </section>
        </main>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-tone-0/10 bg-tone-0/4 p-6">
            <TimeAndPlace
              location_title={jam.location_title}
              address={jam.location_address}
              fallbackLat={jam.lat}
              fallbackLng={jam.lng}
              slug={jam.slug}
              time={jam.display_date}
              recurrence={jam.recurrence_label}
              followingDate={jam.following_date}
            />
          </div>

          <Confirmations jamId={jam.id} />

          <SocialLinks socialLinks={jam.social_links} />

          <UpvoteReport jamId={jam.id} />
        </aside>
      </div>

      <CommentSection
        jamId={jam.id}
        comments={jam.comments}
        host_name={jam.host_name}
      />

      {nearbyJams.length > 0 && (
        <section className={`${SHELL} pb-20`}>
          <div className="flex items-center gap-4">
            <SectionLabel>More jams nearby</SectionLabel>
            <span
              aria-hidden
              className="h-px flex-1 bg-linear-to-r from-tone-0/15 to-transparent"
            />
          </div>

          <p className="mt-2 text-sm text-tone-0/50">
            Within 10 km of {jam.location_title}, in the next seven days.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {nearbyJams.map((card) => (
              <JamCardShadcn
                key={card.slug}
                classname="cursor-pointer border border-tone-0/15"
                jamName={card.jam_title}
                spotName={card.location_title}
                tags={card.styles}
                address={card.location_address}
                display_date={card.display_date}
                modality={card.modality}
                src={card.image}
                slug={card.slug}
              />
            ))}
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}
