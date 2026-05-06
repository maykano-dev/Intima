import { NextResponse } from 'next/server'
import { getAdminSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { mockSignUp } from '@/lib/mock-auth'
import { sendEmail, emailTemplates } from '@/lib/email'

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
      const supabase = getAdminSupabase()
      if (!supabase) throw new Error('Admin Supabase not configured')

      // 1. Generate the signup link (this also creates the user)
      const { data, error } = await supabase.auth.admin.generateLink({
        type: 'signup',
        email,
        password,
        options: { 
          data: { full_name: name || '' },
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
        }
      })

      if (error) {
        // Handle case where user already exists
        if (error.message.includes('already registered')) {
          return NextResponse.json({ error: 'User already exists' }, { status: 400 })
        }
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      // 2. Send the custom email via AhaSend
      const { error: emailError } = await sendEmail({
        to: email,
        subject: 'Welcome to Intima - Confirm Your Account',
        html: emailTemplates.confirmation(name || 'there', data.properties.action_link)
      })

      if (emailError) {
        console.error('Manual email send failed:', emailError)
        // We still return 201 because the user IS created in Supabase
        return NextResponse.json(
          { message: `Account created, but email failed: ${emailError}. Please check SMTP keys.`, user: data.user },
          { status: 201 }
        )
      }

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
