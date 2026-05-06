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

    // Generate a new signup link for the existing (unconfirmed) user
    const tempPassword = crypto.randomUUID().slice(0, 16) + 'Aa1!'
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email,
      password: tempPassword,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
      }
    })

    if (error) {
      // If they are already confirmed, we can't send a signup link
      if (error.message.includes('already registered')) {
        return NextResponse.json({ error: 'User is already verified. Please sign in.' }, { status: 400 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Send the custom email via AhaSend
    const { error: emailError } = await sendEmail({
      to: email,
      subject: 'Confirmation Link - Intima Wellness',
      html: emailTemplates.confirmation('there', data.properties.action_link)
    })

    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Resend error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
