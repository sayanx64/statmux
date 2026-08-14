'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

type AuthContextValue = {
  session: Session | null
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Hydrate initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      
      // CRITICAL: If the URL has a Supabase auth hash, do NOT stop loading yet.
      // Wait for the onAuthStateChange listener to extract the token, otherwise
      // our dashboard shell will redirect to /login and destroy the hash!
      if (!window.location.hash.includes('access_token=')) {
        setLoading(false)
      }
    })

    // Listen for auth state changes (login, logout, token refresh)
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setLoading(false)

      // Fire onboarding silently on every sign-in (email + GitHub OAuth).
      // The backend is idempotent — it checks welcome_sent before sending.
      if (event === 'SIGNED_IN' && session?.access_token) {
        fetch(`${API_URL}/api/profile/onboarding`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
        }).catch(() => {
          // Silent fail — non-critical background operation
        })
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
