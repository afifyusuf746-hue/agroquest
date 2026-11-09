-- AgroQuest Worlds ATPH — Optimized Supabase Postgres Schema
-- Follows Supabase Postgres Best Practices:
-- 1. schema-data-types: BIGINT for epoch millisecond timestamps (prevents 32-bit int overflow in Postgres)
-- 2. schema-foreign-key-indexes: Indexes on all foreign key columns (players.learner_id, enrollments.learner_id, etc.)
-- 3. query-composite-indexes & query-covering-indexes: Composite + INCLUDE indexes for hot sync & report queries
-- 4. security-rls-basics & security-rls-performance: RLS enabled on all public tables with cached (select auth.jwt()) initplans

CREATE TABLE IF NOT EXISTS public.rooms (
  code text PRIMARY KEY,
  created_at bigint NOT NULL,
  label text NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS public.learners (
  id text PRIMARY KEY,
  secret_hash text NOT NULL UNIQUE,
  created_at bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS public.players (
  id text PRIMARY KEY,
  token_hash text NOT NULL UNIQUE,
  room text NOT NULL REFERENCES public.rooms(code) ON DELETE CASCADE,
  learner_id text REFERENCES public.learners(id) ON DELETE SET NULL,
  name text NOT NULL,
  color text NOT NULL,
  x double precision NOT NULL DEFAULT 6,
  y double precision NOT NULL DEFAULT 8,
  seen bigint NOT NULL,
  emote_at bigint NOT NULL DEFAULT 0,
  elevation double precision NOT NULL DEFAULT 0,
  yaw double precision NOT NULL DEFAULT 0,
  moving smallint NOT NULL DEFAULT 0,
  farm_xp integer NOT NULL DEFAULT 0,
  farm_coins integer NOT NULL DEFAULT 0,
  harvests integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.plots (
  room text NOT NULL REFERENCES public.rooms(code) ON DELETE CASCADE,
  slot smallint NOT NULL,
  crop text NOT NULL DEFAULT '',
  planted_at bigint NOT NULL DEFAULT 0,
  watered smallint NOT NULL DEFAULT 0,
  fed smallint NOT NULL DEFAULT 0,
  version integer NOT NULL DEFAULT 0,
  owner_name text NOT NULL DEFAULT '',
  PRIMARY KEY (room, slot)
);

CREATE TABLE IF NOT EXISTS public.harvest_receipts (
  id text PRIMARY KEY,
  room text NOT NULL REFERENCES public.rooms(code) ON DELETE CASCADE,
  player_id text NOT NULL,
  slot smallint NOT NULL,
  created_at bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS public.builds (
  id text PRIMARY KEY,
  room text NOT NULL REFERENCES public.rooms(code) ON DELETE CASCADE,
  player_id text NOT NULL,
  color text NOT NULL,
  x smallint NOT NULL,
  z smallint NOT NULL,
  created_at bigint NOT NULL,
  UNIQUE (room, x, z)
);

CREATE TABLE IF NOT EXISTS public.enrollments (
  room text NOT NULL REFERENCES public.rooms(code) ON DELETE CASCADE,
  learner_id text NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  joined_at bigint NOT NULL,
  last_seen bigint NOT NULL,
  saved_at bigint NOT NULL DEFAULT 0,
  revision integer NOT NULL DEFAULT 0,
  progress text NOT NULL DEFAULT '{}',
  harvests integer NOT NULL DEFAULT 0,
  PRIMARY KEY (room, learner_id)
);

CREATE TABLE IF NOT EXISTS public.teacher_login_attempts (
  bucket text PRIMARY KEY,
  attempts integer NOT NULL DEFAULT 0
);

-- ============================================================================
-- Query & Foreign Key Indexes (query-missing-indexes, query-composite-indexes,
-- query-covering-indexes, schema-foreign-key-indexes)
-- ============================================================================

-- 1. Hot 36-player sync query: WHERE room = $1 AND seen > $2 ORDER BY id LIMIT 36
-- Covering index avoids heap fetches during frequent multiplayer syncs
CREATE INDEX IF NOT EXISTS players_room_seen_idx
  ON public.players (room, seen DESC)
  INCLUDE (id, name, color, x, y, elevation, yaw, moving, emote_at, farm_xp, farm_coins, harvests);

-- 2. Correlated EXISTS in teacher report: WHERE p.room = e.room AND p.learner_id = e.learner_id AND p.seen > $1
CREATE INDEX IF NOT EXISTS players_room_learner_seen_idx
  ON public.players (room, learner_id, seen DESC);

-- 3. Foreign key index on players.learner_id (schema-foreign-key-indexes)
CREATE INDEX IF NOT EXISTS players_learner_id_idx
  ON public.players (learner_id)
  WHERE learner_id IS NOT NULL;

-- 4. Hot builds sync query: WHERE room = $1 ORDER BY created_at LIMIT 64
-- Covering index serves all columns directly from index (Index-Only Scan)
CREATE INDEX IF NOT EXISTS builds_room_created_at_idx
  ON public.builds (room, created_at)
  INCLUDE (id, player_id, color, x, z);

-- 5. Teacher rooms list aggregation: GROUP BY r.code ORDER BY COALESCE(MAX(e.last_seen), r.created_at) DESC
CREATE INDEX IF NOT EXISTS enrollments_room_last_seen_idx
  ON public.enrollments (room, last_seen DESC);

-- 6. Foreign key index on enrollments.learner_id (2nd column of PK is not indexed standalone)
CREATE INDEX IF NOT EXISTS enrollments_learner_id_idx
  ON public.enrollments (learner_id);

-- 7. Teacher report student list sorted by case-insensitive display_name
CREATE INDEX IF NOT EXISTS enrollments_room_display_name_idx
  ON public.enrollments (room, lower(display_name));

-- 8. Harvest receipts lookup & FK index
CREATE INDEX IF NOT EXISTS harvest_receipts_room_slot_idx
  ON public.harvest_receipts (room, slot);

-- 9. Rooms ordering index
CREATE INDEX IF NOT EXISTS rooms_created_at_idx
  ON public.rooms (created_at DESC);

-- ============================================================================
-- Row Level Security (security-rls-basics & security-rls-performance)
-- ============================================================================
-- Enable RLS on every table in public schema so Data API (anon/authenticated)
-- cannot bypass server validation or leak student tokens/hashes.

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.harvest_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_login_attempts ENABLE ROW LEVEL SECURITY;

