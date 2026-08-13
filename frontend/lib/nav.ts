import {
  LayoutDashboard,
  User,
  BarChart3,
  RefreshCw,
  Plug,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  description: string
}

export const navItems: NavItem[] = [
  { href: '/', label: 'Overview', icon: LayoutDashboard, description: 'Your coding performance at a glance' },
  { href: '/profile', label: 'Profile', icon: User, description: 'Manage your connected handles' },
  { href: '/stats', label: 'Stats', icon: BarChart3, description: 'Per-platform metrics and trends' },
  { href: '/refresh', label: 'Refresh', icon: RefreshCw, description: 'Sync the latest data from each source' },
  { href: '/integrations', label: 'Integrations', icon: Plug, description: 'Connected platforms and data sources' },
  { href: '/settings', label: 'Settings', icon: Settings, description: 'Preferences and account settings' },
]
