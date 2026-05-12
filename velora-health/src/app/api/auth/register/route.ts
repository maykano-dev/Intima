import { NextResponse } from 'next/server'
import { getAdminSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { mockSignUp } from '@/lib/mock-auth'
import { sendEmail, emailTemplates } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { name, email, phone, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }
    if (isSupabaseConfigured()) {
      console.log('Register: Using Supabase Auth (Admin Creation)')
      const supabase = getAdminSupabase()
      if (!supabase) throw new Error('Admin Supabase not configured')

      // 1. Create the user directly as confirmed
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { 
          full_name: name || '',
          phone: phone || ''
        }
      })

      if (error) {
        console.error('Register: Supabase Admin Error:', error.message)
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          return NextResponse.json({ error: 'User already exists. Please sign in.' }, { status: 400 })
        }
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      console.log('Register: Success (Auto-confirmed)!')

      // 2. Update the profile with the phone number (since the trigger might not handle it)
      if (phone) {
        console.log('Register: Updating profile with phone:', phone)
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ phone })
          .eq('id', data.user.id)
        
        if (profileError) {
          console.error('Register: Profile Update Error:', profileError.message)
          // We don't fail the whole registration if profile update fails, 
          // but we log it.
        }
      }

      return NextResponse.json(
        { message: 'Account created successfully.', user: data.user },
        { status: 201 }
      )
    }

    console.log('Register: Using Mock Auth (Config Missing)')

    const result = mockSignUp(email, password, name, phone)
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
