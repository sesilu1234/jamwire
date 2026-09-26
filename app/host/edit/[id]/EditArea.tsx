'use client';
import { useState, useRef, useEffect } from 'react';

import Sections from './sections';
import { useRouter, useSearchParams } from 'next/navigation';

import { validateJam } from './clientCheck';
import { Jam } from './typeCheck';
import { convertFromRaw } from 'draft-js';

import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

import { jamSchema } from './zodCheck';

import { useParams } from 'next/navigation';

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
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;

    fetch(`/api/private/get-jam-edit/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          generalInfo: {
            jam_title: data.jam_title,
            location_title: data.location_title,
            location_address: data.location_address,
            coordinates: { lat: data.lat, lng: data.lng },
            dates: {
              period: data.periodicity,
              day_of_week: data.dayOfWeek,
              time: { from: data.time_start, to: null },
              list_of_dates: data.dates,
            },
          },
          photos: { images: data.images },
          features: {
            modality: data.modality,
            styles: data.styles,
            song_list: data.lista_canciones,
            intruments_lend: data.instruments_lend,
            drums: data.drums,
          },
          description: { description: data.description },
          social: {
            instagram: data.social_links.instagram,
            facebook: data.social_links.facebook,
            siteWeb: data.social_links.siteWeb,
          },
        });

        setLoading(false);
      });
  }, [id]); // ✅ solo se ejecuta cuando cambia id

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

  /**
   * The real phases of a save, so the overlay can name what it is waiting on.
   * The percentages are signposts, not measurements - what carries the
   * information is the label, and the slowest stage says why it is slow.
   */
  const SAVE_STAGES = {
    preparing: { label: 'Preparing your photos', progress: 20 },
    uploading: { label: 'Compressing and uploading', progress: 65 },
    done: { label: 'Saved', progress: 100 },
  } as const;

  type SaveStage = keyof typeof SAVE_STAGES;

  const handleSave = async (onStage: (stage: SaveStage) => void) => {
    onStage('preparing');
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

      instruments_lend: form.features.intruments_lend,
      drums: form.features.drums,
      description: form.description.description,
      raw_desc: raw_desc,
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

    onStage('uploading');

    const res = await fetch(`/api/private/update-session/${id}`, {
      method: 'POST',
      body: payload, // ⬅️ solo FormData
    });

    /**
     * The response used to be thrown away, so a rejected save still showed the
     * success toast and navigated away. The server turns photos down now, so
     * that silence had to go.
     */
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return {
        success: false,
        message: body?.error ?? 'Your changes could not be saved.',
      };
    }

    return { success: true };
  };

  const [stage, setStage] = useState<SaveStage>('preparing');
  const [saving, setSaving] = useState(false);

  if (loading)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <span className="h-7 w-7 animate-spin rounded-full border-2 border-zinc-200 border-t-amber-400" />
        <p className="text-[13px] font-medium text-zinc-500">
          Loading your jam…
        </p>
      </div>
    );

  return (
    <div className="flex min-h-screen flex-col">
      {saving ? (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-zinc-950/50 backdrop-blur-sm">
          <div className="flex w-[300px] flex-col items-center gap-5 rounded-2xl border border-zinc-200 bg-white px-7 py-8 shadow-2xl">
            <span className="h-7 w-7 animate-spin rounded-full border-2 border-zinc-200 border-t-amber-400" />
            <div className="text-center">
              <p className="text-[15px] font-semibold tracking-tight text-zinc-900">
                Saving your changes
              </p>
              <p className="mt-1 text-[12px] text-zinc-500">
                {SAVE_STAGES[stage].label}
                {stage === 'done' ? '' : '…'}
              </p>
            </div>
            <Progress value={SAVE_STAGES[stage].progress} className="w-full" />
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
              setStage('preparing');
              setSaving(true);

              try {
                const saveResult = await handleSave(setStage);

                if (!saveResult?.success) {
                  setSaving(false);
                  toast(
                    saveResult?.message ?? 'Your changes could not be saved',
                    { action: { label: 'Understood', onClick: () => {} } },
                  );
                  return; // only navigate if success
                }

                setStage('done');
                await new Promise((r) => setTimeout(r, 400));
                router.push('/host'); // only navigate if success
              } catch (e) {
                /**
                 * Anything thrown in here used to escape the handler, which
                 * left the overlay up for ever with no clue why - the failure
                 * has to reach the user.
                 */
                console.error('Save failed:', e);
                setSaving(false);
                toast('Your changes could not be saved', {
                  description:
                    e instanceof Error ? e.message : 'Unexpected error',
                  action: { label: 'Understood', onClick: () => {} },
                });
              }
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

/* ProgressDemo lived here. It set its own progress on a timer, fighting the
   value its parent passed in, and the bar it rendered was invisible against
   the card. The overlay drives <Progress /> from the real save stages now. */
