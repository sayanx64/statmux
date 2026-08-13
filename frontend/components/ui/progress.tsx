import { cn } from '@/lib/utils'

const accents: Record<string, string> = {
  success: 'bg-success',
  info: 'bg-info',
  warning: 'bg-warning',
  neutral: 'bg-primary',
}

export function Progress({
  value,
  accent = 'neutral',
  className,
}: {
  value: number
  accent?: 'success' | 'info' | 'warning' | 'neutral'
  className?: string
}) {
  return (
    <div
      className={cn('h-2 w-full overflow-hidden rounded-full bg-muted', className)}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-700 ease-out', accents[accent])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
