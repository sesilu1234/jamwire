'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

interface Jam {
  id: string;
  jam_title: string;
  location_address: string;
  image: string;
  slug: string;
  validated: boolean;
}

type JamProps = {
  id: string;
  jam_title: string;
  jam_adress: string;
  jam_image_src: string;
  jam_slug: string;
  is_validated: boolean;
  deleteJam: (id: string) => void;
};

export default function JamSessionList() {
  const [jams, setJams] = useState<Jam[]>([]);

  const [loading, setLoading] = useState(true);

  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  function DeleteConfirmation() {
    const [text, setText] = useState('');

    const [showPanelDelete, setShowPanelDelete] = useState(true);

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/40">
        {showPanelDelete && (
          <div className="flex w-96 max-w-[70%] flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-5 shadow-2xl">
            <p className="font-seminbold">
              Type <i className="font-medium">delete</i> to confirm
            </p>

            <input
              className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition-colors focus:border-zinc-500 focus:ring-4 focus:ring-zinc-900/5"
              placeholder="delete"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={async () => {
                  setShowPanelDelete(false);
                  await deleteJam(idToDelete!);
                  setIdToDelete(null);
                }}
                disabled={text.toLowerCase() !== 'delete'}
                className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-red-700 bg-red-600 px-4 text-sm font-bold tracking-tight text-white shadow-[3px_3px_0_0_rgba(185,28,28,0.45)] transition-[transform,box-shadow,background-color] duration-150 hover:bg-red-700 active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_0_rgba(185,28,28,0.45)] disabled:cursor-not-allowed disabled:border-zinc-300 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:shadow-none"
              >
                Accept
              </button>

              <button
                onClick={() => setIdToDelete(null)}
                className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-[#1B1F2A] bg-white px-4 text-sm font-bold tracking-tight text-[#1B1F2A] shadow-[3px_3px_0_0_rgba(27,31,42,0.45)] transition-[transform,box-shadow] duration-150 active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_0_rgba(27,31,42,0.45)]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  async function deleteJam(jamId: string) {
    // Llamada al API para eliminar
    await fetch(`/api/private/delete-session/${jamId}`, { method: 'DELETE' });

    // Actualizar estado eliminando el jam con ese id
    setJams((prev) => prev.filter((j) => j.id !== jamId));
  }

  useEffect(() => {
    const fetchJams = async () => {
      try {
        const res = await fetch('/api/private/get-user-jams');
        if (!res.ok) throw new Error('Failed to fetch jams');
        const data: Jam[] = await res.json();

        setJams(data);
      } catch {
        console.log('Error while fetching');
      } finally {
        setLoading(false);
      }
    };
    fetchJams();
  }, []);

  /**
   * One jam is the common case, and for that host a count reading "1 jam" and
   * a second way to reach the same page are both noise. Both appear only once
   * there is a list worth navigating.
   */
  const hasSeveral = jams.length > 1;

  const header = (
    <div className="ml-3 mt-8">
      <div className="mt-6 ml-6 md:ml-24">
        <div className="flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <h3 className="text-5xl font-extrabold tracking-tighter uppercase md:text-6xl">
            Your jams
          </h3>

          {hasSeveral ? (
            <Link
              href="/host/create"
              prefetch={false}
              aria-label="Add a new jam"
              className="
              group inline-flex h-10 shrink-0 items-center gap-2
              rounded-xl border border-[#1B1F2A] bg-white px-4
              text-sm font-bold tracking-tight text-[#1B1F2A]
              shadow-[3px_3px_0_0_rgba(27,31,42,0.45)]
              transition-[transform,box-shadow] duration-150 ease-out
              hover:shadow-[5px_5px_0_0_rgba(27,31,42,0.55)]
              active:translate-x-0.5 active:translate-y-0.5
              active:shadow-[1px_1px_0_0_rgba(27,31,42,0.45)]
            "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 -960 960 960"
                aria-hidden="true"
                className="h-4 w-4 fill-current transition-transform duration-300 group-hover:rotate-90"
              >
                <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
              </svg>
              Add jam
            </Link>
          ) : null}
        </div>

        <div className="mt-4 flex items-center gap-4">
          <span className="h-1 w-14 shrink-0 bg-brand" />
          <p className="text-sm font-medium text-[#1B1F2A]/50">
            {hasSeveral ? `${jams.length} jams · ` : ''}
            Everything you&apos;ve put on the map.
          </p>
        </div>
      </div>
    </div>
  );

  if (loading)
    return (
      <>
        {header}
        <div className="mt-10 flex flex-col gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </>
    );

  return (
    <>
      {header}
      <div className="mt-10 flex flex-col gap-4">
        {jams.map((jam, i) => (
          <Jam
            key={i}
            id={jam.id}
            jam_title={jam.jam_title}
            jam_adress={jam.location_address}
            jam_image_src={jam.image}
            jam_slug={jam.slug}
            is_validated={jam.validated}
            deleteJam={setIdToDelete}
          />
        ))}

        <div className="mt-6 mx-auto container flex justify-center">
          <Link
            href="/host/create"
            prefetch={false}
            className="
      group relative flex items-center justify-center
      h-24 md:h-24 w-3/10 min-w-[200px] max-w-[320px]
      rounded-2xl
      border border-[#1B1F2A] bg-white
      shadow-[4px_4px_0_0_rgba(27,31,42,0.5)]
      transition-[transform,box-shadow] duration-150 ease-out
      hover:shadow-[6px_6px_0_0_rgba(27,31,42,0.6)]
      active:translate-x-0.5 active:translate-y-0.5
      active:shadow-[2px_2px_0_0_rgba(27,31,42,0.5)]
    "
          >
            {/* Subtle Inner Glow */}
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/[0.03] pointer-events-none" />

            <div className="flex items-center gap-4">
              <div
                className="
  relative flex h-10 w-10 items-center justify-center 
  rounded-xl bg-zinc-900/00 border-2 text-black
  transition-all duration-500 ease-spring
  
  group-hover:bg-brand
  group-hover:rotate-90

  group-active:bg-brand
  group-active:rotate-90
"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 -960 960 960"
                  className="w-6 h-6 fill-current"
                >
                  <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
                </svg>
              </div>

              <div className="flex flex-col">
                <span className="text-sm md:text-base font-semibold tracking-tight text-zinc-900">
                  Add new jam
                </span>
                <span
                  className="
  text-xs text-zinc-500
  opacity-0 -translate-y-1
  transition-all duration-300
  
  group-hover:opacity-100
  group-hover:translate-y-0
  
  group-active:opacity-100
  group-active:translate-y-0
"
                >
                  Start a session
                </span>
              </div>
            </div>
          </Link>
        </div>

        {idToDelete ? <DeleteConfirmation /> : null}
      </div>
    </>
  );
}

import { Pencil, Eye, MoreHorizontalIcon, Trash2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { ButtonGroup } from '@/components/ui/button-group';

function Jam({
  id,
  jam_title,
  jam_adress,
  jam_image_src,
  jam_slug,
  is_validated, // Destructure it here
  deleteJam,
}: JamProps) {
  return (
    /* The whole card is the "View" target now, via an overlay link rather than
       wrapping everything in an <a> — Edit is itself a link, and an anchor
       inside an anchor is invalid. The actions sit above it on z-10 so their
       clicks don't fall through to the card. */
    <div className="group relative flex items-center gap-6 rounded-2xl border border-[#1B1F2A]/12 bg-white p-4 transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-20px_rgba(27,31,42,0.55)]">
      <Link
        href={`/jam/${jam_slug}`}
        prefetch={false}
        aria-label={`Open ${jam_title}`}
        className="absolute inset-0 z-0 rounded-2xl focus-visible:ring-2 focus-visible:ring-[#1B1F2A]/40 focus-visible:outline-none"
      />

      {/* IMAGE */}
      <div className="relative h-28 w-44 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
        <Image
          src={jam_image_src}
          alt={jam_title}
          fill
          sizes="176px"
          className={`object-cover transition-transform duration-300 group-hover:scale-[1.04] ${
            !is_validated ? 'opacity-60' : 'opacity-100'
          }`}
        />

        {!is_validated && (
          <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-amber-500 px-2 py-1 text-[10px] font-bold uppercase text-white shadow-md">
            <span className="flex h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-white" />
            Pending
          </div>
        )}
      </div>

      {/* TEXT */}
      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="truncate text-xl font-extrabold tracking-tight">
          {jam_title}
        </h3>
        <p className="mt-1 truncate text-sm font-medium text-[#1B1F2A]/55">
          {jam_adress}
        </p>
        {!is_validated && (
          <p className="mt-2 text-xs font-semibold text-amber-600">
            Waiting for review — not public yet
          </p>
        )}
      </div>

      {/* ACTIONS — View is gone: the card itself does that now, which leaves
          two real choices instead of three competing small buttons. */}
      <div className="relative z-10 hidden shrink-0 items-center gap-3 md:flex">
        <Link
          href={`/host/edit/${id}`}
          prefetch={false}
          className="inline-flex h-11 items-center justify-center rounded-lg border border-[#1B1F2A] bg-[#1B1F2A] px-6 text-sm font-bold tracking-tight text-white transition-colors duration-150 hover:bg-[#2E3440]"
        >
          Edit
        </Link>

        <button
          type="button"
          onClick={() => deleteJam(id)}
          aria-label={`Delete ${jam_title}`}
          className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-[#1B1F2A]/15 bg-white text-[#1B1F2A]/45 transition-colors duration-150 hover:border-red-600 hover:bg-red-600 hover:text-white"
        >
          <Trash2 className="size-4" strokeWidth={2} />
        </button>
      </div>

      <div className="relative z-10">
        <MobileMenu jam_slug={jam_slug} id={id} deleteJam={deleteJam} />
      </div>
    </div>
  );
}
export function SkeletonCard() {
  return (
    <div className="flex items-center gap-6 rounded-2xl border border-[#1B1F2A]/12 bg-white p-4">
      <Skeleton className="h-28 w-44 shrink-0 rounded-xl" />
      <div className="w-4/10 space-y-2">
        <Skeleton className="h-4 " />
        <Skeleton className="h-4 " />
        <Skeleton className="h-4" />
      </div>
    </div>
  );
}

type MobileMenuProps = Pick<JamProps, 'jam_slug' | 'id' | 'deleteJam'>;

export function MobileMenu({ jam_slug, id, deleteJam }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="md:hidden relative" ref={menuRef}>
      <button
        aria-label="More Options"
        className="bg-slate-800/30 hover:bg-slate-800/50 px-1 rounded-lg text-black hover:border-0 border-white flex items-center justify-center"
        onClick={() => setOpen((o) => !o)}
      >
        <MoreHorizontalIcon />
      </button>

      {open && (
        <div className="absolute right-0  mt-2 w-28 py-1 px-1 border-1 border-black/10 bg-slate-50/80 text-black text-sm backdrop-blur-sm rounded-md shadow-lg z-10">
          <div className="flex flex-col">
            <Link href={`/jam/${jam_slug}`} prefetch={false}>
              <div className="flex items-center gap-2 px-1 py-2 hover:bg-black/10 rounded-md">
                <Eye className="text-black" /> View
              </div>
            </Link>

            <Link href={`/host/edit/${id}`} prefetch={false}>
              <div className="flex items-center gap-2 px-1 py-2 hover:bg-black/10 rounded-md">
                <Pencil className="text-amber-600" /> Edit
              </div>
            </Link>

            <button
              onClick={() => {
                deleteJam(id);
                setOpen(false);
              }}
              className="flex items-center gap-2 px-1 py-2 hover:bg-black/10  rounded-md w-full text-left"
            >
              <Trash2Icon className="text-red-500" /> Trash
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
