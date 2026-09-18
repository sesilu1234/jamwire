'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar';
import Link from 'next/link';
import { Plus, User } from 'lucide-react';
import DropdownMenuAvatar from './AvatarCustom';
import DropdownMenuNotSignedIn from './AvatarCustom_notSignedIn';
import { useRouter } from 'next/navigation';

export default function SessionMenu() {
  const router = useRouter();
  const { data: session } = useSession();


  return (
    <div className="flex items-center gap-3">
      {session ? (
        <DropdownMenuAvatar session={session} />
      ) : (
        <>
          <button
            className="hidden h-12 shrink-0 cursor-pointer items-center rounded
                       gap-1.5 bg-brand px-5 text-sm font-semibold text-brand-ink
                       transition-colors hover:bg-brand/85
                       focus-visible:ring-2 focus-visible:ring-brand/40
                       focus-visible:ring-offset-2 focus-visible:ring-offset-tone-5
                       focus-visible:outline-none md:inline-flex"
            onClick={() => router.push('/signIn')}
          >
            <Plus className="size-4 shrink-0" strokeWidth={2.5} />
            Add spot
          </button>

          <DropdownMenuNotSignedIn />
        </>
      )}
    </div>
  );
}
