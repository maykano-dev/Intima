import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase-server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { isSupabaseConfigured } from '@/lib/supabase'
import { mockGetSession } from '@/lib/mock-auth'
import { sanitizeInput } from '@/lib/utils'

async function getUserId(): Promise<string | null> {
  if (isSupabaseConfigured()) {
    const supabase = await createServerClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session?.user?.id || null
  }
  const session = mockGetSession().data.session
  return session?.user?.id || null
}

export async function GET() {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (isSupabaseConfigured()) {
      const admin = getSupabaseAdmin()!
      if (admin) {
        const { data, error } = await admin
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
        if (error && error.code !== 'PGRST116') throw error
        if (!data) {
          const { data: newProfile } = await admin
            .from('profiles')
            .upsert({ id: userId, full_name: '', phone: '', email: '' })
            .select()
            .single()
          if (newProfile) return NextResponse.json(newProfile)
        }
        if (data) return NextResponse.json(data)
      }
    }

    const session = mockGetSession().data.session
    return NextResponse.json({
      id: userId,
      full_name: session?.user?.user_metadata?.full_name || '',
      email: session?.user?.email || '',
      phone: '',
      email_notifications: true,
    })
  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { full_name, phone, email_notifications } = body

    if (isSupabaseConfigured()) {
      const admin = getSupabaseAdmin()!
      if (admin) {
        const updates: Record<string, string | boolean> = {}
        if (full_name !== undefined) updates.full_name = sanitizeInput(full_name)
        if (phone !== undefined) updates.phone = sanitizeInput(phone)
        if (email_notifications !== undefined) updates.email_notifications = email_notifications
        
        let data, error;
        try {
          const res = await admin.from('profiles').upsert({ id: userId, ...updates }).select().single()
          data = res.data
          error = res.error
        } catch (err) {
          const errorMsg = (err as { message?: string })?.message || ''
          const errorCode = (err as { code?: string })?.code || ''
          if (errorMsg.includes('email_notifications') || errorCode === '42703') {
            console.warn('email_notifications column missing, retrying without it...')
            delete updates.email_notifications
            const res = await admin.from('profiles').upsert({ id: userId, ...updates }).select().single()
            data = res.data
            error = res.error
          } else {
            throw err
          }
        }
        
        if (error) throw error
        return NextResponse.json(data)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
