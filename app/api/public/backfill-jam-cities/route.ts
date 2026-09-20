import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { placeFromCoords } from '@/lib/placeFromCoords';

/**
 * Fills `city` / `country` / `country_code` on jams that don't have them.
 *
 * A one-off, but written to be safe to run again: it only looks at rows where
 * `city is null`, so a second run picks up whatever failed the first time
 * (a geocoding hiccup, a jam created while the column was still empty) and
 * leaves everything else alone.
 *
 * Runs as a route rather than a local script on purpose - it executes on the
 * deployment, where GOOGLE_MAPS_API_KEY is already configured, so there is
 * nothing to set up locally.
 *
 *   curl -X POST https://www.jamwire.xyz/api/public/backfill-jam-cities \
 *        -H "Authorization: Bearer $CRON_SECRET"
 */

/** Reverse geocoding is one call per jam; this caps a single run. */
const BATCH_SIZE = 200;

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // The view, not the table: `sessions` keeps the point in `location_coords`
    // and only the view breaks it out into lat/lng.
    const { data: jams, error } = await supabaseAdmin
      .from('sessions_with_coords')
      .select('id, jam_title, lat, lng')
      .is('city', null)
      .limit(BATCH_SIZE);

    if (error) throw error;

    if (!jams?.length) {
      return NextResponse.json({
        success: true,
        message: 'Nothing left to backfill',
        updated: 0,
      });
    }

    const failed: { id: string; jam_title: string; reason: string }[] = [];
    let updated = 0;

    // Sequential rather than Promise.all: a burst of a few hundred requests is
    // how you get rate-limited by Google, and this runs once.
    for (const jam of jams) {
      const place = await placeFromCoords(jam.lat, jam.lng);

      if (!place.city) {
        failed.push({
          id: jam.id,
          jam_title: jam.jam_title,
          reason: 'no locality resolved',
        });
        continue;
      }

      const { error: updateError } = await supabaseAdmin
        .from('sessions')
        .update({
          city: place.city,
          country: place.country,
          country_code: place.countryCode,
        })
        .eq('id', jam.id);

      if (updateError) {
        failed.push({
          id: jam.id,
          jam_title: jam.jam_title,
          reason: updateError.message,
        });
        continue;
      }

      updated += 1;
    }

    return NextResponse.json({
      success: true,
      considered: jams.length,
      updated,
      // Listed rather than counted, so the ones needing a manual look are named.
      failed,
      note:
        jams.length === BATCH_SIZE
          ? 'Batch was full - run again to continue.'
          : undefined,
    });
  } catch (e: any) {
    console.error('Backfill error:', e);
    return NextResponse.json(
      { success: false, error: e.message ?? 'Server error' },
      { status: 500 },
    );
  }
}
