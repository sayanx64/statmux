import Link from 'next/link'
import { FadeUp } from './fade-up'

function StatRow({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color: string
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.07] py-2.5 last:border-0">
      <span
        className="text-xs"
        style={{ fontFamily: 'var(--font-geist-mono, monospace)', color: '#9ca0aa' }}
      >
        {label}
      </span>
      <span
        className="text-sm font-semibold"
        style={{ fontFamily: 'var(--font-geist-mono, monospace)', color }}
      >
        {value}
      </span>
    </div>
  )
}

export function LandingDemoPreview() {
  return (
    <section id="demo" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <FadeUp>
        <p
          className="mb-3 text-center text-xs font-semibold uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-geist-mono, monospace)', color: '#34d399' }}
        >
          Live Preview
        </p>
        <h2
          className="text-balance text-center text-3xl font-bold tracking-tight sm:text-4xl"
          style={{ color: '#f4f4f5' }}
        >
          See what your card looks like
        </h2>
      </FadeUp>
      <FadeUp delay={120} className="mx-auto mt-12 max-w-sm">
        {/* Profile Card */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: 'rgba(28,29,35,0.75)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.09)',
            boxShadow: '0 0 40px rgba(52,211,153,0.06)',
          }}
        >
          {/* Avatar + name row */}
          <div className="flex items-center gap-4">
            <div
              aria-hidden="true"
              className="flex size-14 shrink-0 items-center justify-center rounded-full font-mono text-lg font-bold"
              style={{
                background: 'linear-gradient(135deg, rgba(52,211,153,0.3), rgba(96,165,250,0.3))',
                border: '1px solid rgba(255,255,255,0.09)',
                color: '#f4f4f5',
              }}
            >
              A
            </div>
            <div className="min-w-0">
              <p
                className="text-sm font-semibold"
                style={{ fontFamily: 'var(--font-geist-mono, monospace)', color: '#f4f4f5' }}
              >
                /u/alex_dev
              </p>
              <p className="text-xs" style={{ color: '#9ca0aa' }}>Tracking since 2026</p>
            </div>
            {/* Health badge */}
            <div
              className="ml-auto flex flex-col items-center rounded-lg px-3 py-1.5"
              style={{
                border: '1px solid rgba(52,211,153,0.4)',
                background: 'rgba(52,211,153,0.1)',
              }}
            >
              <span
                className="font-mono text-lg font-bold leading-none"
                style={{ color: '#34d399' }}
              >
                A
              </span>
              <span
                className="font-mono text-[10px]"
                style={{ color: 'rgba(52,211,153,0.8)' }}
              >
                87
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-5">
            <StatRow label="github.repos" value="47 ↑12%" color="#60a5fa" />
            <StatRow label="codeforces.rating" value="1423 ↑5%" color="#34d399" />
            <StatRow label="leetcode.solved" value="284 ↑3%" color="#fbbf24" />
          </div>
        </div>

        {/* Caption + link */}
        <p className="mt-5 text-center text-sm" style={{ color: '#9ca0aa' }}>
          Share it anywhere — always up to date.{' '}
          <Link
            href="/login"
            className="font-medium underline underline-offset-2 transition-colors hover:text-white"
            style={{ color: '#34d399' }}
          >
            Create your card →
          </Link>
        </p>
      </FadeUp>
    </section>
  )
}
