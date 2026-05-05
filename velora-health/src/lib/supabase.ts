import { createClient, type SupabaseClient } from '@supabase/supabase-js'

function getEnv(name: string): string | null {
  const val = process.env[name]
  if (!val || val.includes('placeholder')) return null
  return val
}

let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!_client) {
    const url = getEnv('NEXT_PUBLIC_SUPABASE_URL')
    const key = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    if (!url || !key) {
      throw new Error('Supabase not configured — check your .env.local')
    }
    _client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { 'x-application-name': 'intima' } },
    })
  }
  return _client
}
