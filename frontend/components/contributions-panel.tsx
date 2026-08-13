'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MiniBars } from '@/components/charts'
import { Segmented } from '@/components/ui/segmented'

type Range = '4' | '12' | '24'

const rangeOptions = [
  { value: '4' as const, label: '4w' },
  { value: '12' as const, label: '12w' },
  { value: '24' as const, label: '24w' },
]

export function ContributionsPanel({ weeks = [] }: { weeks?: number[] }) {
  const [range, setRange] = useState<Range>('24')

  const data = useMemo(() => {
    if (!weeks.length) return Array(24).fill(0)
    const n = Number(range)
    return weeks.slice(-n)
  }, [range, weeks])

  const labels = useMemo(
    () => data.map((_, i) => `${data.length - i} week${data.length - i === 1 ? '' : 's'} ago`),
    [data],
  )

  const total = data.reduce((a, b) => a + b, 0)
  const avg = Math.round(total / (data.length || 1))

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>Activity Over Time</CardTitle>
          <CardDescription className="mt-1">
            Contributions across the last {range} weeks · {avg}/wk avg
          </CardDescription>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Segmented
            options={rangeOptions}
            value={range}
            onChange={setRange}
            size="sm"
            aria-label="Select time range"
          />
          <Badge variant="outline">{total.toLocaleString()} total</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <MiniBars
          data={data}
          labels={labels}
          color="var(--chart-1)"
          height={140}
          formatValue={(v) => `${v} contributions`}
        />
        <div className="mt-3 flex justify-between text-[11px] text-muted-foreground">
          <span>{range} weeks ago</span>
          <span>This week</span>
        </div>
      </CardContent>
    </Card>
  )
}
