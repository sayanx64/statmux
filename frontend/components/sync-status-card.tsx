import { CheckCircle2, Clock, Database, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function SyncStatusCard({ lastSyncLabel }: { lastSyncLabel: string }) {
  const rows = [
    { icon: Zap, label: 'Sync status', value: 'Healthy' },
    { icon: Clock, label: 'Last sync', value: lastSyncLabel },
    { icon: Database, label: 'Data sources', value: '3 connected' },
  ]

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Sync Status</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex items-center gap-3 rounded-xl border border-success/20 bg-success/8 p-4">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <div>
            <p className="text-sm font-medium text-foreground">All platforms up to date</p>
            <p className="text-xs text-muted-foreground">GitHub · Codeforces · LeetCode</p>
          </div>
        </div>
        <dl className="mt-4 space-y-3">
          {rows.map((r) => {
            const Icon = r.icon
            return (
              <div key={r.label} className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="h-4 w-4" />
                  {r.label}
                </dt>
                <dd className="text-sm font-medium text-foreground">{r.value}</dd>
              </div>
            )
          })}
        </dl>
      </CardContent>
    </Card>
  )
}
