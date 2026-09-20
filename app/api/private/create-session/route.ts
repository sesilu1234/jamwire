import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import { jamSchema } from './zoddeCheck';
import { v4 as uuidv4 } from 'uuid';
import { success, z } from 'zod';
import { validateJam } from './serverCheck';
import { uploadPhotos } from '@/lib/upload-photos';
import { placeFromCoords } from '@/lib/placeFromCoords';
import { find as geoTz } from 'geo-tz';
import tzlookup from 'tz-lookup';


import { DateTime } from 'luxon';

function generateSlug(title: string, id: string) {
  // clean title: lowercase, remove special chars, replace spaces with hyphens

  const cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  // take first 8 chars of UUID
  const uuidSuffix = id.replace(/-/g, '').slice(0, 8);

  return `${cleanTitle}-${uuidSuffix}`;
}

const MAX_NUMBER_OF_JAMS = 10;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const jamColumns = JSON.parse(formData.get('jamColumns') as string);
    const images_list = formData
      .getAll('images')
      .filter(
        (f): f is File =>
          f instanceof File && f.size > 0 && f.type.startsWith('image/'),
      );

    // get server session
    const session = await getServerSession(authOptions); // App Router uses new form

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = session.user.email;

    // get host_id from profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { count, error: countError } = await supabaseAdmin
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('host_id', profile.id);

    if (countError) {
      return NextResponse.json({ error: 'DB error' }, { status: 500 });
    }

    if ((count ?? 0) > MAX_NUMBER_OF_JAMS) {
      const { data: userPass, error: countPassError } = await supabaseAdmin
        .from('allowed_emails')
        .select('*')
        .eq('email', userEmail);

      if (countPassError) {
        return NextResponse.json({ error: 'DB error' }, { status: 500 });
      }

      if (userPass.length === 0) {
        return NextResponse.json(
          { error: 'Number of jams exceeded. Contact us.' },
          { status: 403 },
        );
      }
    }

    jamColumns.images_three = images_list.length == 3 ? true : false;

    const parsed_jamData = validateJam(jamColumns);

    if (!parsed_jamData.success) {
      return NextResponse.json(
        {
          error: "Data couldn't pass Zod",
          details: '',
        },
        { status: 400 },
      );
    }

    const id = uuidv4();
    const slug = generateSlug(jamColumns.jam_title, id);

    const result = await uploadPhotos(images_list);

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    jamColumns.images = result.urls;

    const {
      jam_title,
      location_title,
      location_address,
      periodicity,
      dayOfWeek,
      dates,
      time_start,
      images,
      modality,
      styles,
      lista_canciones,
      instruments_lend,
      drums,
      description,
      social_links,
      location_coords,
    } = jamColumns;

    const lat = parseFloat(location_coords.lat);
    const lng = parseFloat(location_coords.lng);

    const pointValue =
      !isNaN(lat) && !isNaN(lng) ? `SRID=4326;POINT(${lng} ${lat})` : null;


       const tz = (() => {
      if (!lat || !lng) return 'UTC'; // fallback if no coords

      try {
        return geoTz(lat, lng)[0] || 'UTC';
      } catch (e) {
        console.warn('geoTz failed, falling back to tz-lookup');
        return tzlookup(lat, lng) || 'UTC';
      }
    })();



    /**
     * The town this jam is in, for the city directory.
     *
     * Resolved from the coordinates rather than from `location_address`, and
     * never allowed to fail the request: a jam with no city still works
     * everywhere except /cities, and the backfill route picks it up later.
     */
    const place = await placeFromCoords(lat, lng);

    const { data, error } = await supabaseAdmin.from('sessions').insert([
      {
        id: id,
        jam_title: jam_title, // maps jam_title → jamTitle
        location_title: location_title,
        periodicity: periodicity,
        dayOfWeek: dayOfWeek,
        dates: dates,
        time_start: time_start,
        images: images,
        modality: modality,
        styles: styles,
        lista_canciones: lista_canciones,
        instruments_lend: instruments_lend,
        drums: drums,
        description: description,
        social_links: social_links,
        host_id: profile.id,
        location_coords: pointValue,

        location_address: location_address,
        slug: slug,
        timezone: tz,
        city: place.city,
        country: place.country,
        country_code: place.countryCode,
      },
    ]);


    if (jamColumns.periodicity === 'manual') {

    
     const now = DateTime.now().toMillis();

    // 1. Map and Filter in one go
    const insert_jam_dates = jamColumns.dates
      .map((dateString: string) => {
        const dt = DateTime.fromISO(`${dateString}T${jamColumns.time_start}`, { zone: tz }).toUTC();
        return {
          utc_datetime: dt.toISO() as string,
          jam_timezone: tz,
          millis: dt.toMillis()
        };
      })
      .filter((d: { millis: number }) => d.millis > now) // Fixes "d: any"
      .map(({ millis, ...cleanRow }: { millis: number; utc_datetime: string; jam_timezone: string }) => cleanRow); // Fixes "millis: any"

    // 2. The RPC call stays the same
    const { error: jamDatesError } = await supabaseAdmin.rpc('sync_jam_dates_manual', {
      target_jam_id: id,
      new_dates: insert_jam_dates 
    });


        if (jamDatesError) {
          console.log('Update jam dates error:', jamDatesError);
          return NextResponse.json({ error: jamDatesError.message }, { status: 500 });
        }


      }


      else if (jamColumns.periodicity === 'weekly') {





// Define the types for our function
const getWeeklyDatesUTC = (geo_tz: string, targetDay: number, startTime: string): string[] => {
  const schedule: string[] = [];

  
  // 1. Get "now" in the specific timezone
  const now = DateTime.now().setZone(geo_tz);
 

  // 2. Logic to find the FIRST occurrence
  let currentPointer;

  if (now.weekday <= targetDay) {
    // If today is Mon, Tue, Wed, Thu: stay in this week
    currentPointer = now.set({ weekday: targetDay });
  } else {
    // If today is Fri, Sat, Sun: jump to next week's Thursday
    currentPointer = now.plus({ weeks: 1 }).set({ weekday: targetDay });
  }

  // 3. Loop until 15 items OR 3 months pass
  while (schedule.length < 15) {
    const dateStr = currentPointer.toISODate(); // "2026-02-12"
    
    // Combine date + time, keeping it in the local zone first
    const eventTime = DateTime.fromISO(`${dateStr}T${startTime}`, { zone: geo_tz });

    // Only add if the event is in the future (avoids adding today if it already happened)
    if (eventTime >= now) {
      schedule.push(eventTime.toUTC().toISO()!);
    }

    // Move to the next week
    currentPointer = currentPointer.plus({ weeks: 1 });
  }

  return schedule;
};

        // 1. Define the map with a clear type
        const weekdayMap = { 
          monday: 1, tuesday: 2, wednesday: 3, thursday: 4, 
          friday: 5, saturday: 6, sunday: 7 
        } as const; // 'as const' makes the values strictly numbers 1-7

        // 2. Cast the input string to be a key of that map
        const dayKey = jamColumns.dayOfWeek.toLowerCase() as keyof typeof weekdayMap;

        // 3. Now you can safely index it
        const targetDayNumber = weekdayMap[dayKey];

        const insert_jam_dates = getWeeklyDatesUTC(
          tz, 
          targetDayNumber, 
          jamColumns.time_start
        ).map((utcString) => ({
          utc_datetime: utcString,
          jam_timezone: tz
        }));


        const { error: jamDatesError } = await supabaseAdmin.rpc('sync_jam_dates_weekly', {
              target_jam_id: id,
              new_dates: insert_jam_dates 
            });


        if (jamDatesError) {
          console.log('Update jam dates error:', jamDatesError);
          return NextResponse.json({ error: jamDatesError.message }, { status: 500 });
        }






      }


    


    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (e) {
     console.log(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
