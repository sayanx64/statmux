'use client'

import Link from 'next/link'
import { FadeUp } from './fade-up'

export function LandingCtaSection() {
  return (
    <section id="cta" className="relative overflow-hidden py-28">
      {/* Background glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="lp-blob absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{ background: 'rgba(52,211,153,0.09)' }}
        />
        {/* Dot grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <FadeUp>
          <h2
            className="text-balance text-3xl font-bold tracking-tight sm:text-5xl"
            style={{ color: '#f4f4f5', lineHeight: 1.15 }}
          >
            Stop checking 3 tabs.{' '}
            <span style={{ color: '#34d399' }}>Start checking one.</span>
          </h2>
        </FadeUp>
        <FadeUp delay={120}>
          <Link
            href="/login"
            id="footer-cta-btn"
            className="mt-8 inline-block rounded-lg px-8 py-3.5 text-sm font-semibold transition-all hover:opacity-90 hover:shadow-lg"
            style={{
              background: '#34d399',
              color: '#0b0f0d',
              boxShadow: '0 0 0 0 rgba(52,211,153,0)',
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow =
                '0 0 28px rgba(52,211,153,0.3)'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none'
            }}
          >
            Create your free account →
          </Link>
          <p
            className="mt-4 text-xs"
            style={{ fontFamily: 'var(--font-geist-mono, monospace)', color: '#9ca0aa' }}
          >
            No credit card · No setup · Just paste your handles
          </p>
        </FadeUp>
      </div>
    </section>
  )
}
