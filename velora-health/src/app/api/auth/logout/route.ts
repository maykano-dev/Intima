import { NextResponse } from 'next/server'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { mockSignOut } from '@/lib/mock-auth'

export async function POST() {
  try {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase()!
      if (supabase) await supabase.auth.signOut()
    }
    mockSignOut()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
