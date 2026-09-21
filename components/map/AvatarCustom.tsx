'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Guitar, LogOut, User } from 'lucide-react';
import type { Session } from 'next-auth';
import { signOut } from 'next-auth/react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AccountLinks, LanguageRow, ThemeSegmented } from './accountMenuParts';

type AvatarCustomProps = {
  session: Session | null;
  /**
   * Render as a cell of the phone tab bar rather than a header avatar: a
   * small round image over a caption, in the same type as its neighbours,
   * with the menu opening upwards. The phone layout has no header avatar —
   * this is the only way in to sign out, the theme and the secondary pages.
   */
  compact?: boolean;
};

function AvatarCustom({ session, compact = false }: AvatarCustomProps) {
  const img = session?.user?.image;
  // Same box in both branches, so the header doesn't shift depending on
  // whether the account has a picture. These used to be 62px and 64px.
  const size = compact ? 24 : 48;
  const box = compact ? 'h-6 w-6' : 'h-12 w-12';

  return img ? (
    <Image
      src={img}
      alt="User avatar"
      width={size}
      height={size}
      className={`${box} rounded-full object-cover ring-1 ring-tone-0/20`}
    />
  ) : (
    <div
      className={`${box} flex items-center justify-center rounded-full bg-tone-4 text-tone-0 ring-1 ring-tone-0/20`}
    >
      <User className={compact ? 'size-3.5' : 'size-5'} />
    </div>
  );
}

export default function DropdownMenuAvatar({
  session,
  compact = false,
}: AvatarCustomProps) {
  return (
    <div className={compact ? 'flex flex-1 items-stretch' : undefined}>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          {compact ? (
            <button
              aria-label="Your account"
              className="flex w-full cursor-pointer flex-col items-center justify-center gap-1
                         text-[10px] font-semibold tracking-wide text-tone-1/60 uppercase
                         transition-colors hover:text-tone-0
                         data-[state=open]:text-tone-0
                         focus-visible:outline-none"
            >
              <AvatarCustom session={session} compact />
              Account
            </button>
          ) : (
            <button
              aria-label="Your account"
              className="rounded-full transition-transform duration-150 ease-out
                         hover:scale-105 active:scale-95
                         data-[state=open]:scale-100 data-[state=open]:hover:scale-100
                         focus-visible:ring-2 focus-visible:ring-tone-0/25
                         focus-visible:ring-offset-2 focus-visible:ring-offset-tone-5
                         focus-visible:outline-none"
            >
              <AvatarCustom session={session} />
            </button>
          )}
        </DropdownMenuTrigger>

        {/* w-72 rather than w-56: the theme control is six targets on one row
            beside its label, and at 56 they were too small to hit. */}
        <DropdownMenuContent
          className="z-[950] max-h-[70dvh] w-72 overflow-y-auto bg-surface-raised/75 shadow-xl shadow-black/20 backdrop-blur-xl backdrop-saturate-150"
          align="end"
          side={compact ? 'top' : 'bottom'}
          sideOffset={8}
          collisionPadding={8}
        >
          <DropdownMenuLabel>Your account</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/host">
                <Guitar />
                My jams
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem onSelect={() => signOut({ callbackUrl: '/' })}>
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />
          <ThemeSegmented />
          <LanguageRow />

          <DropdownMenuSeparator />
          <AccountLinks />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
