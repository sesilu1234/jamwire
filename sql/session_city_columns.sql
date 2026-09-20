-- ============================================================================
-- City, country and country code on each jam.
--
-- STATUS: applied. The columns exist and all 54 existing rows were backfilled
-- by reverse geocoding their coordinates. Kept as the record of the change.
--
-- Step 2 below (recreating the view) is the part still to run.
--
-- Written by:
--   lib/placeFromCoords.ts                        (reverse geocoding)
--   app/api/private/create-session/route.ts       (on create)
--   app/api/private/update-session/[id]/route.ts  (on edit)
-- Read by:
--   lib/getCitiesWithJams.ts   -> app/cities/page.tsx, app/sitemap.xml/route.ts
-- ============================================================================

-- ── 1. The columns ──────────────────────────────────────────────────────────

alter table public.sessions add column if not exists city         text;
alter table public.sessions add column if not exists country      text;
alter table public.sessions add column if not exists country_code text;

-- `lat` and `lng` are deliberately not added: `sessions` stores the point in
-- `location_coords`, and `sessions_with_coords` already exposes both.

create index if not exists sessions_city_idx
  on public.sessions (city)
  where city is not null;

comment on column public.sessions.city is
  'Locality from reverse geocoding location_coords, not parsed from location_address. Null when Google could not resolve it.';
comment on column public.sessions.country_code is
  'ISO 3166-1 alpha-2, e.g. ES. Kept alongside the country name for flags and grouping.';


-- ── 2. The view ─────────────────────────────────────────────────────────────
--
-- A Postgres view fixes its column list when it is created, so the three
-- columns above are invisible to `sessions_with_coords` until it is rebuilt.
-- That is why `get-jam-edit` (which selects * from the view) cannot see them.
--
-- The new columns go last, which is the only change `create or replace view`
-- permits - it cannot reorder, rename or retype existing ones.
--
-- Safe with respect to the edit form: `EditArea.tsx` builds its payload from
-- an explicit list of 19 fields, so the extra columns are never posted back
-- and cannot overwrite what create/update already set.

create or replace view public.sessions_with_coords as
select
  id,
  jam_title,
  location_title,
  location_address,
  periodicity,
  "dayOfWeek",
  dates,
  images,
  styles,
  lista_canciones,
  instruments_lend,
  drums,
  description,
  social_links,
  location_coords,
  host_id,
  created_at,
  time_start,
  slug,
  validated,
  priority_score,
  modality,
  timezone,
  st_x (location_coords::geometry) as lng,
  st_y (location_coords::geometry) as lat,
  city,
  country,
  country_code
from
  sessions s;


-- ── 3. Filling a jam that has no city ───────────────────────────────────────
--
-- There is no backfill route any more; create and edit both resolve the city
-- themselves, so new jams arrive with one. The exception is a jam whose
-- geocoding failed at the moment it was created - it keeps a null city and
-- stays out of /cities until someone re-saves it in the editor.
--
-- To find any:
--
--   select id, jam_title, location_address from public.sessions where city is null;
--
-- Google returns the local name for some localities even when asked for
-- English ("München" rather than "Munich"), and returns the exact municipality
-- rather than the well-known city next to it ("Coral Gables", not "Miami").
-- Both are fixed by hand when they matter:
--
--   update public.sessions set city = 'Munich' where city = 'München';
-- ============================================================================
