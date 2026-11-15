import type { Session } from '@supabase/supabase-js'
import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { supabase } from '@/lib/supabase'

type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

export interface AuthContextValue {
  session: Session | null
  status: AuthStatus
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  useEffect(() => {
    let active = true
    const client = supabase()

    client.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return
        setSession(data.session)
        setStatus(data.session ? 'authenticated' : 'anonymous')
      })
      .catch(() => {
        if (!active) return
        setStatus('anonymous')
      })

    const { data: listener } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setStatus(nextSession ? 'authenticated' : 'anonymous')
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      status,
      signOut: async () => {
        await supabase().auth.signOut()
      },
    }),
    [session, status],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
