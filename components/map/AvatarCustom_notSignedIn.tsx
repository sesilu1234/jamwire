'use client';

import Link from 'next/link';
import { LogIn, Menu, User } from 'lucide-react';

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

type DropdownMenuNotSignedInProps = {
  /**
   * Render as a cell of the phone tab bar rather than a header button: an
   * icon over a caption, in the same type as its neighbours, with the menu
   * opening upwards. See the same prop on DropdownMenuAvatar.
   */
  compact?: boolean;
};

export default function DropdownMenuNotSignedIn({
  compact = false,
}: DropdownMenuNotSignedInProps = {}) {
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
              <User className="size-5" />
              Account
            </button>
          ) : (
            <button
              aria-label="Menu"
              className="inline-flex h-12 w-12 cursor-pointer items-center justify-center
                         rounded border border-transparent bg-tone-0/4 text-tone-1/80
                         transition-colors select-none
                         hover:bg-tone-0/8 hover:text-tone-0
                         data-[state=open]:bg-tone-0/10 data-[state=open]:text-tone-0
                         focus-visible:ring-2 focus-visible:ring-tone-0/25 focus-visible:outline-none"
            >
              <Menu className="size-6 shrink-0" strokeWidth={1.75} />
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
          <DropdownMenuLabel>Account</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/signIn">
                <LogIn />
                Sign in
              </Link>
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
