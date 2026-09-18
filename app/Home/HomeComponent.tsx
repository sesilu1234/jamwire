// page.tsx
'use client';
import React, { useState, useRef, useEffect } from 'react';
import { MapProvider } from './MapContext';

import dynamic from 'next/dynamic';
import GooglePlacesSearch from '@/components/map/GooglePlacesSearch';
import GooglePlacesSearchServer from './GooglePlacesSearchServer';
import JamCarousel from './jamsCarousel';
import { Input } from '@/components/ui/input';
import { Menu, Compass, Building2, PlusCircle, CircleHelp } from 'lucide-react';
import Link from 'next/link';
import SignInIcons from '@/components/map/SingInIcons';
import Filtro from '@/components/map/Filtro';

import { JamCard, UserLocation } from '@/types/jam';
import { BRAND } from '@/lib/brand';
import BrandLogo from '@/components/BrandLogo';

import CitiesSection from './CitiesSection';
import SiteFooter from '@/components/SiteFooter';
import NewJams from '@/components/home/NewJams';
import type { RecentJam } from '@/lib/getRecentJams';

interface HomeComponentProps {
  cards: JamCard[];
  userLocation: UserLocation;
  recentJams: RecentJam[];
}

const MapRender = dynamic(() => import('@/components/map/MapRender'), { ssr: false });

export default function HomeComponent({
  cards,
  userLocation,
  recentJams,
}: HomeComponentProps) {
  const [jams, setJams] = useState(cards);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<'local' | 'global'>('local');
  return (
    <div className="flex flex-col min-h-screen ">
      <MapProvider initialUserLocation={userLocation} resCards={cards}>
        {/* Phone: full-bleed map shell. From md: the original centered page. */}
        <div className="relative flex flex-col w-full px-2 pt-16 md:w-[1300px] md:max-w-[90%] md:mx-auto md:px-0 md:pt-0 mt-4">
          {/* ── Header: one bar ──────────────────────────────────────────
              Logo, search, filter and avatar on a single row. The search
              input and <Filtro> are single instances repositioned by CSS,
              never duplicated: a second <Filtro> would re-run its
              locationSearch effect and fire the jams fetch twice on every
              search, racing setJams against itself.
              On phone the controls become a fixed top bar and the logo and
              avatar drop out — the avatar lives in the bottom tab bar. */}
          <div className="md:flex md:flex-wrap md:items-center md:gap-3 md:px-4 md:py-3 md:mb-4">
            <div className="hidden md:flex md:items-center md:order-1">
              <BrandLogo className="max-h-10 max-w-50 w-auto h-auto object-contain" />
            </div>

            <div
              className="fixed top-0 inset-x-0 z-[900] flex items-center gap-2 px-2 py-2
                         bg-tone-5/95 backdrop-blur border-b border-tone-3/40
                         md:static md:z-auto md:bg-transparent md:backdrop-blur-none
                         md:border-0 md:px-0 md:py-0 md:order-2 md:w-auto"
            >
              <div className="flex-1 min-w-0 md:w-52 md:flex-none">
                <GooglePlacesSearchServer />
              </div>
              <Filtro
                setJams={setJams}
                setLoading={setLoading}
                setSearchType={setSearchType}
              />
            </div>

            <div className="hidden md:block md:order-3 md:ml-auto">
              <SignInIcons />
            </div>
          </div>

          {/* Result counts — desktop only; on phone the map gets the space. */}
          <div className="hidden md:flex justify-between items-end px-3 font-semibold uppercase tracking-wide text-xs md:text-lg">
            {searchType === 'local' ? (
              <span>{jams.length} jams found</span>
            ) : (
              <span>Showing jams worldwide</span>
            )}

            <div className="flex flex-col items-end">
              {searchType === 'local' ? (
                <span> Showing jams near you </span>
              ) : (
                <span> Showing global </span>
              )}
            </div>
          </div>

          {/* Phone: viewport minus the top bar (4rem) and tab bar (4rem). */}
          <div className="relative w-full mx-auto h-[calc(100dvh-8rem)] rounded-lg md:mt-2 md:h-148 md:rounded-sm shadow-md overflow-hidden">
            <MapRender />
            <JamCarousel
              jams={jams}
              loading={loading}
              searchType={searchType}
            />
          </div>
        </div>
      </MapProvider>

      {/* Below the map, desktop only — the phone layout is a full-bleed map
          with a tab bar, so there is nothing here to scroll to. `hidden` is
          CSS rather than removal, so this markup is still in the HTML and
          still crawled.

          Order is deliberate: city links and fresh jams first, because they
          are useful to someone who has been here before; the explainer last,
          because it is only useful once. */}
      <div className="hidden md:block">
        <CitiesSection />
      </div>

      <div className="hidden md:block">
        <NewJams jams={recentJams} />
      </div>

      {/* Short on purpose. The full Q&A lives at /help — a second copy here
          split the ranking between two pages and would have drifted. */}
      <div className="hidden w-full py-10 md:block">
        <div className="mx-auto w-[1300px] max-w-[90%] px-6">
          <div className="grid grid-cols-2 gap-12">
            <div className="flex flex-col gap-2 border-t-2 border-primary-1 pt-8">
              <h3 className="text-lg font-semibold">WHAT IS A JAM SESSION?</h3>
              <p className="text-sm leading-relaxed">
                A gathering where musicians get on stage and play together,
                improvising in the moment. You don&apos;t need to know anyone
                beforehand, and every night sounds different. Anyone can join
                in — or just hang out, listen, and have a good time.
              </p>
            </div>

            <div className="flex flex-col gap-3 border-t-2 border-primary-1 pt-8 text-sm leading-relaxed">
              <p>
                First time? You can play, sing, or just watch. There is usually
                a backline — drums, an amp, a mic — and most sessions are free
                or ask for a drink.
              </p>
              <Link
                href="/help"
                className="font-semibold text-primary-1 hover:underline"
              >
                Read the full FAQ →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <SiteFooter className="hidden md:block" />

      {/* Phone-only tab bar. Desktop keeps the header nav + footer links. */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-[900] h-16 flex items-stretch
                   bg-tone-5/95 backdrop-blur border-t border-tone-3/40"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {[
          { href: '/', label: 'Explore', Icon: Compass, active: true },
          { href: '/cities', label: 'Cities', Icon: Building2, active: false },
          { href: '/host', label: 'Add spot', Icon: PlusCircle, active: false },
          { href: '/help', label: 'Help', Icon: CircleHelp, active: false },
        ].map(({ href, label, Icon, active }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wide transition-colors ${
              active ? 'text-tone-0' : 'text-tone-1/60 hover:text-tone-0'
            }`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
