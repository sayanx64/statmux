import { FolderGit2, Swords, Code2 } from 'lucide-react'
import type { PlatformKey } from '@/lib/data'
import { cn } from '@/lib/utils'

const config: Record<
  PlatformKey,
  { Icon: typeof FolderGit2; className: string }
> = {
  github: { Icon: FolderGit2, className: 'bg-chart-3/12 text-foreground' },
  codeforces: { Icon: Swords, className: 'bg-info/12 text-info' },
  leetcode: { Icon: Code2, className: 'bg-warning/15 text-warning' },
}

export function PlatformIcon({
  platform,
  size = 'md',
  className,
}: {
  platform: PlatformKey
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const { Icon, className: tone } = config[platform]
  const dims = size === 'lg' ? 'h-11 w-11' : size === 'sm' ? 'h-8 w-8' : 'h-10 w-10'
  const icon = size === 'lg' ? 'h-5 w-5' : size === 'sm' ? 'h-4 w-4' : 'h-[18px] w-[18px]'
  return (
    <span className={cn('inline-flex items-center justify-center rounded-xl', dims, tone, className)}>
      <Icon className={icon} />
    </span>
  )
}
