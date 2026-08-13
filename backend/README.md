# statmux — Express + Supabase Backend

Production-ready backend for **statmux**. Multiplexes statistics across GitHub, Codeforces, and LeetCode, executes scheduled sync crons, computes Code Health, and delivers automated weekly digests via mxroute SMTP.

---

## Architecture & Responsibilities

- **Authentication & Security**: Validates Supabase JWTs via `requireAuth.js` middleware before delegating to Supabase PostgreSQL using the service role key.
- **Platform Ingestion**: Fetches live data from GitHub (REST/HTML calendar), Codeforces (REST API), and LeetCode (GraphQL API) with isolated error handling.
- **Public Surface**: Public routes (`/api/public/*`) sanitize all sensitive data (`user_id`, `email`) and deliver fast response times.
- **Weekly Digest Engine**: Calculates week-over-week deltas, formats responsive dark-themed HTML emails, and dispatches via mxroute SMTP in throttled batches.
- **Background Schedulers**: External GitHub Actions runners hit `/api/internal/refresh-all` (daily at 00:00 UTC) and `/api/internal/send-digests` (weekly on Mondays at 09:00 UTC) with shared `x-cron-secret` authorization.

---

## API Routes Summary

### Authenticated Routes (`Authorization: Bearer <token>`)
- `GET /api/profile` — Fetch user's registered platform handles.
- `PUT /api/profile` — Upsert user's platform handles.
- `GET /api/profile/digest-subscription` — Get weekly digest email opt-in status.
- `PUT /api/profile/digest-subscription` — Update weekly digest email opt-in status.
- `POST /api/profile/avatar` — Upload base64 WebP image buffer to Supabase Storage.
- `GET /api/stats` — Retrieve all historical snapshots for user.
- `DELETE /api/stats` — Wipe all synced snapshot data for user.
- `POST /api/stats/refresh` — Synchronously trigger fresh stats ingestion for all configured handles.

### Public Unauthenticated Routes
- `GET /api/public/:username` — Public shareable card data (Code Health, platform handles, latest counters).
- `GET /api/public/compare/:username1/:username2` — Parallel dual-profile comparison data with winner metrics.
- `GET /api/digest/unsubscribe?uid=...&token=...` — Cryptographically signed one-click unsubscribe endpoint.

### Internal Cron Routes (`x-cron-secret: <CRON_SECRET>`)
- `POST /api/internal/refresh-all` — Batch stats sync across all registered user profiles.
- `POST /api/internal/send-digests` — Batch weekly digest generation and email delivery to opted-in users.

---

## Database Tables

```sql
-- Core stats snapshots
create table if not exists public.stats_snapshot (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.sources(id) not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  value integer not null,
  meta jsonb default '{}'::jsonb,
  recorded_at timestamptz default now()
);

-- User handle profiles
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  github_username text,
  codeforces_handle text,
  leetcode_username text,
  updated_at timestamptz default now()
);

-- Opt-in weekly digest subscriptions
create table if not exists public.digest_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  subscribed boolean not null default false,
  last_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```
