const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? ''
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ?? ''
const rawAppUrl =
  (import.meta.env.VITE_APP_URL as string | undefined)?.trim() || window.location.origin
const appUrl = rawAppUrl.replace(/\/+$/, '')

export const env = {
  supabaseUrl,
  supabaseAnonKey,
  appUrl,
}

const isSupabaseUrl =
  /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(supabaseUrl) ||
  /^http:\/\/(localhost|127\.0\.0\.1):\d+$/i.test(supabaseUrl)

export const isSupabaseConfigured = isSupabaseUrl && supabaseAnonKey.length > 40
