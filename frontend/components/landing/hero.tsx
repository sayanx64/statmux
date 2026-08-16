import Link from 'next/link'
import { FadeUp } from './fade-up'

function KpiTile({
  label,
  value,
  delta,
  color,
}: {
  label: string
  value: string
  delta: string
  color: string
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-2 sm:p-3 min-w-0">
      <p
        className="text-[9px] sm:text-[10px] uppercase tracking-wider truncate"
        style={{ fontFamily: 'var(--font-geist-mono, monospace)', color: '#9ca0aa' }}
      >
        {label}
      </p>
      <p className="mt-1 text-lg sm:text-xl font-bold truncate" style={{ color: '#f4f4f5' }}>{value}</p>
      <p className="mt-0.5 text-[10px] sm:text-xs truncate" style={{ fontFamily: 'var(--font-geist-mono, monospace)', color }}>{delta}</p>
    </div>
  )
}

function HealthGauge() {
  const radius = 44
  const circumference = Math.PI * radius
  const filled = circumference * 0.87

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width="120" height="72" viewBox="0 0 120 72" aria-hidden="true">
        {/* Glow filter */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M 16 64 A 44 44 0 0 1 104 64"
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M 16 64 A 44 44 0 0 1 104 64"
          fill="none"
          stroke="#34d399"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          filter="url(#glow)"
        />
        <text
          x="60"
          y="52"
          textAnchor="middle"
          fill="#34d399"
          fontSize="24"
          fontWeight="700"
          fontFamily="var(--font-geist-mono, monospace)"
        >
          A
        </text>
        <text
          x="60"
          y="68"
          textAnchor="middle"
          fill="#9ca0aa"
          fontSize="11"
          fontFamily="var(--font-geist-mono, monospace)"
        >
          87/100
        </text>
      </svg>
      <p
        className="mt-1 text-[10px] uppercase tracking-wider"
        style={{ fontFamily: 'var(--font-geist-mono, monospace)', color: '#9ca0aa' }}
      >
        Code Health
      </p>
    </div>
  )
}

function DashboardMockup() {
  return (
    <div
      className="w-full rounded-2xl p-5 shadow-2xl"
      style={{
        background: 'rgba(28, 29, 35, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.09)',
      }}
    >
      {/* Terminal chrome bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <p
          className="text-xs"
          style={{ fontFamily: 'var(--font-geist-mono, monospace)', color: '#9ca0aa' }}
        >
          ~/statmux/dashboard
        </p>
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: '#f87171', opacity: 0.7 }} />
          <span className="size-2.5 rounded-full" style={{ backgroundColor: '#fbbf24', opacity: 0.7 }} />
          <span className="size-2.5 rounded-full" style={{ backgroundColor: '#34d399', opacity: 0.7 }} />
        </div>
      </div>

      {/* KPI grid + gauge */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
        {/* 3-col KPI grid — always 3 cols, tiles stay readable even on mobile */}
        <div className="grid grid-cols-3 gap-2">
          <KpiTile label="GitHub" value="47" delta="repos ↑12%" color="#60a5fa" />
          <KpiTile label="CF Rating" value="1423" delta="↑5%" color="#34d399" />
          <KpiTile label="LC Solved" value="284" delta="↑3%" color="#fbbf24" />
        </div>
        <HealthGauge />
      </div>

    </div>
  )
}

export function LandingHero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-32 sm:pt-40">
      {/* Animated gradient blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="lp-blob absolute -top-32 left-1/4 h-96 w-96 rounded-full blur-3xl" style={{ background: 'rgba(52,211,153,0.10)' }} />
        <div className="lp-blob-delayed absolute right-1/4 top-16 h-80 w-80 rounded-full blur-3xl" style={{ background: 'rgba(96,165,250,0.09)' }} />
        {/* Dot grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Centered text block */}
        <div className="mx-auto max-w-3xl text-center">
          <FadeUp>
            {/* Pill badge */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#34d399]/30 bg-[#34d399]/10 px-3 py-1">
              <span className="size-1.5 rounded-full bg-[#34d399] animate-pulse" />
              <span
                className="text-xs font-medium"
                style={{ fontFamily: 'var(--font-geist-mono, monospace)', color: '#34d399' }}
              >
                Daily auto-sync · Free forever
              </span>
            </div>
            <h1
              className="text-balance text-4xl font-bold tracking-tight sm:text-6xl"
              style={{ color: '#f4f4f5', lineHeight: 1.1 }}
            >
              Your coding stats,{' '}
              <span style={{ color: '#34d399' }}>finally unified.</span>
            </h1>
          </FadeUp>
          <FadeUp delay={100}>
            <p
              className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed"
              style={{ color: '#9ca0aa' }}
            >
              Track GitHub commits, Codeforces rating, and LeetCode problems in one place. Get a
              weekly digest. Share your live card.
            </p>
          </FadeUp>
          <FadeUp delay={200}>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/login"
                id="hero-cta-primary"
                className="w-full rounded-lg px-7 py-3.5 text-sm font-semibold transition-opacity hover:opacity-90 sm:w-auto"
                style={{ background: '#34d399', color: '#0b0f0d' }}
              >
                Get started free →
              </Link>
              <a
                href="#demo"
                id="hero-cta-demo"
                className="w-full rounded-lg border px-7 py-3.5 text-sm font-semibold transition-colors hover:border-[#34d399]/40 hover:bg-white/5 sm:w-auto"
                style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#f4f4f5' }}
              >
                View sample card →
              </a>
            </div>
            <p
              className="mt-5 text-xs"
              style={{ fontFamily: 'var(--font-geist-mono, monospace)', color: '#9ca0aa' }}
            >
              No credit card · No setup · Just paste your handles
            </p>
          </FadeUp>
        </div>

        {/* Dashboard mockup */}
        <FadeUp delay={300} className="mx-auto mt-14 max-w-2xl">
          <DashboardMockup />
        </FadeUp>
      </div>
    </section>
  )
}
