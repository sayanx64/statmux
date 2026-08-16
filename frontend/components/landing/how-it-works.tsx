'use client'

import { FadeUp } from './fade-up'

const steps = [
  {
    number: '01',
    title: 'Connect your handles',
    description: 'Paste your GitHub username, Codeforces handle, and LeetCode username in your profile settings.',
    color: '#34d399',
  },
  {
    number: '02',
    title: 'We do the math',
    description: 'Code Health score aggregates commit consistency, problem difficulty, and contest activity into a single A–D grade.',
    color: '#60a5fa',
  },
  {
    number: '03',
    title: 'Share your card',
    description: 'Your public profile at /u/[username] stays live and always up to date. Get a weekly email digest every Monday.',
    color: '#fbbf24',
  },
]

export function LandingHowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <FadeUp>
        <p
          className="mb-3 text-center text-xs font-semibold uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-geist-mono, monospace)', color: '#34d399' }}
        >
          How it works
        </p>
        <h2
          className="text-balance text-center text-3xl font-bold tracking-tight sm:text-4xl"
          style={{ color: '#f4f4f5' }}
        >
          Three steps, zero friction.
        </h2>
      </FadeUp>
      <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
        {steps.map((step, i) => (
          <FadeUp key={step.number} delay={i * 120}>
            <div
              className="h-full rounded-xl p-6 transition-all duration-300"
              style={{
                background: 'rgba(28,29,35,0.65)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.09)',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.borderColor = `${step.color}40`
                el.style.boxShadow = `0 0 24px ${step.color}10`
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.borderColor = 'rgba(255,255,255,0.09)'
                el.style.boxShadow = 'none'
              }}
            >
              <span
                className="text-3xl font-bold"
                style={{ fontFamily: 'var(--font-geist-mono, monospace)', color: step.color, opacity: 0.8 }}
              >
                {step.number}
              </span>
              <h3 className="mt-3 text-lg font-semibold" style={{ color: '#f4f4f5' }}>
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: '#9ca0aa' }}>
                {step.description}
              </p>
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  )
}
