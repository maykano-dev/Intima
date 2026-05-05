import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function POST() {
  try {
    const supabase = getSupabase()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
