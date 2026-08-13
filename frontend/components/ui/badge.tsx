import { cn } from '@/lib/utils'

type Variant = 'neutral' | 'success' | 'info' | 'warning' | 'destructive' | 'outline'

const variants: Record<Variant, string> = {
  neutral: 'bg-secondary text-secondary-foreground',
  success: 'bg-success/12 text-success',
  info: 'bg-info/12 text-info',
  warning: 'bg-warning/15 text-warning',
  destructive: 'bg-destructive/12 text-destructive',
  outline: 'border border-border text-muted-foreground',
}

export function Badge({
  className,
  variant = 'neutral',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium leading-5',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
