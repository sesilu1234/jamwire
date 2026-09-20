'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { BadgeCheck } from 'lucide-react';
import { DateTime } from 'luxon';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

type ConfirmationState = {
  count: number;
  lastConfirmedAt: string | null;
  confirmedByMe: boolean;
};

/**
 * Social proof that a jam is still running.
 *
 * A listing is worth nothing if half the entries died two years ago, and a
 * host who has stopped updating is exactly the host who won't come back to
 * delete their jam. Visitors are the only ones who know, so they're asked.
 *
 * Deliberately never says "this jam is unconfirmed". Nothing has confirmations
 * yet, so a negative state would make every jam on the site look abandoned on
 * the day it ships. Absence of proof shows up as a plain invitation instead,
 * and only once there is real volume is a stale-jam warning worth adding.
 */
export default function Confirmations({ jamId }: { jamId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  const [state, setState] = useState<ConfirmationState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchConfirmations = async () => {
      try {
        const res = await fetch(`/api/public/get-jam-confirmations/${jamId}`);
        const data = await res.json();
        if (active) setState(data);
      } catch (e) {
        // The block simply stays hidden; it is not worth a visible error.
        console.error('Failed to fetch confirmations:', e);
      }
    };

    fetchConfirmations();
    return () => {
      active = false;
    };
  }, [jamId]);

  const handleConfirm = async () => {
    if (!session) {
      toast('Login required', {
        description: 'You need to be logged in to confirm a jam.',
        action: {
          label: 'Login',
          onClick: () =>
            router.push(`/signIn?callbackUrl=${encodeURIComponent(pathname)}`),
        },
      });
      return;
    }

    setIsSubmitting(true);

    // Optimistic: the count moves now, and is put back if the call fails.
    const previous = state;
    setState({
      count: (state?.count ?? 0) + 1,
      lastConfirmedAt: new Date().toISOString(),
      confirmedByMe: true,
    });

    try {
      const res = await fetch(`/api/private/jam-confirm/${jamId}`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error(String(res.status));

      toast.success('Thanks', {
        description: 'You just helped another musician trust this listing.',
      });
    } catch (e) {
      setState(previous);
      toast.error('Error', {
        description: 'Could not confirm. Try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Nothing is rendered until the fetch lands, so the aside doesn't jump.
  if (!state) return null;

  const lastConfirmed = state.lastConfirmedAt
    ? DateTime.fromISO(state.lastConfirmedAt).setLocale('en').toRelative()
    : null;

  const hasProof = state.count > 0;

  return (
    <div className="rounded-2xl border border-tone-0/10 bg-tone-0/4 p-5">
      {hasProof && (
        <p className="flex items-start gap-2.5 text-sm">
          <BadgeCheck
            className="mt-px size-4.5 shrink-0 text-modality-jam"
            strokeWidth={2}
          />
          <span className="text-tone-0/75">
            Confirmed {lastConfirmed}
            {state.count > 0 && (
              <>
                {' '}
                &middot;{' '}
                <span className="text-tone-0/55">
                  by {state.count} {state.count === 1 ? 'person' : 'people'}
                </span>
              </>
            )}
          </span>
        </p>
      )}

      {state.confirmedByMe ? (
        !hasProof && (
          <p className="text-sm text-tone-0/55">
            Thanks for confirming this jam.
          </p>
        )
      ) : (
        <>
          <p className={`text-sm text-tone-0/55 ${hasProof ? 'mt-3' : 'mb-3'}`}>
            Been to this one? Let other musicians know it&apos;s still on.
          </p>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="w-full rounded-full border border-tone-0/15 px-4 py-2 text-sm font-medium text-tone-1/90 transition-colors hover:border-tone-0/35 hover:text-tone-0 disabled:opacity-50"
          >
            I&apos;ve been here
          </button>
        </>
      )}
    </div>
  );
}
