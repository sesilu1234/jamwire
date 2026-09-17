'use client';
import { useState, useRef, useEffect } from 'react';

import Sections from './sections';
import { useRouter, useSearchParams } from 'next/navigation';

import { validateJam } from './clientCheck';
import { convertFromRaw } from 'draft-js';

import { Jam } from './typeCheck';

import { useParams } from 'next/navigation';

import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

import { useAtom } from 'jotai';
import { formAtom } from './store/jotai';

import { useFormStore } from './store/formStore'; // path a tu store

type EditAreaProps = {
  childSaveOnUnmount: React.RefObject<() => void>;
};

const SECTION_META: Record<string, { title: string; hint: string }> = {
  informaciongeneral: {
    title: 'General information',
    hint: 'Name your jam, place it on the map and set when it happens.',
  },
  fotos: {
    title: 'Photos',
    hint: 'Three photos. The first one is the cover — drag to reorder.',
  },
  caracteristicas: {
    title: 'Site features',
    hint: 'Modality, musical styles and what the venue provides.',
  },
  descripcion: {
    title: 'Description',
    hint: 'Tell people what the night feels like.',
  },
  redessociales: {
    title: 'Social media',
    hint: 'Optional links so people can follow the spot.',
  },
};

export default function EditArea({ childSaveOnUnmount }: EditAreaProps) {
  const setForm = useFormStore((state) => state.setForm);

  const router = useRouter(); // ✅ call hook here, at top level

  const searchParams = useSearchParams();
  const sectionParam = searchParams.get('section') || 'informaciongeneral';
  const meta = SECTION_META[sectionParam] ?? SECTION_META.informaciongeneral;

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setForm({
      generalInfo: {
        jam_title: '',
        location_title: '',
        location_address: '',
        coordinates: {
          lat: '',
          lng: '',
        },
        dates: {
          period: 'manual',
          day_of_week: null,
          time: { from: '21:30', to: null },
          list_of_dates: [],
        },
      },
      photos: { images: [] },
      features: {
        modality: 'jam',
        styles: [],
        song_list: false,
        intruments_lend: true,
        drums: true,
      },
      description: { description: null },
      social: {
        instagram: '',
        facebook: '',
        siteWeb: '',
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setLoading(false);
  }, []);
  // ✅ solo se ejecuta cuando cambia id

  //#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-
  //#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-
  //#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-
  //#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-
  //#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-
  //#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-
  //#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-
  //#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-
  //#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-
  //#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-

  //#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-
  //#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-
  //#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-
  //#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-
  //#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-
  //#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-
  //#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-
  //#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-
  //#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-
  //#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-

  const handleSave = async () => {
    childSaveOnUnmount.current();

    const form = useFormStore.getState().form;

    const images_files: File[] = [];
    for (const url of form.photos.images) {
      const res = await fetch(url);
      const blob = await res.blob();
      // optional: give a filename
      images_files.push(
        new File([blob], `image-${Date.now()}.png`, { type: blob.type }),
      );
    }

    let raw_desc = '';
    try {
      raw_desc = convertFromRaw(form.description.description!)
        .getPlainText()
        .trim();
    } catch {}

    const jamData = {
      jam_title: form.generalInfo.jam_title,
      location_title: form.generalInfo.location_title,
      location_address: form.generalInfo.location_address,
      periodicity: form.generalInfo.dates.period,
      dayOfWeek: form.generalInfo.dates.day_of_week,
      dates: form.generalInfo.dates.list_of_dates,
      time_start: form.generalInfo.dates.time.from,
      images_three: images_files.length == 3 ? true : false,
      modality: form.features.modality,
      styles: form.features.styles,
      lista_canciones: form.features.song_list,
      raw_desc: raw_desc,

      instruments_lend: form.features.intruments_lend,
      drums: form.features.drums,
      description: form.description.description,
      social_links: form.social,
      location_coords: form.generalInfo.coordinates,
    };

    const parsed_jamData = validateJam(jamData as unknown as Partial<Jam>);

    if (!parsed_jamData.success) {
      // Get the first error message from the errors object
      let firstMsg = 'Unknown error';

      const errorsObj = parsed_jamData.errors;
      if (errorsObj && Object.keys(errorsObj).length > 0) {
        const firstKey = Object.keys(errorsObj)[0];
        firstMsg = errorsObj[firstKey];
      }

      return { success: false, message: firstMsg };
    }

    const payload = new FormData();
    payload.append('jamColumns', JSON.stringify(jamData));
    images_files.forEach((file) => payload.append('images', file));

    const res = await fetch('/api/private/create-session', {
      method: 'POST',
      body: payload, // ⬅️ solo FormData
    });
    const data = await res.json();

    if (!res.ok) {
      return { success: false, message: data.error };
    }
    return { success: true };
  };

  const [progress, setProgress] = useState<number>(0);

  const [saving, setSaving] = useState(false);

  if (loading) return null;
  return (
    <div className="flex min-h-screen flex-col">
      {saving ? (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-zinc-950/50 backdrop-blur-sm">
          <div className="flex w-[280px] flex-col items-center gap-5 rounded-2xl border border-zinc-200 bg-white px-7 py-8 shadow-2xl">
            <span className="h-7 w-7 animate-spin rounded-full border-2 border-zinc-200 border-t-amber-400" />
            <div className="text-center">
              <p className="text-[15px] font-semibold tracking-tight text-zinc-900">
                Publishing your jam
              </p>
              <p className="mt-1 text-[12px] text-zinc-500">
                Hang tight, this takes a moment.
              </p>
            </div>
            <ProgressDemo progress={progress} setProgress={setProgress} />
          </div>
        </div>
      ) : null}

      {/* ---------------------------------------------------------------- */}
      {/* Sticky workspace header                                           */}
      {/* ---------------------------------------------------------------- */}
      <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-stone-50/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-4 sm:px-8 sm:py-5">
          <div className="min-w-0">
            <h2 className="truncate text-[18px] font-bold tracking-tight text-zinc-900 sm:text-[22px]">
              {meta.title}
            </h2>
            <p className="mt-0.5 hidden truncate text-[13px] text-zinc-500 sm:block">
              {meta.hint}
            </p>
          </div>

          <button
            className="
              inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl
              bg-zinc-900 px-4 text-[13px] font-semibold tracking-tight text-white
              shadow-sm transition-all duration-200 cursor-pointer
              hover:bg-zinc-800 hover:shadow-md
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2
              disabled:cursor-not-allowed disabled:opacity-60
              sm:px-5 sm:text-sm
            "
            disabled={saving}
            onClick={async () => {
              setProgress(13);
              setSaving(true);

              const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

              // run progress animation in parallel with save
              const savePromise = handleSave(); // run but capture result
              await Promise.all([
                (async () => {
                  await wait(500);
                  setProgress(33);
                  await wait(1000);
                  setProgress(66);
                })(),
                savePromise,
              ]);

              const saveResult = await savePromise; // handleSave should return { success: true/false }

              if (!saveResult?.success) {
                setSaving(false);
                toast(saveResult.message, {
                  description: 'Client data error',
                  action: {
                    label: 'Understood',
                    onClick: () => console.log('Understood'),
                  },
                });
                return; // only navigate if success
              }

              await wait(200);
              setProgress(100);
              await wait(200);

              router.push('/host'); // only navigate if success
            }}
          >
            {saving ? (
              'Saving…'
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="16px"
                  viewBox="0 -960 960 960"
                  width="16px"
                  fill="currentColor"
                  className="hidden sm:block"
                >
                  <path d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160Zm-80 34L646-760H200v560h560v-446ZM480-240q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM240-560h360v-160H240v160Zm-40-86v446-560 114Z" />
                </svg>
                Save and exit
              </>
            )}
          </button>
        </div>
      </header>

      {/* ---------------------------------------------------------------- */}
      {/* Section body                                                      */}
      {/* ---------------------------------------------------------------- */}
      <div className="mx-auto w-full max-w-5xl flex-1 px-5 pb-24 pt-6 sm:px-8 sm:pt-8">
        <Sections childSaveOnUnmount={childSaveOnUnmount} />
      </div>

      <Toaster />
    </div>
  );
}

import { Progress } from '@/components/ui/progress';

type ProgressDemoProps = {
  progress: number;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
};

export function ProgressDemo({ progress, setProgress }: ProgressDemoProps) {
  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  return <Progress value={progress} className="w-full" />;
}
