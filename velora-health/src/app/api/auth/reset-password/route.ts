import { NextResponse } from 'next/server'
import { getSupabase, getAdminSupabase, isSupabaseConfigured } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true })
    }

    const supabase = getSupabase()
    if (!supabase) throw new Error('Supabase not configured')

    // Get the origin for the redirect URL
    const requestUrl = new URL(request.url)
    const origin = requestUrl.origin
    const redirectTo = `${origin}/auth/callback-redirect?next=/update-password`

    // Trigger Supabase's built-in password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
