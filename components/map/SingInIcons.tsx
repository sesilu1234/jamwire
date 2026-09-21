'use client';

import { useSession } from 'next-auth/react';
import { Plus } from 'lucide-react';
import DropdownMenuAvatar from './AvatarCustom';
import DropdownMenuNotSignedIn from './AvatarCustom_notSignedIn';
import { useRouter } from 'next/navigation';

type SessionMenuProps = {
  /**
   * Render as a cell of the phone tab bar instead of a header control.
   * The phone layout has no header avatar, so this is the only route to
   * sign in / out, the theme picker and the secondary pages.
   */
  compact?: boolean;
};

export default function SessionMenu({ compact = false }: SessionMenuProps) {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <div
      className={
        compact ? 'flex flex-1 items-stretch' : 'flex items-center gap-3'
      }
    >
      {session ? (
        <DropdownMenuAvatar session={session} compact={compact} />
      ) : (
        <>
          {/* Header only. In the tab bar "Add spot" is already its own cell,
              so a second copy of the button would sit beside it. */}
          {!compact && (
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
          )}

          <DropdownMenuNotSignedIn compact={compact} />
        </>
      )}
    </div>
  );
}
