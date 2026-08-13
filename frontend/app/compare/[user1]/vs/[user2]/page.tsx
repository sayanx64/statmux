'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Trophy,
  Swords,
  ExternalLink,
  AlertCircle,
  ArrowUpRight,
  Layers,
  CheckCircle2,
  Minus,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PlatformIcon } from '@/components/platform-icon'
import { LoadingLogo } from '@/components/loading-logo'
import { relativeTime } from '@/lib/api'

interface ProfileData {
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

interface CompareResponse {
  user1: ProfileData
  user2: ProfileData
}

export default function ComparePage() {
  const params = useParams()
  const rawU1 = Array.isArray(params?.user1) ? params.user1[0] : params?.user1
  const rawU2 = Array.isArray(params?.user2) ? params.user2[0] : params?.user2

  const user1 = decodeURIComponent(rawU1 || '')
  const user2 = decodeURIComponent(rawU2 || '')

  const [data, setData] = useState<CompareResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user1 || !user2) {
      setError('Both usernames are required for comparison.')
      setLoading(false)
      return
    }

    if (user1.toLowerCase() === user2.toLowerCase()) {
      setError('Cannot compare a user with themselves. Please provide two distinct usernames.')
      setLoading(false)
      return
    }

    fetch(`/api/public/compare/${encodeURIComponent(user1)}/${encodeURIComponent(user2)}`)
      .then(async (res) => {
        const json = await res.json()
        if (!res.ok) {
          throw new Error(json.error || 'Failed to load comparison.')
        }
        return json as CompareResponse
      })
      .then((resData) => setData(resData))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [user1, user2])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <LoadingLogo size={80} />
        <p className="mt-4 font-mono text-sm text-muted-foreground">
          Comparing @{user1} vs @{user2}...
        </p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive">
            <AlertCircle className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Comparison Error</h1>
            <p className="text-sm text-muted-foreground">{error || 'Unable to load profile data.'}</p>
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

  const { user1: u1, user2: u2 } = data

  const u1Health = u1.codeHealth.total
  const u2Health = u2.codeHealth.total
  const overallWinner = u1Health > u2Health ? 'user1' : u2Health > u1Health ? 'user2' : 'tie'

  const gradeColors = {
    A: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    B: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    C: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    D: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
  }

  // Comparison helper
  function compareStat(v1: number | null | undefined, v2: number | null | undefined) {
    const num1 = v1 ?? -1
    const num2 = v2 ?? -1
    if (num1 === num2) return 'tie'
    return num1 > num2 ? 'user1' : 'user2'
  }

  const ghCompare = compareStat(u1.stats.github?.value, u2.stats.github?.value)
  const cfCompare = compareStat(u1.stats.codeforces?.value, u2.stats.codeforces?.value)
  const lcCompare = compareStat(u1.stats.leetcode?.value, u2.stats.leetcode?.value)

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-success/20 selection:text-foreground">
      {/* Top minimal header */}
      <header className="border-b border-border bg-card/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/login" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-mono font-bold text-sm">
              <Layers className="h-4 w-4 text-emerald-400" />
            </div>
            <span className="font-mono text-base font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
              statmux
            </span>
          </Link>
          <div className="flex items-center gap-2">
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

      {/* Main Container */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="space-y-8">
          {/* Header Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Swords className="h-3.5 w-3.5 text-emerald-400" />
              Developer Head-to-Head
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              @{u1.username} <span className="text-muted-foreground font-normal">vs</span> @{u2.username}
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Real-time analytics diff across GitHub repositories, Codeforces competitive rank, and LeetCode algorithmic progress.
            </p>
          </div>

          {/* 1. PROMINENT OVERALL CODE HEALTH COMPARISON HERO */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="text-center mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Overall Code Health Comparison
              </span>
            </div>

            <div className="grid gap-6 sm:grid-cols-11 sm:items-center">
              {/* User 1 Header */}
              <div className="flex flex-col items-center text-center sm:col-span-5 sm:items-start sm:text-left">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted text-lg font-bold text-foreground">
                    {u1.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={u1.avatar_url} alt={u1.display_name} className="h-full w-full object-cover" />
                    ) : (
                      u1.display_name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/u/${u1.username}`}
                        className="font-bold text-lg text-foreground hover:underline"
                      >
                        {u1.display_name}
                      </Link>
                      {overallWinner === 'user1' && (
                        <Badge variant="success" className="gap-1 text-[11px]">
                          <Trophy className="h-3 w-3" /> Winner
                        </Badge>
                      )}
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">@{u1.username}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <div className="font-mono text-3xl font-extrabold text-foreground sm:text-4xl">
                    {u1Health}
                    <span className="text-sm font-normal text-muted-foreground">/100</span>
                  </div>
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border font-mono text-base font-bold ${
                      gradeColors[u1.codeHealth.grade]
                    }`}
                  >
                    {u1.codeHealth.grade}
                  </div>
                </div>
              </div>

              {/* VS Divider */}
              <div className="flex flex-col items-center justify-center sm:col-span-1 py-2 sm:py-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted/60 font-mono text-xs font-bold text-muted-foreground shadow-sm">
                  VS
                </div>
              </div>

              {/* User 2 Header */}
              <div className="flex flex-col items-center text-center sm:col-span-5 sm:items-end sm:text-right">
                <div className="flex items-center gap-3 sm:flex-row-reverse">
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted text-lg font-bold text-foreground">
                    {u2.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={u2.avatar_url} alt={u2.display_name} className="h-full w-full object-cover" />
                    ) : (
                      u2.display_name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 sm:flex-row-reverse">
                      <Link
                        href={`/u/${u2.username}`}
                        className="font-bold text-lg text-foreground hover:underline"
                      >
                        {u2.display_name}
                      </Link>
                      {overallWinner === 'user2' && (
                        <Badge variant="success" className="gap-1 text-[11px]">
                          <Trophy className="h-3 w-3" /> Winner
                        </Badge>
                      )}
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">@{u2.username}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3 sm:flex-row-reverse">
                  <div className="font-mono text-3xl font-extrabold text-foreground sm:text-4xl">
                    {u2Health}
                    <span className="text-sm font-normal text-muted-foreground">/100</span>
                  </div>
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border font-mono text-base font-bold ${
                      gradeColors[u2.codeHealth.grade]
                    }`}
                  >
                    {u2.codeHealth.grade}
                  </div>
                </div>
              </div>
            </div>

            {/* Health Pillars Comparison Bars */}
            <div className="mt-8 space-y-3 border-t border-border/60 pt-6">
              {[
                { label: 'Consistency', v1: u1.codeHealth.scores.consistency, v2: u2.codeHealth.scores.consistency },
                { label: 'Difficulty', v1: u1.codeHealth.scores.problemDifficulty, v2: u2.codeHealth.scores.problemDifficulty },
                { label: 'Repo Quality', v1: u1.codeHealth.scores.repoQuality, v2: u2.codeHealth.scores.repoQuality },
                { label: 'Contest Activity', v1: u1.codeHealth.scores.contestActivity, v2: u2.codeHealth.scores.contestActivity },
              ].map((p) => {
                const winner = compareStat(p.v1, p.v2)
                return (
                  <div key={p.label} className="grid grid-cols-12 items-center gap-2 text-xs">
                    {/* User 1 Value */}
                    <div className="col-span-3 text-right font-mono font-medium">
                      <span className={winner === 'user1' ? 'text-emerald-400 font-semibold' : 'text-muted-foreground'}>
                        {p.v1}%
                      </span>
                    </div>

                    {/* Dual Ratio Bar */}
                    <div className="col-span-6 space-y-1">
                      <div className="text-center font-medium text-[11px] text-muted-foreground">
                        {p.label}
                      </div>
                      <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full ${winner === 'user1' ? 'bg-emerald-500' : 'bg-primary/70'} transition-all`}
                          style={{ width: `${(p.v1 / (p.v1 + p.v2 || 1)) * 100}%` }}
                        />
                        <div
                          className={`h-full ${winner === 'user2' ? 'bg-emerald-500' : 'bg-muted-foreground/40'} transition-all`}
                          style={{ width: `${(p.v2 / (p.v1 + p.v2 || 1)) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* User 2 Value */}
                    <div className="col-span-3 text-left font-mono font-medium">
                      <span className={winner === 'user2' ? 'text-emerald-400 font-semibold' : 'text-muted-foreground'}>
                        {p.v2}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 2. PLATFORM-BY-PLATFORM DETAILED DIFF CARDS */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* GitHub Diff */}
            <Card className="flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PlatformIcon platform="github" size="md" />
                    <CardTitle className="text-sm font-semibold">GitHub</CardTitle>
                  </div>
                  <Badge
                    variant={ghCompare === 'user1' ? 'success' : ghCompare === 'user2' ? 'info' : 'outline'}
                    className="text-[10px]"
                  >
                    {ghCompare === 'user1' ? `@${u1.username} +` : ghCompare === 'user2' ? `@${u2.username} +` : 'Equal'}
                  </Badge>
                </div>
                <CardDescription className="text-xs">Repositories & Code Volume</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* User 1 Row */}
                <div className={`rounded-xl border p-3 ${ghCompare === 'user1' ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-border'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground truncate max-w-[120px]">@{u1.username}</span>
                    <span className="font-mono text-lg font-bold text-foreground">
                      {u1.stats.github ? u1.stats.github.value : '—'}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Followers</span>
                    <span className="font-mono">{u1.stats.github?.followers ?? '—'}</span>
                  </div>
                </div>

                {/* User 2 Row */}
                <div className={`rounded-xl border p-3 ${ghCompare === 'user2' ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-border'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground truncate max-w-[120px]">@{u2.username}</span>
                    <span className="font-mono text-lg font-bold text-foreground">
                      {u2.stats.github ? u2.stats.github.value : '—'}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Followers</span>
                    <span className="font-mono">{u2.stats.github?.followers ?? '—'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Codeforces Diff */}
            <Card className="flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PlatformIcon platform="codeforces" size="md" />
                    <CardTitle className="text-sm font-semibold">Codeforces</CardTitle>
                  </div>
                  <Badge
                    variant={cfCompare === 'user1' ? 'success' : cfCompare === 'user2' ? 'info' : 'outline'}
                    className="text-[10px]"
                  >
                    {cfCompare === 'user1' ? `@${u1.username} +` : cfCompare === 'user2' ? `@${u2.username} +` : 'Equal'}
                  </Badge>
                </div>
                <CardDescription className="text-xs">Competitive Rating</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* User 1 Row */}
                <div className={`rounded-xl border p-3 ${cfCompare === 'user1' ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-border'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground truncate max-w-[120px]">@{u1.username}</span>
                    <span className="font-mono text-lg font-bold text-foreground">
                      {u1.stats.codeforces ? u1.stats.codeforces.value : '—'}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Rank</span>
                    <span className="font-mono capitalize">{u1.stats.codeforces?.rank ?? '—'}</span>
                  </div>
                </div>

                {/* User 2 Row */}
                <div className={`rounded-xl border p-3 ${cfCompare === 'user2' ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-border'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground truncate max-w-[120px]">@{u2.username}</span>
                    <span className="font-mono text-lg font-bold text-foreground">
                      {u2.stats.codeforces ? u2.stats.codeforces.value : '—'}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Rank</span>
                    <span className="font-mono capitalize">{u2.stats.codeforces?.rank ?? '—'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* LeetCode Diff */}
            <Card className="flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PlatformIcon platform="leetcode" size="md" />
                    <CardTitle className="text-sm font-semibold">LeetCode</CardTitle>
                  </div>
                  <Badge
                    variant={lcCompare === 'user1' ? 'success' : lcCompare === 'user2' ? 'info' : 'outline'}
                    className="text-[10px]"
                  >
                    {lcCompare === 'user1' ? `@${u1.username} +` : lcCompare === 'user2' ? `@${u2.username} +` : 'Equal'}
                  </Badge>
                </div>
                <CardDescription className="text-xs">Problems Solved</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* User 1 Row */}
                <div className={`rounded-xl border p-3 ${lcCompare === 'user1' ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-border'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground truncate max-w-[120px]">@{u1.username}</span>
                    <span className="font-mono text-lg font-bold text-foreground">
                      {u1.stats.leetcode ? u1.stats.leetcode.value : '—'}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>E: {u1.stats.leetcode?.byDifficulty?.find((d) => d.difficulty === 'Easy')?.count ?? 0}</span>
                    <span>M: {u1.stats.leetcode?.byDifficulty?.find((d) => d.difficulty === 'Medium')?.count ?? 0}</span>
                    <span>H: {u1.stats.leetcode?.byDifficulty?.find((d) => d.difficulty === 'Hard')?.count ?? 0}</span>
                  </div>
                </div>

                {/* User 2 Row */}
                <div className={`rounded-xl border p-3 ${lcCompare === 'user2' ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-border'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground truncate max-w-[120px]">@{u2.username}</span>
                    <span className="font-mono text-lg font-bold text-foreground">
                      {u2.stats.leetcode ? u2.stats.leetcode.value : '—'}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>E: {u2.stats.leetcode?.byDifficulty?.find((d) => d.difficulty === 'Easy')?.count ?? 0}</span>
                    <span>M: {u2.stats.leetcode?.byDifficulty?.find((d) => d.difficulty === 'Medium')?.count ?? 0}</span>
                    <span>H: {u2.stats.leetcode?.byDifficulty?.find((d) => d.difficulty === 'Hard')?.count ?? 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer Note */}
          <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-border bg-card/30 p-4 text-center sm:flex-row sm:text-left">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-foreground">Shareable Developer Comparison</p>
              <p className="text-[11px] text-muted-foreground">
                Metrics synced directly from official platform APIs and multiplexed by statmux.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Create your profile
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
