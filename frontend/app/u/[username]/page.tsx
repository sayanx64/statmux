'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink, Activity, Award, CheckCircle2, AlertCircle, ArrowUpRight, Sparkles, Layers } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PlatformIcon } from '@/components/platform-icon'
import { LoadingLogo } from '@/components/loading-logo'
import { AdBanner } from '@/components/ad-banner'
import { relativeTime } from '@/lib/api'

interface PublicProfileData {
  username: string
  display_name: string
  avatar_url: string | null
  handles: {
    github: string | null
    codeforces: string | null
    leetcode: string | null
  }
  stats: {
    github: {
      value: number
      repos: number | null
      followers: number | null
      recorded_at: string
    } | null
    codeforces: {
      value: number
      rank: string | null
      maxRating: number | null
      recorded_at: string
    } | null
    leetcode: {
      value: number
      byDifficulty: { difficulty: string; count: number }[] | null
      recorded_at: string
    } | null
  }
  codeHealth: {
    total: number
    grade: 'A' | 'B' | 'C' | 'D'
    scores: {
      consistency: number
      problemDifficulty: number
      repoQuality: number
      contestActivity: number
    }
  }
  last_synced_at: string | null
}

export default function PublicProfilePage() {
  const params = useParams()
  const rawUsername = Array.isArray(params?.username) ? params.username[0] : params?.username
  const username = decodeURIComponent(rawUsername || '')

  const [profile, setProfile] = useState<PublicProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleCopyLink() {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  useEffect(() => {
    if (!username) {
      setNotFound(true)
      setLoading(false)
      return
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL || ''
    fetch(`${apiBase}/api/public/${encodeURIComponent(username)}`)
      .then(async (res) => {
        if (!res.ok) {
          setNotFound(true)
          return null
        }
        return res.json()
      })
      .then((data) => {
        if (data) setProfile(data)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [username])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <LoadingLogo size={80} />
        <p className="mt-4 text-sm text-muted-foreground">Loading public analytics...</p>
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive">
            <AlertCircle className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Profile Not Found</h1>
            <p className="text-sm text-muted-foreground">
              We couldn&apos;t find a public statmux profile for <strong className="text-foreground">@{username}</strong>.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Go to statmux home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const { display_name, avatar_url, handles, stats, codeHealth, last_synced_at } = profile
  const gradeColors = {
    A: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    B: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    C: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    D: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-success/20 selection:text-foreground">
      {/* Top minimal header */}
      <header className="border-b border-border bg-card/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/login" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-mono font-bold text-sm">
              <Layers className="h-4 w-4 text-emerald-400" />
            </div>
            <span className="font-mono text-base font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
              statmux
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Link copied!
                </>
              ) : (
                <>
                  <ExternalLink className="h-3.5 w-3.5" />
                  Share profile
                </>
              )}
            </button>
            <Link
              href="/login"
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              Claim your profile
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Public Profile Card */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="space-y-6">
          {/* Hero User Header */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted text-xl font-bold text-foreground shadow-inner">
                  {avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatar_url} alt={display_name} className="h-full w-full object-cover" />
                  ) : (
                    display_name.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                      {display_name}
                    </h1>
                    <span className="font-mono text-xs text-muted-foreground">@{profile.username}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Public Developer Portfolio · {last_synced_at ? `Synced ${relativeTime(last_synced_at)}` : 'Recently synced'}
                  </p>
                </div>
              </div>

              {/* Code Health Badge */}
              <div className="flex items-center gap-3 self-start rounded-xl border border-border bg-background/80 p-3 sm:self-auto">
                <div className="text-right">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Code Health
                  </div>
                  <div className="font-mono text-lg font-bold text-foreground">
                    {codeHealth.total}<span className="text-xs text-muted-foreground">/100</span>
                  </div>
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg border font-mono text-lg font-bold ${
                    gradeColors[codeHealth.grade]
                  }`}
                >
                  {codeHealth.grade}
                </div>
              </div>
            </div>

            {/* Health Pillars Breakdown */}
            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border/60 pt-6 sm:grid-cols-4">
              {[
                { label: 'Consistency', value: codeHealth.scores.consistency },
                { label: 'Difficulty', value: codeHealth.scores.problemDifficulty },
                { label: 'Repo Quality', value: codeHealth.scores.repoQuality },
                { label: 'Contest Rating', value: codeHealth.scores.contestActivity },
              ].map((pillar) => (
                <div key={pillar.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{pillar.label}</span>
                    <span className="font-mono font-medium text-foreground">{pillar.value}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${pillar.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3 Platform Performance Metrics */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* GitHub Card */}
            <Card className="flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PlatformIcon platform="github" size="md" />
                    <CardTitle className="text-sm font-semibold">GitHub</CardTitle>
                  </div>
                  {handles.github && (
                    <a
                      href={`https://github.com/${handles.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title="Open GitHub Profile"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                <CardDescription className="text-xs">Repositories & Code Volume</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="font-mono text-3xl font-bold tracking-tight text-foreground">
                    {stats.github ? stats.github.value : '—'}
                  </div>
                  <p className="text-xs text-muted-foreground">Public repos & gists</p>
                </div>
                {stats.github?.followers !== null && stats.github?.followers !== undefined && (
                  <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-3 py-1.5 text-xs">
                    <span className="text-muted-foreground">Followers</span>
                    <span className="font-mono font-semibold text-foreground">
                      {stats.github.followers.toLocaleString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Codeforces Card */}
            <Card className="flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PlatformIcon platform="codeforces" size="md" />
                    <CardTitle className="text-sm font-semibold">Codeforces</CardTitle>
                  </div>
                  {handles.codeforces && (
                    <a
                      href={`https://codeforces.com/profile/${handles.codeforces}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title="Open Codeforces Profile"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                <CardDescription className="text-xs">Competitive Rating</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="font-mono text-3xl font-bold tracking-tight text-foreground">
                    {stats.codeforces ? stats.codeforces.value : '—'}
                  </div>
                  <p className="text-xs text-muted-foreground">Current contest rating</p>
                </div>
                {stats.codeforces?.rank && (
                  <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-3 py-1.5 text-xs">
                    <span className="text-muted-foreground">Rank</span>
                    <span className="font-mono font-semibold capitalize text-foreground">
                      {stats.codeforces.rank}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* LeetCode Card */}
            <Card className="flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PlatformIcon platform="leetcode" size="md" />
                    <CardTitle className="text-sm font-semibold">LeetCode</CardTitle>
                  </div>
                  {handles.leetcode && (
                    <a
                      href={`https://leetcode.com/${handles.leetcode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title="Open LeetCode Profile"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                <CardDescription className="text-xs">Algorithms Solved</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="font-mono text-3xl font-bold tracking-tight text-foreground">
                    {stats.leetcode ? stats.leetcode.value : '—'}
                  </div>
                  <p className="text-xs text-muted-foreground">Total problems completed</p>
                </div>
                {stats.leetcode?.byDifficulty && (
                  <div className="grid grid-cols-3 gap-1 rounded-lg border border-border/50 bg-muted/30 p-1 text-center text-[10px]">
                    <div>
                      <span className="text-emerald-400 font-semibold block">
                        {stats.leetcode.byDifficulty.find((d) => d.difficulty === 'Easy')?.count ?? 0}
                      </span>
                      <span className="text-muted-foreground">Easy</span>
                    </div>
                    <div>
                      <span className="text-amber-400 font-semibold block">
                        {stats.leetcode.byDifficulty.find((d) => d.difficulty === 'Medium')?.count ?? 0}
                      </span>
                      <span className="text-muted-foreground">Med</span>
                    </div>
                    <div>
                      <span className="text-rose-400 font-semibold block">
                        {stats.leetcode.byDifficulty.find((d) => d.difficulty === 'Hard')?.count ?? 0}
                      </span>
                      <span className="text-muted-foreground">Hard</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Ad / Sponsor Banner */}
          <div className="flex justify-center py-2">
            <AdBanner />
          </div>

          {/* Footer Card */}
          <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-border bg-card/30 p-4 text-center sm:flex-row sm:text-left">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-foreground">Unified Developer Analytics</p>
              <p className="text-[11px] text-muted-foreground">
                statmux multiplexes time-series metrics from GitHub, Codeforces, and LeetCode.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Get your free stats card
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
