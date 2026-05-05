import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { mockGetSession } from '@/lib/mock-auth'
import { sanitizeInput } from '@/lib/utils'

async function getUserId(): Promise<string | null> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabase()!
    if (!supabase) return null
    const { data } = await supabase.auth.getSession()
    return data.session?.user?.id || null
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
        const { data, error } = await admin.from('profiles').update(updates).eq('id', userId).select().single()
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
