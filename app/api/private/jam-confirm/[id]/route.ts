import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';

/** One confirmation per person per jam per week. */
const COOLDOWN_DAYS = 7;

/**
 * "I've been here" - a signed-in visitor vouching that the jam is real and
 * still running.
 *
 * Insert-only, one row per confirmation rather than one per person, so the
 * question "is this jam alive *now*" can be answered. Nothing to undo: a
 * statement about the past doesn't get toggled off, which is the whole reason
 * this is retrospective and not an RSVP.
 */
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id: jamId } = await context.params;
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cooldownStart = new Date(
      Date.now() - COOLDOWN_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { data: recent, error: recentError } = await supabaseAdmin
      .from('jam_confirmations')
      .select('id')
      .eq('jam_id', jamId)
      .eq('email', userEmail)
      .gte('confirmed_at', cooldownStart)
      .maybeSingle();

    if (recentError) throw recentError;

    if (recent) {
      return NextResponse.json(
        { error: 'Already confirmed recently' },
        { status: 429 },
      );
    }

    const { error } = await supabaseAdmin
      .from('jam_confirmations')
      .insert({ jam_id: jamId, email: userEmail });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Confirmation error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
