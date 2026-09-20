import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { success, z } from 'zod';
import { validateJam } from './serverCheck';
import { uploadPhotos } from '@/lib/upload-photos';
import { placeFromCoords } from '@/lib/placeFromCoords';

import { find as geoTz } from 'geo-tz';
import tzlookup from 'tz-lookup';

import { DateTime } from 'luxon';
import { AlignVerticalJustifyEndIcon } from 'lucide-react';

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    const formData = await req.formData();

    const jamColumns = JSON.parse(formData.get('jamColumns') as string);
    const images_list = formData
      .getAll('images')
      .filter(
        (f): f is File =>
          f instanceof File && f.size > 0 && f.type.startsWith('image/'),
      );

    jamColumns.images_three = images_list.length == 3 ? true : false;

    const parsed_jamData = validateJam(jamColumns);
    if (!parsed_jamData.success) {
      return NextResponse.json(
        {
          error: "Data couldn't pass Zod",
          details: "Data couldn't pass Zod",
        },
        { status: 400 },
      );
    }

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

    const host_id = profile?.id;

    const { location_coords } = jamColumns;

    // Handle geometry safely
    let pointValue: string | null = null;
    if (location_coords?.lat && location_coords?.lng) {
      const lat = parseFloat(location_coords.lat);
      const lng = parseFloat(location_coords.lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        pointValue = `SRID=4326;POINT(${lng} ${lat})`;
      }
    }


    
       const tz = (() => {
      if (!location_coords.lat || ! location_coords.lng) return 'UTC'; // fallback if no coords

      try {
        return geoTz(location_coords.lat,  location_coords.lng)[0] || 'UTC';
      } catch (e) {
        console.warn('geoTz failed, falling back to tz-lookup');
        return tzlookup(location_coords.lat,  location_coords.lng) || 'UTC';
      }
    })();


    

    const { data: joins, error: authError } = await supabaseAdmin
      .from('profiles')
      .select('id, sessions!inner(id)')
      .eq('email', userEmail)
      .eq('sessions.id', id) // session id from params
      .single();

    if (authError || !joins) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { data: images, error: fetchError } = await supabaseAdmin
      .from('sessions')
      .select('images')
      .eq('id', id);

    if (fetchError) throw fetchError;

    // 2️⃣ Add folder prefix
    const imageNames = images[0].images.map(
      (path: string) => 'images/' + path.substring(path.lastIndexOf('/') + 1),
    );

    const { error: deleteErrorImages } = await supabaseAdmin.storage
      .from('jamspots_imageBucket')
      .remove(imageNames); // delete only this file

    if (deleteErrorImages) {
      return NextResponse.json(
        { error: deleteErrorImages.message },
        { status: 500 },
      );
    }

    const result = await uploadPhotos(images_list);

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    jamColumns.images = result.urls;

    delete jamColumns['raw_desc'];
    delete jamColumns['images_three'];

  

    /**
     * Re-resolved on every edit, because the venue may have moved. Falls back
     * to leaving the stored city untouched if geocoding gives nothing, rather
     * than blanking a city that was already correct.
     */
    const place = await placeFromCoords(
      parseFloat(location_coords?.lat),
      parseFloat(location_coords?.lng),
    );

    const { data, error } = await supabaseAdmin
      .from('sessions')
      .update([
        {
          ...jamColumns,
          location_coords: pointValue,
          timezone: tz,
          validated:false,
          ...(place.city
            ? {
                city: place.city,
                country: place.country,
                country_code: place.countryCode,
              }
            : {}),
        },
      ])
      .eq('id', id)
      .eq('host_id', host_id)
      .select()
      .maybeSingle(); // return the updated row

       if (error) {
      console.log('Update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

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

   
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
