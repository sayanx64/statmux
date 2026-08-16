import type { Metadata } from 'next'
import { LandingCtaSection } from '@/components/landing/cta-section'
import { LandingDemoPreview } from '@/components/landing/demo-preview'
import { LandingFeaturesGrid } from '@/components/landing/features-grid'
import { LandingFooter } from '@/components/landing/footer'
import { LandingHero } from '@/components/landing/hero'
import { LandingHowItWorks } from '@/components/landing/how-it-works'
import { LandingNavbar } from '@/components/landing/navbar'
import { LandingStatsBar } from '@/components/landing/stats-bar'

export const metadata: Metadata = {
  title: 'statmux — Unified coding analytics, multiplexed.',
  description:
    'One dashboard. GitHub, Codeforces, LeetCode — unified into a single Code Health score. Track your growth, get a weekly digest, share your live card.',
  openGraph: {
    title: 'statmux — Unified coding analytics, multiplexed.',
    description:
      'Track GitHub commits, Codeforces rating, and LeetCode problems in one place. Get a weekly digest. Share your live card.',
    url: 'https://statmux.sayan.cyou',
    siteName: 'statmux',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'statmux — Unified coding analytics, multiplexed.',
    description:
      'Track GitHub, Codeforces, and LeetCode in one dashboard. Free forever.',
  },
}

export default function LandingPage() {
  return (
    <div
      style={{
        background: '#14151a',
        color: '#f4f4f5',
        minHeight: '100vh',
        fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
      }}
    >
      <LandingNavbar />
      <main>
        <LandingHero />
        <LandingHowItWorks />
        <LandingFeaturesGrid />
        <LandingDemoPreview />
        <LandingStatsBar />
        <LandingCtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}
