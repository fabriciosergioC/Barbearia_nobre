import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/types/database'

import { env, isSupabaseConfigured } from './env'

export type AppSupabaseClient = SupabaseClient<Database>

let client: AppSupabaseClient | null = null

export function getSupabase(): AppSupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase não configurado. Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.',
    )
  }

  if (!client) {
    client = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  }

  return client
}

export const supabase = getSupabase
