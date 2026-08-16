'use client'

import { useEffect, useRef, useState } from 'react'

function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [value, setValue] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true
          const duration = 1400
          const start = performance.now()
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setValue(Math.round(eased * target))
            if (progress < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
          observer.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  )
}

const stats = [
  { value: 3, suffix: '', label: 'Platforms Unified', color: '#34d399' },
  { value: 100, suffix: '+', label: 'Developers Tracking', color: '#60a5fa' },
  { value: 0, suffix: '', label: 'Setup Required', color: '#fbbf24', isZero: true },
]

export function LandingStatsBar() {
  return (
    <section
      className="border-y"
      style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(28,29,35,0.4)' }}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6"
        style={{ '--tw-divide-opacity': '1', '--divide-color': 'rgba(255,255,255,0.07)' } as React.CSSProperties}
      >
        {stats.map((stat) => (
          <div key={stat.label} className="py-10 text-center">
            <p
              className="text-4xl font-bold"
              style={{ fontFamily: 'var(--font-geist-mono, monospace)', color: stat.color }}
            >
              {stat.isZero ? (
                'Zero'
              ) : (
                <CountUp target={stat.value} suffix={stat.suffix} />
              )}
            </p>
            <p className="mt-2 text-sm" style={{ color: '#9ca0aa' }}>{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
