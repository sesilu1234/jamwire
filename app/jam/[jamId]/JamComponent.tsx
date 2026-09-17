'use client';
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_CLIENT_API_KEY!;

import Image from 'next/image';

import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Jam } from '../types/jam';
import draftToHtml from 'draftjs-to-html';
import { RawDraftContentState } from 'draft-js';
import SocialLinks from './SocialLinks';
import UpvoteReport from './UpvoteReport';
import StaticMap from './LocationImageGMaps';
import TimeAndPlace from './TimeAndPlace';
import { JamImagesTop, JamImagesBottom } from './JamImages';
import JamChars from './JamChars';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

import CommentSection from './CommentSection';

import { Space_Grotesk } from 'next/font/google';
import { BRAND } from '@/lib/brand';
import BrandLogo from '@/components/BrandLogo';
import SiteFooter from '@/components/SiteFooter';

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
      className="
     
    text-lg
    leading-relaxed
    tracking-wide
    space-y-5
    text-pretty
    max-w-prose
  "
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export type JamWithComments = Jam & {
  comments: any;
  host_name: string;
};

// Use it in your component
export default function JamComponent({ jam }: { jam: JamWithComments }) {
  if (!jam) return null;

  return (
    <div
      className={`${spaceGrotesk.className} min-h-screen bg-tone-5 text-tone-0`}
    >
      <div className=" ">
        <header className="w-full border-b border-tone-0/10">
          <div className="mx-auto flex w-full max-w-[1300px] items-center justify-between gap-4 px-6 py-4">
            <Link href="/" aria-label={BRAND.name} className="shrink-0">
              <BrandLogo className="h-8 w-auto object-contain sm:h-10" />
            </Link>

            {/* A jam page is often the first thing a visitor lands on from a
                shared link, so give them one obvious way into the map. */}
            <Link
              href="/"
              className="flex shrink-0 items-center gap-2 rounded-full border border-tone-0/15 px-4 py-2 text-sm font-medium text-tone-1/90 transition-colors hover:border-tone-0/35 hover:text-tone-0"
            >
              <span aria-hidden>&larr;</span>
              <span className="sm:hidden">Map</span>
              <span className="hidden sm:inline">Explore the map</span>
            </Link>
          </div>
        </header>

        <div className="max-w-6xl w-[80%] mx-auto flex flex-col-reverse lg:flex-row lg:items-center gap-10 lg:gap-20 mt-10 lg:mt-14 mb-8">
          <div className="lg:w-1/2 space-y-4 lg:text-right">
            {/* The "Glowing" Accent Text */}
            <span
              className="font-black tracking-[0.25em] text-xs uppercase transition-all duration-700"
              style={{
                color:
                  jam.modality === 'open_mic'
                    ? 'var(--text-tone-modality-open-mic)'
                    : 'var(--text-tone-modality-jam)',
                textShadow:
                  jam.modality === 'open_mic'
                    ? 'var(--neon-glow-mic)'
                    : 'var(--neon-glow-jam)',
              }}
            >
              {jam.modality === 'open_mic' ? 'Open Mic' : 'Featured Jam'}
            </span>

            <h3 className="text-4xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-tone-0">
              {jam.jam_title}
              <span className="block text-tone-2/60 text-2xl lg:text-3xl mt-2 font-medium">
                at {jam.location_title}
              </span>
            </h3>
          </div>

          <div className="lg:w-1/2 w-full">
            <JamImagesTop images={jam.images.slice(0, 1)} />
          </div>
        </div>
        <div className="flex flex-col-reverse lg:flex-row  gap-6 w-[1300px] max-w-[90%] lg:max-w-[75%] mx-auto pt-0 lg:pt-0 pb-12 mt-12">
          <div className="flex flex-col   lg:w-1/2">
            {/* Left column: JamChars */}
            <div className="rounded-xl  pt-8 pb-10 px-8 border border-white/10 bg-tone-0/5  w-full">
              <JamChars
                jamDetails={{
                  styles: jam.styles,
                  drums: jam.drums,
                  lista_canciones: jam.lista_canciones,
                  instruments_lend: jam.instruments_lend,
                }}
              />
            </div>

            <div className="flex flex-col gap-4  rounded-lg  pt-18  pb-18 px-8">
              <h3 className="text-sm font-semibold"></h3>

              <div>
                <HtmlReadOnly
                  rawContent={JSON.parse(jam.description as unknown as string)}
                />
              </div>
            </div>
            <StaticMap
              address={jam.location_address}
              fallbackLat={jam.lat}
              fallbackLng={jam.lng}
              apiKey={API_KEY}
            />
          </div>

          {/* Right column: TimeAndPlace sticky */}

          <div className="lg:sticky top-24 rounded-xl lg:w-1/2 flex flex-col pt-8 pb-10 px-8 border border-white/10 mx-auto self-start bg-tone-0/5">
            <TimeAndPlace
              location_title={jam.location_title}
              address={jam.location_address}
              fallbackLat={jam.lat}
              fallbackLng={jam.lng}
              slug={jam.slug}
              time={jam.display_date}
            />
          </div>
        </div>

        <div className="flex flex-col gap-12 w-[1300px] max-w-[85%]  lg:max-w-[75%] mx-auto pb-12 ">
          <JamImagesBottom images={jam.images.slice(1, 3)} />
        </div>

        <div className="flex flex-col lg:flex-row w-[1300px] max-w-[85%]  lg:max-w-[75%] mx-auto pb-12 lg:pb-24 overflow-hidden ">
          <SocialLinks socialLinks={jam.social_links} />
          <UpvoteReport jamId={jam.id} />
        </div>

        {/* <JamComments/> */}
        <CommentSection
          jamId={jam.id}
          comments={jam.comments}
          host_name={jam.host_name}
        />

        <SiteFooter />
      </div>
    </div>
  );
}
