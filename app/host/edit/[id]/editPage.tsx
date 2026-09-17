'use client';

import React, { useRef } from 'react';
import EditSections_desktop from './EditSections_desktop';
import EditSections_phone from './EditSections_phone';
import EditArea from './EditArea';
import { useRouter } from 'next/navigation';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function Home() {
  const childSaveOnUnmount = useRef<() => void>(() => {});
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen flex-col bg-stone-50 text-zinc-900 lg:flex-row">
      {/* ---------------------------------------------------------------- */}
      {/* Side rail                                                         */}
      {/* ---------------------------------------------------------------- */}
      <aside
        className="
          relative z-20 flex flex-col shrink-0
          bg-[#17130d] bg-gradient-to-b from-[#1c1710] to-[#0c0a08] text-zinc-100
          lg:w-[288px] lg:h-screen lg:sticky lg:top-0
          border-b border-amber-200/10 lg:border-b-0 lg:border-r
        "
      >
        {/* soft brand glow, purely decorative */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-amber-400/15 blur-3xl"
        />

        <div className="relative flex flex-col gap-1 px-6 pt-6 lg:px-7 lg:pt-8">
          <Dialog>
            <DialogTrigger asChild>
              <button className="group flex w-fit items-center gap-2 text-amber-100/50 transition-colors hover:text-amber-100 cursor-pointer">
                <span className="hidden lg:flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="18px"
                    viewBox="0 -960 960 960"
                    width="18px"
                    fill="currentColor"
                    className="transition-transform group-hover:-translate-x-0.5"
                  >
                    <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
                  </svg>
                  <span className="text-[13px] font-medium tracking-tight">
                    Back to home page
                  </span>
                </span>
                <span className="lg:hidden rounded-full border border-amber-200/25 px-3 py-1 text-[12px] font-medium tracking-tight transition-colors group-hover:border-amber-200/50">
                  Exit
                </span>
              </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[420px] rounded-2xl border-zinc-200 bg-white text-zinc-900">
              <DialogHeader>
                <DialogTitle className="text-lg tracking-tight">
                  Leave without saving?
                </DialogTitle>
                <DialogDescription className="text-sm text-zinc-500">
                  Your changes haven’t been saved. If you leave now, they’ll be
                  lost.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter className="gap-2">
                <DialogClose asChild>
                  <Button
                    variant="ghost"
                    className="rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                  >
                    Stay
                  </Button>
                </DialogClose>

                <Button
                  variant="destructive"
                  className="rounded-xl"
                  onClick={() => {
                    router.push('/host');
                  }}
                >
                  Leave anyway
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Wordmark + context */}
          <div className="mt-5 hidden lg:block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-400">
              jamspots
            </p>
            <h1 className="mt-1.5 text-[26px] font-bold leading-tight tracking-tight text-white">
              Edit jam
            </h1>
            <p className="mt-1.5 text-[13px] leading-snug text-amber-100/40">
              Change what you need, then save when you’re ready.
            </p>
          </div>
        </div>

        <div className="relative mt-4 lg:mt-7 lg:flex-1 lg:overflow-y-auto">
          <div className="lg:hidden">
            <EditSections_phone childSaveOnUnmount={childSaveOnUnmount} />
          </div>
          <div className="hidden lg:block">
            <EditSections_desktop childSaveOnUnmount={childSaveOnUnmount} />
          </div>
        </div>

        <div className="relative hidden lg:block px-7 pb-6 pt-4">
          <p className="text-[11px] leading-relaxed text-amber-100/30">
            Your changes go live once you hit{' '}
            <span className="text-amber-200/60">Save and exit</span>.
          </p>
        </div>
      </aside>

      {/* ---------------------------------------------------------------- */}
      {/* Workspace                                                         */}
      {/* ---------------------------------------------------------------- */}
      <main className="min-w-0 flex-1 bg-stone-50">
        <EditArea childSaveOnUnmount={childSaveOnUnmount} />
      </main>
    </div>
  );
}
