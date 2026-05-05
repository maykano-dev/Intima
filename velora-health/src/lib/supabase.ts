import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

function isConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  return url.startsWith('https://') && key.length > 20 && !key.includes('placeholder')
}

export function isSupabaseConfigured(): boolean {
  return isConfigured()
}

export function getSupabase(): SupabaseClient | null {
  if (!isConfigured()) return null
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { 'x-application-name': 'intima' } },
      }
    )
  }
  return _client
}
