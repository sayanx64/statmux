/**
 * Typed API wrapper for the coding-stats-backend.
 *
 * Every function here:
 * 1. Fetches the current Supabase session access token
 * 2. Attaches it as "Authorization: Bearer <token>"
 * 3. Hits the Express backend at NEXT_PUBLIC_API_URL
 *
 * The backend's requireAuth middleware verifies this token against Supabase
 * and sets req.user — so user_id is always server-authoritative, never trusted
 * from the request body.
 */

import { getAccessToken } from './supabase'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

async function authHeaders(): Promise<HeadersInit> {
  const token = await getAccessToken()
  if (!token) throw new Error('Not authenticated')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type SourceName = 'github' | 'codeforces' | 'leetcode'

export type Source = {
  name: SourceName
  display_name: string
}

export type StatSnapshot = {
  id: string
  value: number
  meta: Record<string, unknown>
  recorded_at: string
  sources: Source
}

export type Profile = {
  user_id: string
  github_username: string | null
  codeforces_handle: string | null
  leetcode_username: string | null
  display_name?: string | null
  email?: string | null
  updated_at: string
}

export type RefreshResult = {
  source: SourceName
  id?: string
  value?: number
  meta?: Record<string, unknown>
  error?: string
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function getProfile(): Promise<Profile | null> {
  const res = await fetch(`${BASE}/api/profile`, { headers: await authHeaders() })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function putProfile(body: {
  github_username?: string
  codeforces_handle?: string
  leetcode_username?: string
  display_name?: string
}): Promise<Profile> {
  const res = await fetch(`${BASE}/api/profile`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getDigestSubscription(): Promise<{ subscribed: boolean; last_sent_at: string | null }> {
  const res = await fetch(`${BASE}/api/profile/digest-subscription`, { headers: await authHeaders() })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function putDigestSubscription(subscribed: boolean): Promise<{ subscribed: boolean }> {
  const res = await fetch(`${BASE}/api/profile/digest-subscription`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify({ subscribed }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function getStats(): Promise<StatSnapshot[]> {
  const res = await fetch(`${BASE}/api/stats`, { headers: await authHeaders() })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function deleteStats(): Promise<{ status: string; message: string }> {
  const res = await fetch(`${BASE}/api/stats`, {
    method: 'DELETE',
    headers: await authHeaders(),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// ─── Refresh ──────────────────────────────────────────────────────────────────

export async function postRefresh(): Promise<{ refreshed: RefreshResult[] }> {
  const res = await fetch(`${BASE}/api/stats/refresh`, {
    method: 'POST',
    headers: await authHeaders(),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Latest snapshot per source, or undefined if none exists yet */
export function latestPerSource(snapshots: StatSnapshot[]): Record<SourceName, StatSnapshot | undefined> {
  const map: Record<string, StatSnapshot | undefined> = {}
  for (const snap of snapshots) {
    const name = snap.sources.name
    if (!map[name] || snap.recorded_at > map[name]!.recorded_at) {
      map[name] = snap
    }
  }
  return map as Record<SourceName, StatSnapshot | undefined>
}

/** All snapshots for one source, sorted oldest→newest */
export function seriesFor(snapshots: StatSnapshot[], source: SourceName): StatSnapshot[] {
  return snapshots
    .filter((s) => s.sources.name === source)
    .sort((a, b) => a.recorded_at.localeCompare(b.recorded_at))
}

/** Percentage change between latest and previous snapshot.
 *  Returns null when fewer than 2 snapshots exist (nothing to diff against).
 */
export function trendPercent(series: StatSnapshot[]): number | null {
  if (series.length < 2) return null
  const prev = series[series.length - 2].value
  const curr = series[series.length - 1].value
  if (prev === 0) return null
  return Math.round(((curr - prev) / prev) * 100 * 10) / 10
}

/** Format a recorded_at timestamp as a relative string e.g. "12 min ago" */
export function relativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export async function uploadAvatar(base64Image: string): Promise<{ url: string }> {
  const res = await fetch(`${BASE}/api/profile/avatar`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ image: base64Image }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
