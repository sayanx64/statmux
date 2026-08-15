'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { LoadingLogo } from '@/components/loading-logo'
import { KpiCard } from '@/components/kpi-card'
import { CodeHealthPanel } from '@/components/code-health'
import { ActivityTimeline } from '@/components/activity-timeline'
import { PlatformHealth } from '@/components/platform-health'
import { ContributionsPanel } from '@/components/contributions-panel'
import { SyncStatusCard } from '@/components/sync-status-card'
import { AdBanner } from '@/components/ad-banner'
import { Badge } from '@/components/ui/badge'
import { getStats, latestPerSource, seriesFor, trendPercent, relativeTime, type StatSnapshot } from '@/lib/api'
import { calculateCodeHealth } from '@/lib/scoring'
import { useAuth } from '@/components/auth-provider'
import type { Kpi, PlatformKey } from '@/lib/data'
import type { ActivityEvent } from '@/components/activity-timeline'

function buildKpis(snapshots: StatSnapshot[]): Kpi[] {
  const latest = latestPerSource(snapshots)
  const githubSeries = seriesFor(snapshots, 'github')
  const cfSeries = seriesFor(snapshots, 'codeforces')
  const lcSeries = seriesFor(snapshots, 'leetcode')

  return [
    {
      id: 'github-repos',
      label: 'GitHub Repos + Gists',
      value: latest.github ? String(latest.github.value) : '—',
      trend: trendPercent(githubSeries),
      accent: 'success' as const,
      series: githubSeries.map((s) => s.value),
    },
    {
      id: 'cf-rating',
      label: 'Codeforces Rating',
      value: latest.codeforces ? String(latest.codeforces.value) : '—',
      trend: trendPercent(cfSeries),
      accent: 'info' as const,
      series: cfSeries.map((s) => s.value),
    },
    {
      id: 'lc-solved',
      label: 'LeetCode Solved',
      value: latest.leetcode ? String(latest.leetcode.value) : '—',
      trend: trendPercent(lcSeries),
      accent: 'success' as const,
      series: lcSeries.map((s) => s.value),
    },
  ]
}

export default function OverviewPage() {
  const { user } = useAuth()
  const [snapshots, setSnapshots] = useState<StatSnapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getStats()
      .then(setSnapshots)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const kpis = buildKpis(snapshots)
  const lastSnap = snapshots[0] // already ordered DESC by recorded_at
  const lastSyncLabel = lastSnap ? relativeTime(lastSnap.recorded_at) : 'Never'
  const hasData = snapshots.length > 0

  const displayName = user?.user_metadata?.full_name
    ?? user?.user_metadata?.name
    ?? user?.email?.split('@')[0]
    ?? 'there'

  // Extract dynamic data from snapshots — meta is JSONB so cast explicitly
  type GhMeta = { contributionWeeks?: number[]; recentEvents?: ActivityEvent[]; repos?: number }
  type CfMeta = { recentEvents?: ActivityEvent[] }

  const latest = latestPerSource(snapshots)
  const ghMeta = (latest.github?.meta ?? {}) as GhMeta
  const cfMeta = (latest.codeforces?.meta ?? {}) as CfMeta

  const contributionWeeks: number[] = ghMeta.contributionWeeks ?? []

  const recentEvents: ActivityEvent[] = [
    ...(ghMeta.recentEvents ?? []),
    ...(cfMeta.recentEvents ?? [])
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  // Dynamic Code Health Calculation via shared scoring engine
  const { scores: healthScores, totalHealth, grade: healthGrade } = calculateCodeHealth(
    latest.github,
    latest.codeforces,
    latest.leetcode,
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground text-balance">
            Welcome back, {displayName}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s how your coding performance is trending across every platform.
          </p>
        </div>
        {hasData && (
          <Badge variant="success" className="h-7 px-3">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Last sync {lastSyncLabel}
          </Badge>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <LoadingLogo size={72} />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {!loading && !error && !hasData && (
        <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="text-sm font-medium text-foreground">No data yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Go to <strong>Profile</strong> to add your handles, then hit <strong>Refresh</strong> to fetch your stats.
          </p>
        </div>
      )}

      {!loading && hasData && (
        <>
          <section aria-label="Key metrics">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {kpis.map((kpi) => (
                <KpiCard key={kpi.id} kpi={kpi} />
              ))}
            </div>
          </section>

          <section aria-label="Activity and health" className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ContributionsPanel weeks={contributionWeeks} />
            </div>
            <div>
              <CodeHealthPanel total={totalHealth} grade={healthGrade} scores={healthScores} />
            </div>
          </section>

          <section aria-label="Platform health" className="space-y-4">
            <h3 className="text-sm font-semibold tracking-tight text-foreground">Platform Health</h3>
            <PlatformHealth snapshots={snapshots} />
          </section>

          <section aria-label="Recent activity" className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ActivityTimeline events={recentEvents} />
            </div>
            <div>
              <SyncStatusCard lastSyncLabel={lastSyncLabel} />
            </div>
          </section>

          <section aria-label="Sponsors" className="flex justify-center pt-2 pb-4">
            <AdBanner />
          </section>
        </>
      )}
    </div>
  )
}
