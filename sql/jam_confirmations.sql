-- ============================================================================
-- "I've been here" — visitor confirmations that a jam is still running.
--
-- Run this in the Supabase SQL editor BEFORE using the button on a jam page.
-- Until it exists, the page still renders (the read endpoint returns zeroes),
-- but pressing the button will fail.
--
-- Used by:
--   app/api/public/get-jam-confirmations/[id]/route.ts   (read)
--   app/api/private/jam-confirm/[id]/route.ts            (write)
-- ============================================================================

create table if not exists public.jam_confirmations (
  id           uuid        primary key default gen_random_uuid(),
  jam_id       uuid        not null references public.sessions(id) on delete cascade,
  email        text        not null,
  confirmed_at timestamptz not null default now()
);

-- One row per confirmation, not per person: the question is "is this jam alive
-- *now*", which a single accumulating counter per user cannot answer. The
-- 7-day cooldown that stops one person running the number up is enforced in
-- the API route, not here, so it can return a friendly 429 instead of a
-- constraint violation.

-- Every read filters by jam and sorts by recency.
create index if not exists jam_confirmations_jam_id_confirmed_at_idx
  on public.jam_confirmations (jam_id, confirmed_at desc);

-- The cooldown lookup is (jam_id, email, confirmed_at).
create index if not exists jam_confirmations_jam_id_email_idx
  on public.jam_confirmations (jam_id, email);

-- Both routes go through supabaseAdmin (the service role key), which bypasses
-- RLS. RLS is enabled anyway so that nothing is readable or writable if an
-- anon key ever touches this table.
alter table public.jam_confirmations enable row level security;


-- ============================================================================
-- OPTIONAL, LATER: feed this into the map's ordering.
--
-- `update_session_priority_score` lives in the database, not in the repo, so
-- it cannot be edited from here. Once there are real confirmations, paste that
-- function's current body over and a confirmation term can be added to it —
-- the effect being that jams people have vouched for recently rise on the map
-- and abandoned ones sink.
--
-- The number it would use, per jam:
--
--   select count(*)
--     from public.jam_confirmations
--    where jam_id = <session id>
--      and confirmed_at > now() - interval '90 days';
-- ============================================================================
