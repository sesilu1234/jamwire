// page.tsx
'use client';
import React, { useState, useRef, useEffect } from 'react';
import { MapProvider } from './MapContext';

import dynamic from 'next/dynamic';
import GooglePlacesSearch from '@/components/map/GooglePlacesSearch';
import GooglePlacesSearchServer from './GooglePlacesSearchServer';
import JamCarousel from './jamsCarousel';
import { Input } from '@/components/ui/input';
import { Compass, Building2, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import SignInIcons from '@/components/map/SingInIcons';
import Filtro from '@/components/map/Filtro';
import CitiesSection from './CitiesSection';

import { JamCard, UserLocation } from '@/types/jam';
import { BRAND } from '@/lib/brand';
import BrandLogo from '@/components/BrandLogo';
import SiteFooter from '@/components/SiteFooter';
import NewJams from '@/components/home/NewJams';
import type { RecentJam } from '@/lib/getRecentJams';

interface HomeComponentProps {
  cards: JamCard[];
  userLocation: UserLocation;
  currentUsedPath: string;
  recentJams: RecentJam[];
}

const MapRender = dynamic(() => import('@/components/map/MapRender'), {
  ssr: false,
});

export default function HomeComponent({
  cards,
  userLocation,
  currentUsedPath,
  recentJams,
}: HomeComponentProps) {
  const [jams, setJams] = useState(cards);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<'local' | 'global'>('local');

  // The phone layout is a fixed shell — top bar, a map sized to the gap, tab
  // bar — that should add up to the viewport exactly. It still scrolled on a
  // real phone: the URL bar appearing and disappearing moves the goalposts
  // mid-layout, and browsers allow a rubber-band drag either way. Headless
  // has no URL bar, so no amount of measuring here reproduced it. Locking the
  // document is the fix that does not depend on getting that sum exactly
  // right. Desktop is untouched — that page is meant to scroll.
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const apply = () => {
      const lock = mq.matches;
      document.documentElement.style.overflow = lock ? 'hidden' : '';
      document.body.style.overflow = lock ? 'hidden' : '';
      document.body.style.overscrollBehavior = lock ? 'none' : '';
    };
    apply();
    mq.addEventListener('change', apply);
    return () => {
      mq.removeEventListener('change', apply);
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.overscrollBehavior = '';
    };
  }, []);


  return (
    <div className="flex flex-col min-h-dvh ">
      <MapProvider
        initialUserLocation={userLocation}
        resCards={cards}
        currentUsedPath={currentUsedPath}
      >
        {/* Phone: full-bleed map shell. From md: the original centered page. */}
        <div className="relative flex flex-col w-full px-2 pt-[var(--phone-topbar-h)] md:w-[1300px] md:max-w-[90%] md:mx-auto md:px-0 md:pt-0 md:mt-4">
          {/* ── Header: one bar ──────────────────────────────────────────
              Logo, search, filter and avatar on a single row. The search
              input and <Filtro> are single instances repositioned by CSS,
              never duplicated: a second <Filtro> would re-run its
              locationSearch effect and fire the jams fetch twice on every
              search, racing setJams against itself.
              On phone the controls become a fixed top bar: the wordmark is
              replaced by the square mark and the avatar drops out, because
              the account menu is a cell of the bottom tab bar. */}
          <div className="md:flex md:flex-wrap md:items-center md:gap-3 md:px-4 md:py-3 md:mb-4">
            <div className="hidden md:flex md:items-center md:order-1">
              <BrandLogo className="max-h-10 max-w-50 w-auto h-auto object-contain" />
            </div>

            <div
              className="fixed top-0 inset-x-0 z-[900] flex h-[var(--phone-topbar-h)] items-center gap-2 px-2 py-2
                         bg-tone-5/95 backdrop-blur border-b border-tone-3/40
                         md:static md:z-auto md:h-auto md:bg-transparent md:backdrop-blur-none
                         md:border-0 md:px-0 md:py-0 md:order-2 md:w-auto"
            >
              {/* Phone only. The wordmark above is md:flex, so on a phone
                  nothing on screen said whose site this was. The square mark
                  costs 40px of a row that still has to hold a search input —
                  the wordmark is 876x191 and would have taken half of it. */}
              <Link
                href="/"
                aria-label={BRAND.name}
                className="shrink-0 md:hidden"
              >
                <BrandLogo mark className="h-10 w-10 object-contain" />
              </Link>

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

          {/* Result count — desktop only.
              Was two uppercase bold lines at md:text-lg on opposite ends of the
              row ("9 JAMS FOUND" ... "SHOWING JAMS NEAR YOU"), which said the
              same thing twice and shouted louder than the map. One quiet line,
              with the number as the only emphasis. */}
          <div className="hidden px-3 pb-1 text-sm md:block">
            {loading ? (
              <span className="text-tone-0/45">Searching…</span>
            ) : searchType === 'local' ? (
              <span className="text-tone-0/50">
                <span className="font-semibold text-tone-0 tabular-nums">
                  {jams.length}
                </span>{' '}
                {jams.length === 1 ? 'jam' : 'jams'} near you
              </span>
            ) : (
              <span className="text-tone-0/50">Showing jams worldwide</span>
            )}
          </div>

          {/* Phone: exactly the gap between the two fixed bars. It used to be
              100dvh-8rem while starting 5rem down, so the bottom of the map —
              and the cards anchored to it — was clipped by the tab bar. */}
          <div className="relative w-full mx-auto h-[calc(100dvh-var(--phone-topbar-h)-var(--phone-tabbar-h))] rounded-lg md:mt-2 md:h-148 md:rounded-sm shadow-md overflow-hidden">
            <MapRender />
            <JamCarousel
              jams={jams}
              loading={loading}
              searchType={searchType}
            />
          </div>
        </div>
      </MapProvider>

      {/* Same order as the main map page: city links and fresh jams first,
          explainer last. Desktop only — the phone layout is a full-bleed map
          with a tab bar. `hidden` is CSS, not removal, so it stays crawlable. */}
      <div className="hidden md:block">
        <CitiesSection />
      </div>

      <div className="hidden md:block">
        <NewJams jams={recentJams} />
      </div>

      {/* Short on purpose — the full Q&A lives at /help. */}
      <div className="hidden w-full py-10 md:block">
        <div className="mx-auto w-[1300px] max-w-[90%] px-6">
          <div className="grid grid-cols-2 gap-12">
            <div className="flex flex-col gap-2 border-t-2 border-primary-1 pt-8">
              <h3 className="text-lg font-semibold">WHAT IS A JAM SESSION?</h3>
              <p className="text-sm leading-relaxed">
                A gathering where musicians get on stage and play together,
                improvising in the moment. You don&apos;t need to know anyone
                beforehand, and every night sounds different. Anyone can join in
                — or just hang out, listen, and have a good time.
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

      {/* Phone-only tab bar. Desktop keeps the header nav + footer links.

          The fourth cell is the account menu, not Help. The header avatar is
          md:block and the footer is md:block too, so on a phone there was no
          way to sign in, sign out or change the theme at all. Help and About
          moved inside that menu: a tab bar is for going places, and those two
          are read once. */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-[900] h-[var(--phone-tabbar-h)] flex items-stretch
                   bg-tone-5/95 backdrop-blur border-t border-tone-3/40"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {[
          { href: '/', label: 'Explore', Icon: Compass, active: true },
          { href: '/cities', label: 'Cities', Icon: Building2, active: false },
          { href: '/host', label: 'Add spot', Icon: PlusCircle, active: false },
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

        <SignInIcons compact />
      </nav>
    </div>
  );
}
