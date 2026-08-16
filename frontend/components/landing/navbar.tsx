'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LandingLogo } from './logo'
import { useAuth } from '@/components/auth-provider'

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const { session } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-white/10 bg-[#14151a]/80 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="statmux home">
          <LandingLogo />
        </Link>
        <div className="flex items-center gap-3">
          {session ? (
            <Link
              href="/"
              className="rounded-lg bg-[#34d399] px-4 py-2 text-sm font-semibold text-[#0b0f0d] transition-opacity hover:opacity-90"
            >
              Dashboard →
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-[#9ca0aa] transition-colors hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/login"
                className="rounded-lg bg-[#34d399] px-4 py-2 text-sm font-semibold text-[#0b0f0d] transition-opacity hover:opacity-90"
              >
                Get started →
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
