export type PlatformKey = 'github' | 'codeforces' | 'leetcode'

export type Profile = {
  githubUsername: string
  codeforcesHandle: string
  leetcodeUsername: string
}

export type SyncState = 'connected' | 'pending' | 'error'

export type PlatformStat = {
  key: PlatformKey
  label: string
  primaryLabel: string
  primaryValue: string
  trend: number // percentage change
  lastFetch: string
  syncState: SyncState
  series: number[]
  metrics: { label: string; value: string }[]
}

export type Kpi = {
  id: string
  label: string
  value: string
  unit?: string
  trend: number | null  // null = only one snapshot, delta cannot be computed
  accent: 'success' | 'info' | 'neutral' | 'warning'
  series: number[]
}

export type ActivityItem = {
  id: string
  platform: PlatformKey
  title: string
  detail: string
  time: string
}

export const platformMeta: Record<
  PlatformKey,
  { label: string; short: string; accentVar: string }
> = {
  github: { label: 'GitHub', short: 'GH', accentVar: 'var(--chart-3)' },
  codeforces: { label: 'Codeforces', short: 'CF', accentVar: 'var(--info)' },
  leetcode: { label: 'LeetCode', short: 'LC', accentVar: 'var(--warning)' },
}
