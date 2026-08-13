'use client'

import { useId, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

function normalize(data: number[]) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  return data.map((d) => (d - min) / span)
}

export function Sparkline({
  data,
  color = 'var(--chart-1)',
  className,
  height = 40,
}: {
  data: number[]
  color?: string
  className?: string
  height?: number
}) {
  const id = useId()
  const norm = normalize(data)
  const w = 100
  const h = 100
  const step = w / (norm.length - 1)
  const points = norm.map((v, i) => [i * step, h - v * (h - 12) - 6])
  const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
  const area = `${line} L${w},${h} L0,${h} Z`

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={cn('w-full', className)}
      style={{ height }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-${id})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

export function MiniBars({
  data,
  color = 'var(--chart-1)',
  className,
  height = 64,
  labels,
  formatValue = (v) => v.toLocaleString(),
}: {
  data: number[]
  color?: string
  className?: string
  height?: number
  labels?: string[]
  formatValue?: (v: number) => string
}) {
  const max = Math.max(...data) || 1
  const [hover, setHover] = useState<number | null>(null)

  return (
    <div className={cn('relative flex items-end gap-1', className)} style={{ height }}>
      {data.map((d, i) => {
        const active = hover === i
        return (
          <button
            key={i}
            type="button"
            className="group relative flex h-full flex-1 items-end"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            aria-label={`${labels?.[i] ?? `Point ${i + 1}`}: ${formatValue(d)}`}
          >
            <span
              className="w-full rounded-sm transition-all duration-300"
              style={{
                height: `${Math.max(6, (d / max) * 100)}%`,
                backgroundColor: color,
                opacity: hover === null ? 0.35 + (d / max) * 0.65 : active ? 1 : 0.25,
              }}
            />
            {active ? (
              <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-[11px] font-medium text-popover-foreground shadow-md">
                <span className="font-mono">{formatValue(d)}</span>
                {labels?.[i] ? (
                  <span className="ml-1 text-muted-foreground">{labels[i]}</span>
                ) : null}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

export function LineChart({
  series,
  className,
  height = 220,
  labels,
  formatValue = (v) => v.toLocaleString(),
}: {
  series: { name: string; data: number[]; color: string }[]
  className?: string
  height?: number
  labels?: string[]
  formatValue?: (v: number) => string
}) {
  const w = 100
  const h = 100
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const [tooltipX, setTooltipX] = useState(0)

  const all = series.flatMap((s) => s.data)
  const min = Math.min(...all)
  const max = Math.max(...all)
  const span = max - min || 1
  const len = Math.max(...series.map((s) => s.data.length), 1)
  const step = w / Math.max(len - 1, 1)

  const yOf = (d: number) => h - ((d - min) / span) * (h - 14) - 7

  const toPath = (data: number[]) =>
    data.map((d, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(2)},${yOf(d).toFixed(2)}`).join(' ')

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const rel = (e.clientX - rect.left) / rect.width
    const idx = Math.round(rel * (len - 1))
    const clamped = Math.min(Math.max(idx, 0), len - 1)
    setHoverIdx(clamped)
    setTooltipX((clamped / (len - 1)) * rect.width)
  }

  return (
    <div className={cn('w-full', className)}>
      <div
        ref={containerRef}
        className="relative w-full"
        style={{ height }}
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <svg
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          className="h-full w-full"
          aria-hidden="true"
        >
          {[0.25, 0.5, 0.75].map((g) => (
            <line
              key={g}
              x1="0"
              x2={w}
              y1={h * g}
              y2={h * g}
              stroke="var(--border)"
              strokeWidth="0.5"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {hoverIdx !== null ? (
            <line
              x1={hoverIdx * step}
              x2={hoverIdx * step}
              y1="0"
              y2={h}
              stroke="var(--muted-foreground)"
              strokeWidth="0.5"
              strokeDasharray="2 2"
              vectorEffect="non-scaling-stroke"
            />
          ) : null}
          {series.map((s) => (
            <path
              key={s.name}
              d={toPath(s.data)}
              fill="none"
              stroke={s.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        {/* Hover markers positioned via absolute overlay to survive non-uniform scaling */}
        {hoverIdx !== null
          ? series.map((s) => {
              const val = s.data[hoverIdx]
              if (val === undefined) return null
              return (
                <span
                  key={s.name}
                  className="pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background"
                  style={{
                    left: `${(hoverIdx / (len - 1)) * 100}%`,
                    top: `${yOf(val)}%`,
                    backgroundColor: s.color,
                  }}
                />
              )
            })
          : null}

        {hoverIdx !== null ? (
          <div
            className="pointer-events-none absolute top-2 z-10 -translate-x-1/2 rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md"
            style={{
              left: Math.min(Math.max(tooltipX, 64), (containerRef.current?.clientWidth ?? 0) - 64),
            }}
          >
            {labels?.[hoverIdx] ? (
              <p className="mb-1 font-medium text-popover-foreground">{labels[hoverIdx]}</p>
            ) : null}
            <div className="space-y-0.5">
              {series.map((s) => (
                <div key={s.name} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-muted-foreground">{s.name}</span>
                  <span className="ml-auto pl-3 font-mono font-medium text-popover-foreground">
                    {formatValue(s.data[hoverIdx] ?? 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        {series.map((s) => (
          <div key={s.name} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.name}
          </div>
        ))}
      </div>
    </div>
  )
}
