import { NextResponse } from 'next/server'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { mockSignIn } from '@/lib/mock-auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    if (isSupabaseConfigured()) {
      const supabase = getSupabase()!
      if (!supabase) throw new Error('Supabase not configured')
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return NextResponse.json({ error: error.message }, { status: 401 })
      return NextResponse.json({ user: data.user, session: data.session })
    }

    const result = mockSignIn(email, password)
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 401 })
    return NextResponse.json({ user: result.data.user, session: result.data.session })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
