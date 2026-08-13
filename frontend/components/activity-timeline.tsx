import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PlatformIcon } from '@/components/platform-icon'
import { type PlatformKey } from '@/lib/data'
import { relativeTime } from '@/lib/api'

export interface ActivityEvent {
  id: string
  platform: PlatformKey
  title: string
  link?: string
  timestamp: string
}

export function ActivityTimeline({ events }: { events: ActivityEvent[] }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-5">
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity found.</p>
          ) : events.map((item, i) => (
            <li key={item.id} className="relative flex gap-3.5">
              {i !== events.length - 1 ? (
                <span className="absolute left-[19px] top-11 h-[calc(100%-8px)] w-px bg-border" aria-hidden="true" />
              ) : null}
              <PlatformIcon platform={item.platform} size="sm" className="mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium leading-snug text-foreground">
                    {item.link ? (
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {item.title}
                      </a>
                    ) : item.title}
                  </p>
                  <span className="shrink-0 text-xs text-muted-foreground">{relativeTime(item.timestamp)}</span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}
