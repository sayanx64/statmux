import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/components/auth-provider'
import { DashboardShell } from '@/components/dashboard-shell'
import './globals.css'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'statmux — unified coding analytics, multiplexed',
  description:
    'unified coding analytics, multiplexed. Track your GitHub, Codeforces, and LeetCode performance in one place.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/icon.svg',
    shortcut: '/icon.svg',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbfbfc' },
    { media: '(prefers-color-scheme: dark)', color: '#1b1c20' },
  ],
}

const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('statmux-theme');
    var theme = stored || 'dark';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})();
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} bg-background`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <AuthProvider>
            <DashboardShell>{children}</DashboardShell>
          </AuthProvider>
        </ThemeProvider>
        <noscript>
          <iframe
            src="https://ad-swap.web.app/frame.html?site=ezwb30EtErrO29y5MfOa"
            style={{ border: 0, width: '300px', height: '130px', maxWidth: '100%' }}
            loading="lazy"
            sandbox="allow-scripts allow-popups"
            title="Ad"
          />
        </noscript>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
