import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Sparkline } from '@/components/charts'
import type { Kpi } from '@/lib/data'
import { cn } from '@/lib/utils'

const accentColor: Record<Kpi['accent'], string> = {
  success: 'var(--chart-1)',
  info: 'var(--chart-2)',
  warning: 'var(--chart-4)',
  neutral: 'var(--chart-3)',
}

export function KpiCard({ kpi }: { kpi: Kpi }) {
  // null trend means only one snapshot exists — no prior value to diff against
  const hasTrend = kpi.trend !== null
  const up = hasTrend && kpi.trend! >= 0
  return (
    <Card className="group overflow-hidden p-5 transition-all hover:shadow-md hover:shadow-black/[0.04]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">{kpi.label}</p>
          <p className="mt-2 font-mono text-2xl font-semibold tracking-tight text-foreground">
            {kpi.value}
            {kpi.unit ? (
              <span className="ml-1 text-sm font-medium text-muted-foreground">{kpi.unit}</span>
            ) : null}
          </p>
        </div>
        {hasTrend ? (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
              up ? 'bg-success/12 text-success' : 'bg-destructive/12 text-destructive',
            )}
          >
            {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {Math.abs(kpi.trend!)}%
          </span>
        ) : (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-muted/60 px-2 py-0.5 text-xs font-medium text-muted-foreground">
            <Minus className="h-3 w-3" />
            first sync
          </span>
        )}
      </div>
      <div className="mt-4 -mb-1">
        <Sparkline data={kpi.series} color={accentColor[kpi.accent]} height={44} />
      </div>
    </Card>
  )
}
