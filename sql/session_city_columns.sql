-- ============================================================================
-- City, country and country code on each jam.
--
-- Run this in the Supabase SQL editor, THEN run the backfill once:
--
--   curl -X POST https://www.jamwire.xyz/api/public/backfill-jam-cities \
--        -H "Authorization: Bearer $CRON_SECRET"
--
-- Until both are done, /cities shows nothing: every row's city is null, and
-- the page lists only cities that have jams.
--
-- Written by:
--   lib/placeFromCoords.ts                              (reverse geocoding)
--   app/api/private/create-session/route.ts             (on create)
--   app/api/private/update-session/[id]/route.ts        (on edit)
--   app/api/public/backfill-jam-cities/route.ts         (one-off, existing rows)
-- Read by:
--   app/cities/page.tsx
-- ============================================================================

alter table public.sessions add column if not exists city         text;
alter table public.sessions add column if not exists country      text;
alter table public.sessions add column if not exists country_code text;

-- `lat` and `lng` are deliberately not added: `sessions` stores the point in
-- `location_coords`, and the `sessions_with_coords` view already exposes both.

-- The directory groups by city and filters out the rows that have none.
create index if not exists sessions_city_idx
  on public.sessions (city)
  where city is not null;

comment on column public.sessions.city is
  'Locality from reverse geocoding location_coords, not parsed from location_address. Null when Google could not resolve it.';
comment on column public.sessions.country_code is
  'ISO 3166-1 alpha-2, e.g. ES. Kept alongside the country name for flags and grouping.';
