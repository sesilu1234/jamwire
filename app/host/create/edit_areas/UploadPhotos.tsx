'use client';

import { useState, useRef, useEffect, ChangeEvent } from 'react';
import Image from 'next/image';
import TrashButton from './icons/TrashButton';
import { UploadPhotosProps } from './types/types';

import { useFormStore } from '../store/formStore'; // path a tu store

import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { toast } from 'sonner';

import { Card, CardTitle } from './ui';

/**
 * Mirrors MAX_INPUT_BYTES in lib/upload-photos.ts. Keep the two in step: this
 * one is the courtesy, that one is the rule.
 */
const MAX_FILE_MB = 8;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

const asMb = (bytes: number) => (bytes / 1024 / 1024).toFixed(1);

interface SortablePhotoProps {
  url: string;
  removePhoto: (url: string) => void;
  index: number;
}

function SortablePhoto({ url, removePhoto, index }: SortablePhotoProps) {
  const { setNodeRef, attributes, listeners, transform, transition } =
    useSortable({ id: url });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        touchAction: 'none', // 👈 VERY IMPORTANT
        position: 'relative',
        width: 160,
        height: 160,
      }}
      className="group overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 shadow-[0_1px_2px_rgba(24,24,27,0.06)]"
    >
      {/* DRAG HANDLE */}
      <div
        {...listeners}
        className="absolute left-2 top-2 z-10 flex h-7 w-7 cursor-grab items-center justify-center rounded-lg bg-zinc-950/55 text-[13px] text-white backdrop-blur-sm transition-colors hover:bg-zinc-950/75 active:cursor-grabbing lg:rotate-90"
      >
        ⇅
      </div>

      <Image src={url} alt="preview" fill className="object-cover" />

      {/* bottom gradient + role label */}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/70 to-transparent px-2.5 pb-2 pt-7 text-[11px] font-semibold tracking-tight text-white">
        {index === 0 ? 'Cover photo' : `Photo ${index + 1}`}
      </span>

      <TrashButton onClick={() => removePhoto(url)} />
    </div>
  );
}

export default function PhotoUploader({
  data,
  childSaveOnUnmount,
}: UploadPhotosProps) {
  const setForm = useFormStore((state) => state.setForm);

  const [photos, setPhotos] = useState<string[]>(data.images);
  const photoStateRef = useRef(photos);
  photoStateRef.current = photos;

  useEffect(() => {
    childSaveOnUnmount.current = () => {
      setForm((prev) => ({
        ...prev,
        photos: {
          images: photoStateRef.current,
        },
      }));
    };

    return () => {
      childSaveOnUnmount.current = () => {};
    };
  }, []);

  // ✅ Typed file event
  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;

    const picked = Array.from(e.target.files);

    /**
     * The server refuses these too. Stopping them here just saves the host
     * uploading megabytes before being turned away.
     */
    const tooBig = picked.filter((file) => file.size > MAX_FILE_BYTES);
    const accepted = picked.filter((file) => file.size <= MAX_FILE_BYTES);

    if (tooBig.length === 1) {
      toast.error('That photo is too large', {
        description: `${asMb(tooBig[0].size)} MB — photos have to be under ${MAX_FILE_MB} MB.`,
      });
    } else if (tooBig.length > 1) {
      toast.error(`${tooBig.length} photos are too large`, {
        description: `Photos have to be under ${MAX_FILE_MB} MB each.`,
      });
    }

    e.target.value = ''; // allow re-upload same file

    if (!accepted.length) return;

    setPhotos((prev) =>
      [...prev, ...accepted.map((file) => URL.createObjectURL(file))].slice(
        0,
        4,
      ),
    );
  }

  function removePhoto(url: string) {
    setPhotos((prev) => prev.filter((u) => u !== url));
  }

  // ✅ Typed drag event
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setPhotos((prev) => {
      const oldIndex = prev.findIndex((u) => u === active.id);
      const newIndex = prev.findIndex((u) => u === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  const isExact = photos.length === 3;
  const isOver = photos.length > 3;

  return (
    <Card>
      <CardTitle
        title="Photos"
        hint="Upload exactly 3. The first one becomes the cover — drag the handle to reorder."
        action={
          <span
            className={`
              inline-flex items-center gap-1.5 rounded-full px-3 py-1
              text-[12px] font-semibold tabular-nums ring-1 ring-inset
              ${
                isOver
                  ? 'bg-red-50 text-red-700 ring-red-600/20'
                  : isExact
                    ? 'bg-emerald-50 text-emerald-800 ring-emerald-600/20'
                    : 'bg-zinc-100 text-zinc-600 ring-zinc-300/60'
              }
            `}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isOver
                  ? 'bg-red-500'
                  : isExact
                    ? 'bg-emerald-500'
                    : 'bg-zinc-400'
              }`}
            />
            {photos.length} / 3
          </span>
        }
      />

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={photos}>
          <div className="flex flex-wrap gap-3">
            {photos.map((url, i) => (
              <SortablePhoto
                key={url}
                url={url}
                index={i}
                removePhoto={removePhoto}
              />
            ))}

            {photos.length < 4 && (
              <label
                className="
                  flex h-40 w-40 cursor-pointer flex-col items-center justify-center gap-2
                  rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50/70
                  text-zinc-500 transition-all duration-200
                  hover:border-emerald-400/70 hover:bg-emerald-50/40 hover:text-emerald-700
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="currentColor"
                >
                  <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
                </svg>
                <span className="text-[12px] font-semibold tracking-tight">
                  Upload image
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFile}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </SortableContext>
      </DndContext>

      {isOver ? (
        <p className="mt-4 text-[13px] font-medium text-red-600">
          That’s one photo too many — remove one before saving.
        </p>
      ) : null}
    </Card>
  );
}
