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
        <div className="flex justify-between w-[1300px] max-w-[90%] mx-auto p-0">
          <Link href="/" className="mx-auto lg:ml-3 flex gap-2 items-end">
           <div
  className="ml-0 flex justify-end gap-2 items-end lg:w-118 lg:h-24 p-4 pb-2 pt-2 rounded-b-3xl
   shadow-[5px_0_6px_-1px_var(--tone-3),_-5px_0_6px_-1px_var(--tone-3),0_6px_6px_-1px_var(--tone-3)]"
>
  <BrandLogo className="max-h-16 max-w-75 w-auto h-auto object-contain" />

  <p className="hidden lg:block text-xs py-4 text-text-2 font-semibold">
    {BRAND.tagline}
  </p>
</div>
          </Link>

          {/* <div className="w-16 h-16 ">
            <Avatar className="">
              <AvatarImage
                src="https://github.com/shadcn.png"
                className="rounded-full"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div> */}
        </div>

        <div className="max-w-6xl w-[80%] mx-auto flex flex-col-reverse lg:flex-row lg:items-center gap-10 lg:gap-20 mt-16 mb-8">
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
        <CommentSection jamId={jam.id} comments={jam.comments} host_name={jam.host_name}/>

        <footer className="w-full bg-bg/0 pb-12 mt-0 flex-1 ">
          <div className="flex items-center justify-center gap-12 max-w-[90%] w-[1300px] mx-auto p-6 pt-12 h-full border-t-2 border-primary-1">
            {/* Navigation Links */}
            <div className="flex flex-col text-tone-1/95 items-between justify-between gap-8 ">
              <Link
                href="/contact"
                className="hover:text-tone-0  cursor-pointer"
              >
                CONTACT
              </Link>
              <Link href="/help" className="hover:text-tone-0  cursor-pointer">
                HELP
              </Link>
              <Link href="/about" className="hover:text-tone-0  cursor-pointer">
                ABOUT
              </Link>
            </div>

            {/* Branding / Tagline */}
            <div className="flex flex-col sm:flex-row items-end justify-center gap-2 ">
              <BrandLogo className="max-h-16 max-w-75 w-auto h-auto object-contain" />
              <p className="text-sm  text-center font-medium sm:text-left pb-3">
                {BRAND.tagline}
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
