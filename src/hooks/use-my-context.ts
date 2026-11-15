import { useQuery } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'
import type { MyContext } from '@/types/app'

import { useAuth } from './use-auth'

function parseMyContext(raw: unknown): MyContext | null {
  if (!raw || typeof raw !== 'object') return null
  const candidate = raw as Partial<MyContext>
  if (!candidate.profile?.id || !candidate.establishment?.id) return null
  return {
    profile: candidate.profile,
    establishment: candidate.establishment,
    permissions: Array.isArray(candidate.permissions) ? candidate.permissions : [],
  }
}

export function useMyContext() {
  const { session, status } = useAuth()

  return useQuery({
    queryKey: ['my-context', session?.user.id],
    enabled: status === 'authenticated' && Boolean(session),
    staleTime: 5 * 60_000,
    retry: 1,
    queryFn: async (): Promise<MyContext | null> => {
      const { data, error } = await supabase().rpc('my_context')
      if (error) throw error
      return parseMyContext(data)
    },
  })
}
