import { NextResponse } from 'next/server'
import { getSupabase, getAdminSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { sendEmail, emailTemplates } from '@/lib/email'

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
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    
    // Use Supabase's native resend method
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback`
      }
    })

    if (error) {
      console.error('Resend error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Resend error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
