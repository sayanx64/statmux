'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Check, Clock, Loader2, RefreshCw, RotateCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PlatformIcon } from '@/components/platform-icon'
import { postRefresh, getProfile, getStats, latestPerSource, relativeTime, type SourceName, type RefreshResult } from '@/lib/api'

type Status = 'idle' | 'syncing' | 'success' | 'error'

const PLATFORMS: SourceName[] = ['github', 'codeforces', 'leetcode']
const LABELS: Record<SourceName, string> = {
  github: 'GitHub',
  codeforces: 'Codeforces',
  leetcode: 'LeetCode',
}

const statusMeta: Record<Status, { label: string; variant: 'neutral' | 'success' | 'info' | 'destructive' }> = {
  idle: { label: 'Ready', variant: 'neutral' },
  syncing: { label: 'Syncing', variant: 'info' },
  success: { label: 'Up to date', variant: 'success' },
  error: { label: 'Failed', variant: 'destructive' },
}

type SyncLog = {
  id: number
  label: string
  time: string
  ok: boolean
}

export default function RefreshPage() {
  const [status, setStatus] = useState<Record<SourceName, Status>>({
    github: 'idle',
    codeforces: 'idle',
    leetcode: 'idle',
  })
  const [errors, setErrors] = useState<Record<SourceName, string | null>>({
    github: null,
    codeforces: null,
    leetcode: null,
  })
  const [logs, setLogs] = useState<SyncLog[]>([])
  const [nextId, setNextId] = useState(1)
  const [hasProfile, setHasProfile] = useState<boolean | null>(null)
  const [lastSyncs, setLastSyncs] = useState<Record<SourceName, string | null>>({
    github: null,
    codeforces: null,
    leetcode: null,
  })

  const anySyncing = Object.values(status).some((s) => s === 'syncing')

  // Load profile + existing snapshots on mount so sync state here matches
  // the Overview page — both now read from the same stats_snapshot DB query.
  useEffect(() => {
    async function init() {
      try {
        const [profile, snapshots] = await Promise.all([getProfile(), getStats()])
        const has = !!(profile?.github_username || profile?.codeforces_handle || profile?.leetcode_username)
        setHasProfile(has)

        // latestPerSource gives the most recent snapshot per platform
        const latest = latestPerSource(snapshots)
        const newStatus: Record<SourceName, Status> = {
          github: latest.github ? 'success' : 'idle',
          codeforces: latest.codeforces ? 'success' : 'idle',
          leetcode: latest.leetcode ? 'success' : 'idle',
        }
        const newLastSyncs: Record<SourceName, string | null> = {
          github: latest.github?.recorded_at ?? null,
          codeforces: latest.codeforces?.recorded_at ?? null,
          leetcode: latest.leetcode?.recorded_at ?? null,
        }
        setStatus(newStatus)
        setLastSyncs(newLastSyncs)
      } catch {
        setHasProfile(false)
      }
    }
    init()
  }, [])

  async function refreshAll() {
    // Set all platforms with handles to syncing
    setStatus({ github: 'syncing', codeforces: 'syncing', leetcode: 'syncing' })
    setErrors({ github: null, codeforces: null, leetcode: null })

    try {
      const { refreshed } = await postRefresh()

      const newStatus = { ...status }
      const newErrors = { ...errors }
      const newLastSyncs = { ...lastSyncs }

      for (const res of refreshed) {
        const src = res.source
        if (res.error) {
          newStatus[src] = 'error'
          newErrors[src] = res.error
        } else {
          newStatus[src] = 'success'
          newErrors[src] = null
          newLastSyncs[src] = new Date().toISOString()
        }
      }

      // Platforms not in the refreshed array (no handle saved) stay idle
      for (const p of PLATFORMS) {
        if (!refreshed.find((r) => r.source === p)) {
          newStatus[p] = 'idle'
        }
      }

      setStatus(newStatus)
      setErrors(newErrors)
      setLastSyncs(newLastSyncs)

      const allOk = refreshed.every((r) => !r.error)
      const connectedCount = refreshed.length
      addLog(`Full sync · ${connectedCount} platform${connectedCount !== 1 ? 's' : ''}`, 'just now', allOk)
    } catch (err: unknown) {
      setStatus({ github: 'error', codeforces: 'error', leetcode: 'error' })
      const msg = err instanceof Error ? err.message : 'Refresh failed'
      setErrors({ github: msg, codeforces: msg, leetcode: msg })
      addLog('Refresh failed', 'just now', false)
    }
  }

  function addLog(label: string, time: string, ok: boolean) {
    setLogs((prev) => [{ id: nextId, label, time, ok }, ...prev.slice(0, 9)])
    setNextId((n) => n + 1)
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <RefreshCw className={`h-5 w-5 ${anySyncing ? 'animate-spin' : ''}`} />
            </span>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-foreground">Sync your data</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Fetch the latest stats from GitHub, Codeforces, and LeetCode.
              </p>
              {hasProfile === false && (
                <p className="mt-1 text-xs text-warning">
                  ⚠ No profile found. Save your handles in <strong>Profile</strong> first.
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={refreshAll}
            disabled={anySyncing || hasProfile === false}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
          >
            {anySyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {anySyncing ? 'Refreshing…' : 'Refresh all'}
          </button>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {PLATFORMS.map((src) => {
          const s = status[src]
          const meta = statusMeta[s]
          const errMsg = errors[src]
          const last = lastSyncs[src]

          return (
            <Card key={src} className="flex flex-col">
              <CardHeader className="flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <PlatformIcon platform={src} />
                  <CardTitle className="text-sm">{LABELS[src]}</CardTitle>
                </div>
                <Badge variant={meta.variant}>
                  {s === 'syncing' ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                  {s === 'success' ? <Check className="h-3 w-3" /> : null}
                  {s === 'error' ? <AlertTriangle className="h-3 w-3" /> : null}
                  {meta.label}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                {s === 'error' && errMsg ? (
                  <div className="rounded-lg border border-destructive/25 bg-destructive/8 p-3 text-sm text-destructive">
                    {errMsg}
                    {errMsg.toLowerCase().includes('not found') && (
                      <a
                        href="/profile"
                        className="mt-2 flex items-center gap-1 text-xs font-medium text-destructive underline underline-offset-2 hover:opacity-80"
                      >
                        → Fix in Profile settings
                      </a>
                    )}
                  </div>
                ) : s === 'syncing' ? (
                  <div className="space-y-2">
                    <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                  </div>
                ) : s === 'success' ? (
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-success" />
                    {last ? `Synced ${relativeTime(last)}` : 'Synced just now'}
                  </p>
                ) : (
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    Not yet synced
                  </p>
                )}

                <button
                  type="button"
                  onClick={refreshAll}
                  disabled={anySyncing || hasProfile === false}
                  className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                  {s === 'error' ? 'Retry all' : 'Refresh'}
                </button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent refreshes</CardTitle>
          <CardDescription>A log of your most recent sync jobs.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <p className="px-5 py-6 text-sm text-muted-foreground">No syncs yet this session.</p>
          ) : (
            <ul>
              {logs.map((log) => (
                <li
                  key={log.id}
                  className="flex items-center justify-between border-t border-border/60 px-5 py-3.5 first:border-t-0"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        log.ok ? 'bg-success/12 text-success' : 'bg-destructive/12 text-destructive'
                      }`}
                    >
                      {log.ok ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    </span>
                    <span className="text-sm font-medium text-foreground">{log.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{log.time}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
