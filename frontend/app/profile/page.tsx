'use client'

import { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check, FolderGit2, Swords, Code2, Loader2, Save, AlertCircle, Share2, Copy, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input, Label } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { getProfile, putProfile, uploadAvatar, type Profile } from '@/lib/api'
import { useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/supabase'

const EMPTY: Profile = {
  user_id: '',
  github_username: null,
  codeforces_handle: null,
  leetcode_username: null,
  updated_at: '',
}

type FormState = {
  githubUsername: string
  codeforcesHandle: string
  leetcodeUsername: string
}

const fields = [
  {
    key: 'githubUsername' as keyof FormState,
    apiKey: 'github_username' as keyof Profile,
    label: 'GitHub username',
    placeholder: 'e.g. your-github-handle',
    icon: FolderGit2,
    hint: 'Used for stars, repos, and contribution data.',
  },
  {
    key: 'codeforcesHandle' as keyof FormState,
    apiKey: 'codeforces_handle' as keyof Profile,
    label: 'Codeforces handle',
    placeholder: 'e.g. your_cf_handle',
    icon: Swords,
    hint: 'Used for rating history and contest results.',
  },
  {
    key: 'leetcodeUsername' as keyof FormState,
    apiKey: 'leetcode_username' as keyof Profile,
    label: 'LeetCode username',
    placeholder: 'e.g. your-lc-username',
    icon: Code2,
    hint: 'Used for solved counts and submission stats.',
  },
]

function profileToForm(p: Profile | null): FormState {
  return {
    githubUsername: p?.github_username ?? '',
    codeforcesHandle: p?.codeforces_handle ?? '',
    leetcodeUsername: p?.leetcode_username ?? '',
  }
}

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState<FormState>({ githubUsername: '', codeforcesHandle: '', leetcodeUsername: '' })
  const [fetching, setFetching] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)
  const [compareTarget, setCompareTarget] = useState('')

  const email = user?.email ?? ''
  const initials = email ? email.slice(0, 2).toUpperCase() : '??'
  const avatarUrl = user?.user_metadata?.avatar_url

  function handleCopyPublicLink() {
    const username = form.githubUsername.trim()
    if (!username) return
    const url = `${window.location.origin}/u/${encodeURIComponent(username)}`
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  function handleCompare(e: React.FormEvent) {
    e.preventDefault()
    const target = compareTarget.trim()
    const current = form.githubUsername.trim()
    if (!target || !current) return
    router.push(`/compare/${encodeURIComponent(current)}/vs/${encodeURIComponent(target)}`)
  }

  // Load profile from backend on mount
  useEffect(() => {
    getProfile()
      .then((p) => setForm(profileToForm(p)))
      .catch((e) => setError(e.message))
      .finally(() => setFetching(false))
  }, [])

  async function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    setAvatarError(null)

    try {
      // 1. Read file to image
      const img = new Image()
      img.src = URL.createObjectURL(file)
      await new Promise((res, rej) => {
        img.onload = res
        img.onerror = rej
      })

      // 2. Resize via canvas (max 500x500)
      const MAX = 500
      let { width, height } = img
      if (width > height && width > MAX) {
        height *= MAX / width
        width = MAX
      } else if (height > MAX) {
        width *= MAX / height
        height = MAX
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas not supported')
      
      ctx.drawImage(img, 0, 0, width, height)
      const base64 = canvas.toDataURL('image/webp', 0.8)

      // 3. Upload to backend
      const { url } = await uploadAvatar(base64)

      // 4. Update Supabase Auth metadata
      await supabase.auth.updateUser({ data: { avatar_url: url } })
      
      // Force reload to reflect updated token/metadata across components
      window.location.reload()
      
    } catch (err: any) {
      setAvatarError(err.message || 'Failed to upload avatar')
      setUploadingAvatar(false)
    }
  }

  const completeness = useMemo(() => {
    const values = Object.values(form)
    const filled = values.filter((v) => v.trim().length > 0).length
    return Math.round((filled / values.length) * 100)
  }, [form])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError(null)

    try {
      await putProfile({
        github_username: form.githubUsername.trim() || undefined,
        codeforces_handle: form.codeforcesHandle.trim() || undefined,
        leetcode_username: form.leetcodeUsername.trim() || undefined,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        
        {/* Avatar Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile Picture</CardTitle>
            <CardDescription>
              Upload a custom avatar. It will automatically be compressed and resized to save space.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-xl font-semibold text-primary-foreground shadow-sm">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="avatar-upload"
                className={`inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-foreground ${uploadingAvatar ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {uploadingAvatar ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                ) : 'Change picture'}
              </Label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarSelect}
                disabled={uploadingAvatar}
              />
              {avatarError && <span className="text-xs text-destructive">{avatarError}</span>}
            </div>
          </CardContent>
        </Card>

        {/* Connected Accounts Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Connected accounts</CardTitle>
            <CardDescription>
              Add your handles so statmux can aggregate stats from each platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {fetching ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-6">
                {fields.map((f) => {
                  const Icon = f.icon
                  const value = form[f.key]
                  return (
                    <div key={f.key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={f.key}>{f.label}</Label>
                        {value.trim() ? (
                          <Badge variant="success">
                            <Check className="h-3 w-3" /> Connected
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not set</Badge>
                        )}
                      </div>
                      <div className="relative">
                        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id={f.key}
                          value={value}
                          placeholder={f.placeholder}
                          className="pl-9"
                          onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">{f.hint}</p>
                    </div>
                  )
                })}

                {error && (
                  <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="flex items-center gap-3 border-t border-border pt-5">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {saving ? 'Saving…' : 'Save profile'}
                  </button>
                  {saved ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
                      <Check className="h-4 w-4" /> Profile saved
                    </span>
                  ) : null}
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {/* Public Share Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Share2 className="h-4 w-4 text-emerald-400" />
                Public profile
              </CardTitle>
              <Badge variant="outline" className="text-[10px] uppercase font-mono">
                Shareable
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Anyone with this link can view your verified stats and Code Health score.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {form.githubUsername.trim() ? (
              <>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-mono text-muted-foreground overflow-hidden">
                    <span className="truncate">/u/{form.githubUsername.trim()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyPublicLink}
                      className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          Copied link!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy public link
                        </>
                      )}
                    </button>
                    <a
                      href={`/u/${encodeURIComponent(form.githubUsername.trim())}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                      title="View public profile in new tab"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>

                {/* Compare With Developer Input */}
                <div className="border-t border-border/60 pt-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                    <Swords className="h-3.5 w-3.5 text-emerald-400" />
                    Compare with developer
                  </div>
                  <form onSubmit={handleCompare} className="flex items-center gap-2">
                    <Input
                      value={compareTarget}
                      onChange={(e) => setCompareTarget(e.target.value)}
                      placeholder="e.g. tourist"
                      className="h-8 text-xs font-mono"
                    />
                    <button
                      type="submit"
                      disabled={!compareTarget.trim()}
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
                    >
                      Compare
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                Set your GitHub username on the left to activate your public share and comparison links.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile completeness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end justify-between">
              <span className="font-mono text-3xl font-semibold text-foreground">{completeness}%</span>
              <span className="text-sm text-muted-foreground">
                {Object.values(form).filter((v) => v.trim()).length} of 3 linked
              </span>
            </div>
            <Progress value={completeness} accent={completeness === 100 ? 'success' : 'info'} />
            <p className="text-sm text-muted-foreground">
              {completeness === 100
                ? 'All platforms linked — you are getting the full picture.'
                : 'Link every platform to unlock complete analytics.'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {fields.map((f) => {
              const Icon = f.icon
              const connected = form[f.key].trim().length > 0
              return (
                <div key={f.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      {f.label.replace(' username', '').replace(' handle', '')}
                    </span>
                  </div>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${connected ? 'bg-success' : 'bg-muted-foreground/40'}`}
                    aria-label={connected ? 'Connected' : 'Not connected'}
                  />
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
