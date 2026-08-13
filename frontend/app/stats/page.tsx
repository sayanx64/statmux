'use client'

import { useEffect, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, Clock, AlertCircle } from 'lucide-react'
import { LoadingLogo } from '@/components/loading-logo'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LineChart } from '@/components/charts'
import { PlatformIcon } from '@/components/platform-icon'
import {
  getStats,
  latestPerSource,
  seriesFor,
  trendPercent,
  relativeTime,
  type StatSnapshot,
  type SourceName,
} from '@/lib/api'
import { normalizeToRange } from '@/lib/scoring'

const SOURCES: SourceName[] = ['github', 'codeforces', 'leetcode']

const SOURCE_META: Record<SourceName, {
  label: string
  primaryLabel: string
  color: string
  getMetrics: (snap: StatSnapshot) => { label: string; value: string }[]
}> = {
  github: {
    label: 'GitHub',
    primaryLabel: 'Repos + Gists',
    color: 'var(--chart-3)',
    getMetrics: (s) => [
      { label: 'Repos', value: String((s.meta as { repos?: number }).repos ?? '—') },
      { label: 'Followers', value: String((s.meta as { followers?: number }).followers ?? '—') },
      { label: 'Total value', value: String(s.value) },
      { label: 'Handle', value: `@${(s.meta as { username?: string }).username ?? '—'}` },
    ],
  },
  codeforces: {
    label: 'Codeforces',
    primaryLabel: 'Current rating',
    color: 'var(--info)',
    getMetrics: (s) => [
      { label: 'Max rating', value: String((s.meta as { maxRating?: number }).maxRating ?? '—') },
      { label: 'Rank', value: String((s.meta as { rank?: string }).rank ?? '—') },
      { label: 'Handle', value: `@${(s.meta as { handle?: string }).handle ?? '—'}` },
      { label: 'Rating', value: String(s.value) },
    ],
  },
  leetcode: {
    label: 'LeetCode',
    primaryLabel: 'Problems solved',
    color: 'var(--warning)',
    getMetrics: (s) => {
      const diff = (s.meta as { byDifficulty?: { difficulty: string; count: number }[] }).byDifficulty ?? []
      const easy = diff.find((d) => d.difficulty === 'Easy')?.count ?? '—'
      const medium = diff.find((d) => d.difficulty === 'Medium')?.count ?? '—'
      const hard = diff.find((d) => d.difficulty === 'Hard')?.count ?? '—'
      return [
        { label: 'Easy', value: String(easy) },
        { label: 'Medium', value: String(medium) },
        { label: 'Hard', value: String(hard) },
        { label: 'Total solved', value: String(s.value) },
      ]
    },
  },
}

export default function StatsPage() {
  const [snapshots, setSnapshots] = useState<StatSnapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getStats()
      .then(setSnapshots)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const latest = latestPerSource(snapshots)

  const compareSeries = SOURCES
    .filter((src) => seriesFor(snapshots, src).length > 0)
    .map((src) => ({
      name: SOURCE_META[src].label,
      data: normalizeToRange(seriesFor(snapshots, src).map((s) => s.value)),
      color: SOURCE_META[src].color,
    }))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingLogo size={72} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
        <AlertCircle className="h-4 w-4 shrink-0" />
        {error}
      </div>
    )
  }

  if (snapshots.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
        <p className="text-sm font-medium text-foreground">No stats yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Save your handles in <strong>Profile</strong>, then click <strong>Refresh</strong> to pull in your data.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        {SOURCES.filter((src) => latest[src]).map((src) => {
          const snap = latest[src]!
          const series = seriesFor(snapshots, src)
          const trend = trendPercent(series)
          const hasTrend = trend !== null
          const up = hasTrend && trend! >= 0
          const meta = SOURCE_META[src]

          return (
            <Card key={src}>
              <CardHeader className="flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <PlatformIcon platform={src} />
                  <div>
                    <CardTitle className="text-sm">{meta.label}</CardTitle>
                    <p className="text-xs text-muted-foreground">{meta.primaryLabel}</p>
                  </div>
                </div>
                {hasTrend ? (
                  <Badge variant={up ? 'success' : 'destructive'}>
                    {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {Math.abs(trend!)}%
                  </Badge>
                ) : (
                  <Badge variant="neutral">first sync</Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-mono text-3xl font-semibold tracking-tight text-foreground">
                  {snap.value.toLocaleString()}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {meta.getMetrics(snap).map((m) => (
                    <div key={m.label} className="rounded-lg border border-border bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">{m.label}</p>
                      <p className="mt-1 font-mono text-sm font-semibold text-foreground">{m.value}</p>
                    </div>
                  ))}
                </div>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Last fetch {relativeTime(snap.recorded_at)}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {compareSeries.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Growth comparison</CardTitle>
            <CardDescription>
              Each platform is independently scaled to 0–100 so they can be compared side by side regardless of their absolute values.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart series={compareSeries} height={240} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Metric breakdown</CardTitle>
          <CardDescription>Latest values fetched from each source.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Platform</th>
                  <th className="px-5 py-3 font-medium">Metric</th>
                  <th className="px-5 py-3 font-medium">Value</th>
                  <th className="px-5 py-3 font-medium">Last fetch</th>
                </tr>
              </thead>
              <tbody>
                {SOURCES.filter((src) => latest[src]).flatMap((src) => {
                  const snap = latest[src]!
                  const meta = SOURCE_META[src]
                  return meta.getMetrics(snap).map((m, i) => (
                    <tr
                      key={`${src}-${m.label}`}
                      className="border-b border-border/60 transition-colors hover:bg-muted/40"
                    >
                      <td className="px-5 py-3">
                        {i === 0 ? (
                          <span className="flex items-center gap-2 font-medium text-foreground">
                            <PlatformIcon platform={src} size="sm" />
                            {meta.label}
                          </span>
                        ) : (
                          <span className="pl-10 text-muted-foreground">{meta.label}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{m.label}</td>
                      <td className="px-5 py-3 font-mono font-medium text-foreground">{m.value}</td>
                      <td className="px-5 py-3 text-muted-foreground">{relativeTime(snap.recorded_at)}</td>
                    </tr>
                  ))
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
