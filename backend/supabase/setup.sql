-- Run this in Supabase Dashboard -> SQL Editor -> New Query -> Run

create table if not exists stats_snapshot (
  id uuid primary key default gen_random_uuid(),
  source text not null,              -- 'leetcode' | 'codeforces' | 'github'
  value integer not null,            -- e.g. streak count, rating, commit count
  meta jsonb default '{}'::jsonb,    -- anything extra: { "rank": 1234, "url": "..." }
  recorded_at timestamptz default now()
);

-- Digest subscriptions table (opt-in weekly digests)
create table if not exists public.digest_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  subscribed boolean not null default false,
  last_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row Level Security: locked down by default. Since our backend uses the
-- SERVICE ROLE key (which bypasses RLS), the API still works fine.
-- We enable RLS anyway so that if you ever expose this table to a frontend
-- using the public anon key, nobody can read/write it until you add policies.
alter table stats_snapshot enable row level security;
alter table digest_subscriptions enable row level security;
