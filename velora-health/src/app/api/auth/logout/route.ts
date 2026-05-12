import { NextResponse } from 'next/server'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { mockSignOut } from '@/lib/mock-auth'

export async function POST() {
  try {
    if (isSupabaseConfigured()) {
      const { createClient } = await import('@/lib/supabase-server')
      const supabase = await createClient()
      await supabase.auth.signOut()
    }
    mockSignOut()
    
    const response = NextResponse.json({ success: true })
    
    // Explicitly expire the supabase auth cookie if it remains
    response.cookies.set('sb-access-token', '', { expires: new Date(0) })
    response.cookies.set('sb-refresh-token', '', { expires: new Date(0) })
    
    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
