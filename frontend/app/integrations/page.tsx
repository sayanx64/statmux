'use client'

import { useEffect, useState } from 'react'
import { Check, ExternalLink, Clock, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PlatformIcon } from '@/components/platform-icon'
import { getProfile, type Profile, type SourceName } from '@/lib/api'

type PlatformConfig = {
  key: SourceName
  label: string
  description: string
  getHandle: (p: Profile) => string | null
}

const PLATFORMS: PlatformConfig[] = [
  {
    key: 'github',
    label: 'GitHub',
    description: 'Repositories, stars, followers, and contribution graph.',
    getHandle: (p) => p.github_username,
  },
  {
    key: 'codeforces',
    label: 'Codeforces',
    description: 'Rating history, contest results, and problems solved.',
    getHandle: (p) => p.codeforces_handle,
  },
  {
    key: 'leetcode',
    label: 'LeetCode',
    description: 'Solved problems, difficulty breakdown, and submissions.',
    getHandle: (p) => p.leetcode_username,
  },
]

const planned = [
  { name: 'GitLab', detail: 'Merge requests and repository activity' },
  { name: 'HackerRank', detail: 'Skill badges, certifications, and contest rank' },
  { name: 'AtCoder', detail: 'Rating history and contest submissions' },
]

export default function IntegrationsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const connected = PLATFORMS.filter((p) => profile && p.getHandle(profile))
  const connectedCount = connected.length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Connected', value: loading ? '—' : String(connectedCount), accent: 'text-success' },
          { label: 'Planned', value: '3', accent: 'text-muted-foreground' },
          { label: 'API health', value: '100%', accent: 'text-success' },
        ].map((s) => (
          <Card key={s.label} className="p-5">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className={`mt-2 font-mono text-2xl font-semibold ${s.accent}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active integrations</CardTitle>
          <CardDescription>Platforms actively syncing data into statmux.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : connectedCount === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              No platforms connected yet. Add your handles in <strong>Profile</strong>.
            </p>
          ) : (
            PLATFORMS.map((p) => {
              const handle = profile ? p.getHandle(profile) : null
              if (!handle) return null
              return (
                <div
                  key={p.key}
                  className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <PlatformIcon platform={p.key} size="lg" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{p.label}</p>
                        <Badge variant="success">
                          <Check className="h-3 w-3" /> Connected
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{p.description}</p>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">@{handle}</p>
                    </div>
                  </div>
                  <a
                    href={
                      p.key === 'github'
                        ? `https://github.com/${handle}`
                        : p.key === 'codeforces'
                        ? `https://codeforces.com/profile/${handle}`
                        : `https://leetcode.com/${handle}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center justify-center gap-1.5 self-start rounded-lg border border-border bg-background px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:self-auto"
                  >
                    View profile
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )
            })
          )}

          {/* Disconnected platforms */}
          {!loading && connectedCount < 3 && (
            <div className="space-y-2 pt-1">
              {PLATFORMS.filter((p) => !(profile && p.getHandle(profile))).map((p) => (
                <div
                  key={p.key}
                  className="flex items-center gap-4 rounded-xl border border-dashed border-border p-4 opacity-60"
                >
                  <PlatformIcon platform={p.key} size="lg" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{p.label}</p>
                    <p className="text-xs text-muted-foreground">Not connected — add handle in Profile</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Planned integrations</CardTitle>
          <CardDescription>Additional platforms scheduled for future releases of statmux.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {planned.map((a) => (
            <div
              key={a.name}
              className="flex flex-col justify-between gap-3 rounded-xl border border-dashed border-border p-4"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">{a.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{a.detail}</p>
              </div>
              <div className="inline-flex items-center gap-1.5 self-start rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <Clock className="h-3 w-3" />
                Coming in future release
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
