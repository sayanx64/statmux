'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  type Theme,
  type ThemeTriggerOrigin,
  runThemeBubbleTransition,
} from '@/lib/theme-transition'

export type { Theme, ThemeTriggerOrigin }

type ThemeContextValue = {
  theme: Theme
  toggleTheme: (origin?: ThemeTriggerOrigin) => void
  setTheme: (theme: Theme, origin?: ThemeTriggerOrigin) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const STORAGE_KEY = 'statmux-theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? 'dark'
    setThemeState(stored)
  }, [])

  const applyTheme = useCallback((next: Theme) => {
    const root = document.documentElement
    root.classList.add('transition-theme')
    if (next === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem(STORAGE_KEY, next)
    window.setTimeout(() => root.classList.remove('transition-theme'), 320)
  }, [])

  const setTheme = useCallback(
    (next: Theme, origin?: ThemeTriggerOrigin) => {
      if (next === theme) return

      if (origin) {
        runThemeBubbleTransition(next, origin, (resolvedTheme) => {
          setThemeState(resolvedTheme)
          applyTheme(resolvedTheme)
        })
      } else {
        setThemeState(next)
        applyTheme(next)
      }
    },
    [theme, applyTheme],
  )

  const toggleTheme = useCallback(
    (origin?: ThemeTriggerOrigin) => {
      const next = theme === 'dark' ? 'light' : 'dark'
      setTheme(next, origin)
    },
    [theme, setTheme],
  )

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}
