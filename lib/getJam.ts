import 'server-only';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { cache } from 'react';
import { DateTime } from 'luxon';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../app/api/auth/[...nextauth]/route';

import { Jam } from '../types/jam';

/**
 * Exactly what `get_jam_by_slug` returns, verified against the RPC.
 *
 * This used to also declare `periodicity`, `dayOfWeek`, `dates`, `created_at`,
 * `location_coords`, `host_id`, `time_start` and `f_next_date`. None of them
 * come back from that function, so anything reading them got `undefined` while
 * TypeScript reported a `string`. `periodicity` and `dayOfWeek` are fetched
 * separately in `getJam` below; `dates` lives in the `jam_dates` table.
 */
type JamSessionResult = {
  id: string;
  slug: string;
  modality: string;
  jam_title: string;
  host_name: string | null;
  location_title: string;
  images: string[] | null;
  styles: string[] | null;
  drums: string | null;
  instruments_lend: string | null;
  lista_canciones: string | null;
  description: string | null;
  location_address: string | null;
  lat: number;
  lng: number;
  social_links: any;
  next_date: string | null;
  next_date_timezone: string | null;
};

export const getJam = cache(async (slug: string) => {


  const session = await getServerSession(authOptions); // App Router uses new form
  
     
  
  const userEmail = session?.user.email || null;
  
  
  const [jamResponse, commentsResponse, scheduleResponse] = await Promise.all([
    supabaseAdmin.rpc('get_jam_by_slug', { p_slug: slug }).maybeSingle(),
    supabaseAdmin.rpc('get_comments_for_jam', { p_jam_slug: slug, p_email: userEmail }),

    /**
     * `get_jam_by_slug` does not return these two, despite what
     * `JamSessionResult` used to claim - it selects 18 columns and neither is
     * among them. Read
     * straight from the table rather than changing the RPC, which is shared.
     */
    supabaseAdmin
      .from('sessions')
      .select('periodicity, dayOfWeek')
      .eq('slug', slug)
      .maybeSingle(),
  ]);

  const { data: jamData, error: jamError } = jamResponse;
  const { data: commentsData, error: commentsError } = commentsResponse;

  if (jamError || commentsError) {
    console.error('Data Fetch Error:', { jamError, commentsError });
    return null; 
  }

const formattedComments = (commentsData || []).map((comment: any) => {
  const createdDate = DateTime.fromISO(comment.created_at).setLocale('en');
  const timeSince = createdDate.toRelative() || 'just now';

  const safeReplies = (comment.replies ?? []).map((reply: any) => {
    const replyCreated = DateTime.fromISO(reply.created_at).setLocale('en');
    const hideContent = reply.deleted_at !== null && !reply.is_querying_user;

    return {
      ...reply,
      replies: reply.replies ?? [],
      time: replyCreated.toRelative() || 'just now',
      content: hideContent ? '' : reply.content,
      display_name: hideContent ? '' : reply.display_name,
      user_id: hideContent ? '' : reply.user_id
    };
  });

  const hideContent = comment.deleted_at !== null && !comment.is_querying_user;

  return {
    ...comment,
    time: timeSince,
    replies: safeReplies,
    content: hideContent ? '' : comment.content,
    display_name: hideContent ? '' : comment.display_name,
    user_id: hideContent ? '' : comment.user_id
  };
});




  // Cast through 'unknown' to safely tell TS this is our JamSessionResult
  const jam = jamData as unknown as JamSessionResult;

  if (!jam) return null;

  const schedule = scheduleResponse.data;

  const localTime = (jam.next_date && jam.next_date_timezone)
    ? DateTime.fromISO(jam.next_date).setZone(jam.next_date_timezone)
    : null;

  /**
   * How the schedule is put across depends on the shape of the jam.
   *
   * A weekly one says "Every Monday" and stops there: the date after this one
   * is next Monday, and spelling that out only hands the reader a reason to
   * skip tonight. A monthly or one-off jam gets the following date instead,
   * where the gap is the point - if you miss tonight you are waiting a month.
   *
   * So only one of the two is ever produced, and the query for the second one
   * doesn't run at all for a weekly jam.
   */
  const isWeekly = schedule?.periodicity === 'weekly';

  const recurrenceLabel =
    isWeekly && schedule?.dayOfWeek
      ? `Every ${schedule.dayOfWeek.charAt(0).toUpperCase()}${schedule.dayOfWeek.slice(1).toLowerCase()}`
      : null;

  /**
   * `sessions.dates` is the raw form input (plain dates for a manual jam,
   * nothing at all for a weekly one), so the resolved instants in `jam_dates`
   * are the only usable source - the same one `next_date` comes from.
   *
   * Anchored past `next_date` rather than past now, so the row already shown
   * as `display_date` is never the one returned.
   */
  let followingDate: string | null = null;

  if (!isWeekly) {
    const { data: dateRow } = await supabaseAdmin
      .from('jam_dates')
      .select('utc_datetime, jam_timezone')
      .eq('jam_id', jam.id)
      .gt('utc_datetime', jam.next_date ?? DateTime.now().toISO())
      .order('utc_datetime', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (dateRow) {
      const local = DateTime.fromISO(dateRow.utc_datetime).setZone(
        dateRow.jam_timezone ?? jam.next_date_timezone ?? 'utc',
      );
      followingDate = local.isValid ? local.toFormat('d LLL') : null;
    }
  }

  return {
    ...jam,
    display_date: localTime && localTime.isValid
      ? localTime.toFormat('ccc d LLL, HH:mm')
      : 'Date TBD',
    following_date: followingDate,
    recurrence_label: recurrenceLabel,
       iso_date: localTime && localTime.isValid
    ? localTime.toISO() // for JSON-LD / Google
    : null,
     comments: formattedComments || [],
  };
});