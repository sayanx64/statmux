import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MiniBars } from '@/components/charts'
import { PlatformIcon } from '@/components/platform-icon'
import { latestPerSource, seriesFor, trendPercent, relativeTime, type StatSnapshot, type SourceName } from '@/lib/api'
import { type PlatformKey, platformMeta } from '@/lib/data'

const SOURCES: SourceName[] = ['github', 'codeforces', 'leetcode']

export function PlatformHealth({ snapshots }: { snapshots: StatSnapshot[] }) {
  const latest = latestPerSource(snapshots)

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {SOURCES.filter(src => latest[src]).map((src) => {
        const snap = latest[src]!
        const series = seriesFor(snapshots, src)
        const trend = trendPercent(series)
        const hasTrend = trend !== null
        const up = hasTrend && trend! >= 0
        const meta = platformMeta[src as PlatformKey]
        const primaryLabel = src === 'github' ? 'Repos + Gists' : src === 'codeforces' ? 'Current rating' : 'Problems solved'
        const barData = series.map(s => s.value)

        return (
          <Card key={src} className="p-5 transition-all hover:shadow-md hover:shadow-black/[0.04]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <PlatformIcon platform={src as PlatformKey} />
                <div>
                  <p className="text-sm font-semibold text-foreground">{meta.label}</p>
                  <p className="text-xs text-muted-foreground">{primaryLabel}</p>
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
            </div>
            <p className="mt-4 font-mono text-2xl font-semibold tracking-tight text-foreground">
              {snap.value.toLocaleString()}
            </p>
            <div className="mt-3">
              <MiniBars data={barData} color={meta.accentVar} height={48} />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Updated {relativeTime(snap.recorded_at)}</p>
          </Card>
        )
      })}
    </div>
  )
}
