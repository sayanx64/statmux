'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle, Mail, Lock, Eye, EyeOff, GitBranch } from 'lucide-react'
import { signInWithEmail, signUpWithEmail, signInWithGithub } from '@/lib/supabase'
import { cn } from '@/lib/utils'

import { useAuth } from '@/components/auth-provider'
import { AdBanner } from '@/components/ad-banner'

type Mode = 'signin' | 'signup'

export default function LoginPage() {
  const router = useRouter()
  const { session, loading: authLoading } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  
  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (!authLoading && session) {
      router.push('/')
    }
  }, [session, authLoading, router])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [githubLoading, setGithubLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (mode === 'signin') {
        const { error } = await signInWithEmail(email, password)
        if (error) throw error
        router.push('/')
      } else {
        const { error } = await signUpWithEmail(email, password)
        if (error) throw error
        setSuccess('Account created! Check your email to confirm, then sign in.')
        setMode('signin')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleGithub() {
    setError(null)
    setGithubLoading(true)
    try {
      const { error } = await signInWithGithub()
      if (error) throw error
      // redirect happens via OAuth, so we don't push here
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'GitHub sign-in failed')
      setGithubLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Brand */}
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#0b0d10] shadow-lg border border-[#242933] overflow-hidden">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" width="80" height="80" aria-hidden="true">
              <rect x="6" y="6" width="188" height="188" rx="42" fill="#0b0d10" stroke="#242933" strokeWidth="2"/>
              <rect x="24" y="24" width="70" height="152" rx="10" fill="#12151a" stroke="#242933" strokeWidth="1.5"/>
              <rect x="106" y="24" width="70" height="68" rx="10" fill="#12151a" stroke="#242933" strokeWidth="1.5"/>
              <rect x="106" y="108" width="70" height="68" rx="10" fill="#12151a" stroke="#242933" strokeWidth="1.5"/>
              <circle cx="34" cy="36" r="4" fill="#34d399"/>
              <circle cx="116" cy="36" r="4" fill="#60a5fa"/>
              <circle cx="116" cy="120" r="4" fill="#fbbf24"/>
              <text x="59" y="116" fontFamily="'JetBrains Mono','Fira Code',monospace" fontSize="46" fontWeight="700" fill="#34d399" textAnchor="middle">&gt;_</text>
              <rect x="120" y="70" width="6" height="12" fill="#60a5fa"/>
              <rect x="131" y="62" width="6" height="20" fill="#60a5fa"/>
              <rect x="142" y="54" width="6" height="28" fill="#60a5fa"/>
              <rect x="153" y="66" width="6" height="16" fill="#60a5fa"/>
              <rect x="164" y="58" width="6" height="24" fill="#60a5fa"/>
              <polyline points="120,158 132,150 143,154 154,140 165,146" fill="none" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">statmux</h1>
            <p className="mt-1 text-sm text-muted-foreground">unified coding analytics, multiplexed</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
          {/* Mode toggle */}
          <div className="flex rounded-lg border border-border bg-muted/40 p-1">
            {(['signin', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(null); setSuccess(null) }}
                className={cn(
                  'flex-1 rounded-md py-1.5 text-sm font-medium transition-all',
                  mode === m
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {m === 'signin' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          {/* GitHub OAuth */}
          <button
            type="button"
            onClick={handleGithub}
            disabled={githubLoading || loading}
            className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-background py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-60"
          >
            {githubLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitBranch className="h-4 w-4" />}
            Continue with GitHub
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
                <AlertCircle className="mt-px h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-success/30 bg-success/8 px-3 py-2.5 text-sm text-success">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || githubLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          By signing in you agree to our{' '}
          <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
            Terms of Service
          </Link>.
        </p>

        {/* Ad Swap verification embed */}
        <div className="flex justify-center pt-2">
          <AdBanner />
        </div>
      </div>
    </div>
  )
}
