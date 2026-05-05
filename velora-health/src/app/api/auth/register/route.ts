import { NextResponse } from 'next/server'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { mockSignUp } from '@/lib/mock-auth'

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    if (isSupabaseConfigured()) {
      const supabase = getSupabase()!
      if (!supabase) throw new Error('Supabase not configured')
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name || '' } },
      })
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json(
        { message: 'Account created. Check your email for confirmation.', user: data.user },
        { status: 201 }
      )
    }

    const result = mockSignUp(email, password, name)
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 })
    return NextResponse.json(
      { message: 'Account created successfully.', user: result.data.user },
      { status: 201 }
    )
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
