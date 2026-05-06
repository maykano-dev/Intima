import { NextResponse } from 'next/server'
import { getAdminSupabase, isSupabaseConfigured } from '@/lib/supabase'
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

    const supabase = getAdminSupabase()
    if (!supabase) throw new Error('Admin Supabase not configured')

    // Generate recovery link
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/update-password`
      }
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Send the custom email via AhaSend
    const { error: emailError } = await sendEmail({
      to: email,
      subject: 'Password Reset - Intima Wellness',
      html: emailTemplates.recovery(data.properties.action_link)
    })

    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
