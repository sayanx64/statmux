'use client'

import { FadeUp } from './fade-up'

const features = [
  {
    title: 'Code Health Score',
    description: 'A/B/C/D grade computed from 4 sub-scores across all your platforms. Know exactly where you stand.',
    accentColor: '#34d399',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M10 2l2.4 4.9 5.4.8-3.9 3.8.9 5.3L10 14.3l-4.8 2.5.9-5.3L2.2 7.7l5.4-.8L10 2z"
          stroke="#34d399"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: 'Weekly Digest Email',
    description: 'A Monday-morning recap of your progress automatically delivered to your inbox — with deltas.',
    accentColor: '#60a5fa',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="2" y="4" width="16" height="12" rx="2" stroke="#60a5fa" strokeWidth="1.5" />
        <path d="M2 6l8 5 8-5" stroke="#60a5fa" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: 'Live Share Card',
    description: 'A public URL at /u/[username] you can share on Twitter, LinkedIn, or your portfolio. Always live.',
    accentColor: '#fbbf24',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M12 4h4v4M16 4l-6 6M8 4H5a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1v-3"
          stroke="#fbbf24"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: 'Platform Comparison',
    description: 'Side-by-side compare any two devs at /compare — settle arguments with actual data.',
    accentColor: '#34d399',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="3" y="9" width="4" height="8" rx="1" stroke="#34d399" strokeWidth="1.5" />
        <rect x="13" y="5" width="4" height="12" rx="1" stroke="#60a5fa" strokeWidth="1.5" />
        <line x1="7" y1="13" x2="13" y2="13" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="2 2" />
      </svg>
    ),
  },
  {
    title: 'Daily Auto-Sync',
    description: 'Stats refresh every night automatically. No API keys to set up, no manual refresh button.',
    accentColor: '#34d399',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M17 10a7 7 0 11-2-4.9M17 3v4h-4"
          stroke="#34d399"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: 'Time-series Tracking',
    description: 'Historical snapshots, not just current state. Watch trends form over weeks and months.',
    accentColor: '#fbbf24',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M3 16l4-6 4 3 6-9"
          stroke="#fbbf24"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
]

export function LandingFeaturesGrid() {
  return (
    <section
      className="relative py-20"
      style={{
        background: 'linear-gradient(to bottom, transparent, rgba(28,29,35,0.4), transparent)',
      }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <FadeUp>
          <p
            className="mb-3 text-center text-xs font-semibold uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-geist-mono, monospace)', color: '#34d399' }}
          >
            Features
          </p>
          <h2
            className="text-balance text-center text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ color: '#f4f4f5' }}
          >
            Everything in one place
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-pretty leading-relaxed" style={{ color: '#9ca0aa' }}>
            Stop tab-hopping between three sites. statmux pulls it all together and makes sense of it.
          </p>
        </FadeUp>
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <FadeUp key={feature.title} delay={(i % 3) * 100}>
              <div
                className="group h-full rounded-xl p-6 transition-all duration-300"
                style={{
                  background: 'rgba(28,29,35,0.65)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.09)',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.borderColor = `${feature.accentColor}40`
                  el.style.boxShadow = `0 0 24px ${feature.accentColor}08`
                  el.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.borderColor = 'rgba(255,255,255,0.09)'
                  el.style.boxShadow = 'none'
                  el.style.transform = 'none'
                }}
              >
                <div
                  className="flex size-10 items-center justify-center rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
                >
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-base font-semibold" style={{ color: '#f4f4f5' }}>
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: '#9ca0aa' }}>
                  {feature.description}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}
