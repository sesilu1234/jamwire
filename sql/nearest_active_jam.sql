-- ============================================================================
-- The closest jam that still has a session ahead of it.
--
-- STATUS: to run in the Supabase SQL editor.
--
-- IP geolocation sometimes lands a visitor on a village with nothing within
-- the home page's radius (an ISP's whole WiFi range resolving to Aínsa, for
-- one). When that radius comes back empty, the home page recentres on this.
--
-- Read by:
--   app/Home/page.tsx
-- ============================================================================

create index if not exists sessions_location_coords_gix
  on public.sessions using gist (location_coords);

create or replace function public.nearest_active_jam(p_lat float8, p_lng float8)
returns table (city text, country text, lat float8, lng float8)
language sql
stable
as $$
  select
    s.city,
    s.country,
    st_y(s.location_coords::geometry),
    st_x(s.location_coords::geometry)
  from public.sessions s
  where s.location_coords is not null
    and exists (
      select 1 from public.jam_dates d
      where d.jam_id = s.id and d.utc_datetime > now()
    )
  order by s.location_coords <-> st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography
  limit 1;
$$;
