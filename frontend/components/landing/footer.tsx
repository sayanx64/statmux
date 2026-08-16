import Link from 'next/link'
import { LandingLogo } from './logo'

export function LandingFooter() {
  return (
    <footer className="border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <LandingLogo />
            <p className="mt-2 text-sm" style={{ color: '#9ca0aa' }}>
              Unified coding analytics, multiplexed.
            </p>
          </div>
          <nav aria-label="Footer links" className="flex gap-6">
            <Link
              href="/terms"
              className="text-sm transition-colors hover:text-white"
              style={{ color: '#9ca0aa' }}
            >
              Terms
            </Link>
            <a
              href="https://github.com/sayanx64/statmux"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm transition-colors hover:text-white"
              style={{ color: '#9ca0aa' }}
            >
              GitHub
            </a>
            <Link
              href="/login"
              className="text-sm transition-colors hover:text-white"
              style={{ color: '#9ca0aa' }}
            >
              Sign in
            </Link>
          </nav>
        </div>
        <p
          className="mt-8 border-t pt-6 text-xs"
          style={{
            borderColor: 'rgba(255,255,255,0.07)',
            fontFamily: 'var(--font-geist-mono, monospace)',
            color: '#9ca0aa',
          }}
        >
          Built by a developer, for developers. ·{' '}
          <span style={{ color: '#34d399' }}>statmux.sayan.cyou</span>
        </p>
      </div>
    </footer>
  )
}
