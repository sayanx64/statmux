'use client'

import { useState, useEffect } from 'react'
import { Monitor, Moon, Sun, AlertTriangle, Loader2, Check, UserCheck, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input, Label } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/theme-provider'
import { useAuth } from '@/components/auth-provider'
import { deleteStats, getDigestSubscription, putDigestSubscription, getProfile, putProfile } from '@/lib/api'
import { cn } from '@/lib/utils'

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
        checked ? 'bg-success' : 'bg-muted-foreground/30',
      )}
    >
      <span
        className={cn(
          'inline-block h-5 w-5 transform rounded-full bg-background shadow-sm transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}

const themeOptions = [
  { value: 'light' as const, label: 'Light', icon: Sun },
  { value: 'dark' as const, label: 'Dark', icon: Moon },
]

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()

  const [displayName, setDisplayName] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [nameSaved, setNameSaved] = useState(false)

  const [prefs, setPrefs] = useState({
    weeklyDigest: true,
    syncAlerts: true,
    productUpdates: false,
    autoSync: true,
  })
  const [savedKey, setSavedKey] = useState<string | null>(null)

  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Load preferences and profile details from backend & localStorage on mount
  useEffect(() => {
    // 1. Load local preferences
    try {
      const saved = localStorage.getItem('statmux_user_prefs')
      if (saved) {
        const parsed = JSON.parse(saved)
        setPrefs((p) => ({ ...p, ...parsed }))
      }
    } catch (e) {
      console.log('Could not load localStorage preferences:', e)
    }

    // 2. Load weekly digest backend subscription
    getDigestSubscription()
      .then((res) => {
        setPrefs((p) => ({ ...p, weeklyDigest: res.subscribed }))
      })
      .catch((e) => console.log('Could not load digest subscription:', e.message))

    // 3. Load profile for display name
    getProfile()
      .then((p) => {
        if (p?.display_name) {
          setDisplayName(p.display_name)
        } else if (user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.user_metadata?.user_name) {
          setDisplayName(user.user_metadata.display_name || user.user_metadata.full_name || user.user_metadata.user_name)
        }
      })
      .catch((e) => console.log('Could not load profile:', e.message))
  }, [user])

  function showSavedToast(key: string) {
    setSavedKey(key)
    setTimeout(() => setSavedKey((k) => (k === key ? null : k)), 2000)
  }

  function set(key: keyof typeof prefs, value: boolean) {
    setPrefs((p) => {
      const updated = { ...p, [key]: value }
      try {
        localStorage.setItem(
          'statmux_user_prefs',
          JSON.stringify({
            syncAlerts: updated.syncAlerts,
            productUpdates: updated.productUpdates,
            autoSync: updated.autoSync,
          }),
        )
      } catch {}
      return updated
    })
    showSavedToast(key)
  }

  async function handleToggleDigest(checked: boolean) {
    set('weeklyDigest', checked)
    try {
      await putDigestSubscription(checked)
      showSavedToast('weeklyDigest')
    } catch (e: any) {
      console.error('Failed to update digest subscription:', e)
      set('weeklyDigest', !checked)
    }
  }

  async function handleSaveDisplayName(e?: React.FormEvent) {
    if (e) e.preventDefault()
    setSavingName(true)
    setNameSaved(false)
    try {
      await putProfile({ display_name: displayName })
      setNameSaved(true)
      setTimeout(() => setNameSaved(false), 2500)
    } catch (err: any) {
      console.error('Failed to save display name:', err)
    } finally {
      setSavingName(false)
    }
  }

  async function handleDeleteData() {
    setDeleting(true)
    setStatusMessage(null)
    try {
      await deleteStats()
      setStatusMessage({ type: 'success', text: 'All synced analytics data has been permanently deleted.' })
      setConfirming(false)
      setTimeout(() => setStatusMessage(null), 5000)
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to delete synced data.' })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose how statmux looks on this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid max-w-md grid-cols-2 gap-3">
            {themeOptions.map((opt) => {
              const Icon = opt.icon
              const active = theme === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(e) => setTheme(opt.value, e)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border p-4 text-left transition-all',
                    active
                      ? 'border-success/50 bg-success/8 ring-1 ring-success/30'
                      : 'border-border hover:bg-accent',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg',
                      active ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="text-sm font-medium text-foreground">{opt.label}</span>
                </button>
              )
            })}
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Monitor className="h-3.5 w-3.5" />
            Your preference is saved to this browser.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Basic details for your authenticated statmux account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveDisplayName} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="displayName">Display name</Label>
                  {nameSaved && (
                    <span className="flex items-center gap-1 text-xs text-success animate-in fade-in duration-200">
                      <Check className="h-3.5 w-3.5" />
                      Saved
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Satoshi Nakamoto or your handle"
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    disabled={savingName}
                    className="shrink-0"
                  >
                    {savingName ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save'}
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Visible on your public profile cards and weekly digest emails.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email">Email</Label>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Shield className="h-3 w-3 text-emerald-400" />
                    Verified Auth
                  </span>
                </div>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  readOnly
                  className="bg-muted/40 text-muted-foreground cursor-not-allowed"
                />
                <p className="text-[11px] text-muted-foreground">
                  Your primary authentication address.
                </p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Decide what statmux should notify you about.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {[
            { key: 'weeklyDigest' as const, title: 'Weekly digest', desc: 'A summary of your progress every Monday.' },
            { key: 'syncAlerts' as const, title: 'Sync alerts', desc: 'Notify me when a platform fails to sync.' },
            { key: 'productUpdates' as const, title: 'Product updates', desc: 'News about new statmux features.' },
          ].map((row) => (
            <div key={row.key} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
              <div className="pr-4">
                <p className="text-sm font-medium text-foreground">{row.title}</p>
                <p className="text-xs text-muted-foreground">{row.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                {savedKey === row.key && (
                  <span className="flex items-center gap-1 text-xs text-success animate-in fade-in duration-200">
                    <Check className="h-3.5 w-3.5" />
                    Saved
                  </span>
                )}
                <Toggle
                  checked={prefs[row.key]}
                  onChange={(v) => {
                    if (row.key === 'weeklyDigest') {
                      handleToggleDigest(v)
                    } else {
                      set(row.key, v)
                    }
                  }}
                  label={row.title}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sync preferences</CardTitle>
          <CardDescription>Control how statmux keeps your data fresh.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="pr-4">
              <p className="text-sm font-medium text-foreground">Automatic sync</p>
              <p className="text-xs text-muted-foreground">Refresh all platforms every 6 hours.</p>
            </div>
            <div className="flex items-center gap-2">
              {savedKey === 'autoSync' && (
                <span className="flex items-center gap-1 text-xs text-success animate-in fade-in duration-200">
                  <Check className="h-3.5 w-3.5" />
                  Saved
                </span>
              )}
              <Toggle checked={prefs.autoSync} onChange={(v) => set('autoSync', v)} label="Automatic sync" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>Irreversible actions for your account data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {statusMessage && (
            <div
              className={cn(
                'flex items-center gap-2.5 rounded-lg border p-3 text-sm',
                statusMessage.type === 'success'
                  ? 'border-success/30 bg-success/10 text-success'
                  : 'border-destructive/30 bg-destructive/10 text-destructive',
              )}
            >
              {statusMessage.type === 'success' ? (
                <Check className="h-4 w-4 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {!confirming ? (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-destructive/40 bg-destructive/8 px-4 text-sm font-medium text-destructive transition-colors hover:bg-destructive/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50"
            >
              Delete all synced data
            </button>
          ) : (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Are you absolutely sure?</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    This action cannot be undone. All your historical snapshot metric data across GitHub, Codeforces, and LeetCode will be permanently erased. Your saved platform handles will remain untouched.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleDeleteData}
                  disabled={deleting}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-destructive px-3.5 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting data...
                    </>
                  ) : (
                    'Yes, delete all synced data'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  disabled={deleting}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-3.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
