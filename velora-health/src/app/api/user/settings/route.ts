import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { getSupabase } from '@/lib/supabase'
import { sanitizeInput } from '@/lib/utils'

async function getUserId(): Promise<string | null> {
  const supabase = getSupabase()
  const { data } = await supabase.auth.getSession()
  return data.session?.user?.id || null
}

export async function GET() {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data, error } = await getSupabaseAdmin()
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(null, { status: 404 })
      }
      throw error
    }

    return NextResponse.json(data)
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

    const updates: Record<string, string | boolean> = {}
    if (full_name !== undefined) updates.full_name = sanitizeInput(full_name)
    if (phone !== undefined) updates.phone = sanitizeInput(phone)
    if (email_notifications !== undefined) updates.email_notifications = email_notifications

    const { data, error } = await getSupabaseAdmin()
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
