import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';

/**
 * Only confirmations from the last 90 days are counted.
 *
 * Never stated in the interface, and the rows are never deleted - it is just
 * that "8 people have been here" is a claim about now, and a visit from two
 * years ago does not support it. The date shown next to the count ("Confirmed
 * 4 days ago") is what actually carries the meaning.
 */
const WINDOW_DAYS = 90;

/** How long a user has to wait before confirming the same jam again. */
const COOLDOWN_DAYS = 7;

/**
 * "Has anyone actually been to this jam lately?"
 *
 * Unlike likes, this is a rolling window rather than a running total: a jam
 * with 40 confirmations from 2024 and none since is exactly the thing this is
 * meant to expose, so an all-time count would defeat the point.
 *
 * Returns zeroes rather than an error when the table is missing, so the page
 * renders normally before the migration is applied.
 */
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    const windowStart = new Date(
      Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();

    const [recentResult, latestResult, mineResult] = await Promise.all([
      // People, not rows: someone who confirms every month for a year is one
      // person vouching, and "12 people" would be a lie. Postgres could do
      // count(distinct) but supabase-js cannot, so the emails in the window
      // come back and are deduplicated here - a handful of rows per jam.
      supabaseAdmin
        .from('jam_confirmations')
        .select('email')
        .eq('jam_id', id)
        .gte('confirmed_at', windowStart),

      supabaseAdmin
        .from('jam_confirmations')
        .select('confirmed_at')
        .eq('jam_id', id)
        .order('confirmed_at', { ascending: false })
        .limit(1)
        .maybeSingle(),

      userEmail
        ? supabaseAdmin
            .from('jam_confirmations')
            .select('confirmed_at')
            .eq('jam_id', id)
            .eq('email', userEmail)
            .gte(
              'confirmed_at',
              new Date(
                Date.now() - COOLDOWN_DAYS * 24 * 60 * 60 * 1000,
              ).toISOString(),
            )
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

    if (recentResult.error) throw recentResult.error;

    const people = new Set((recentResult.data ?? []).map((row) => row.email));

    return NextResponse.json({
      count: people.size,
      lastConfirmedAt: latestResult.data?.confirmed_at ?? null,
      confirmedByMe: !!mineResult.data,
    });
  } catch (e) {
    console.error('Confirmations fetch error:', e);
    return NextResponse.json({
      count: 0,
      lastConfirmedAt: null,
      confirmedByMe: false,
    });
  }
}
