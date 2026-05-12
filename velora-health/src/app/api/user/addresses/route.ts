import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { isSupabaseConfigured } from '@/lib/supabase'
import { mockGetSession } from '@/lib/mock-auth'
import { sanitizeInput } from '@/lib/utils'
import { createClient } from '@/lib/supabase-server'

async function getUserId(): Promise<string | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.error('getUserId: getUser error:', error.message)
        return null
      }
      return user?.id || null
    } catch (e) {
      console.error('getUserId: unexpected error:', e)
      return null
    }
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

    const { data, error } = await getSupabaseAdmin()!
      .from('customer_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Addresses fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { label, full_name, phone, address_line1, address_line2, city, is_default } = body

    if (!full_name || !phone || !address_line1) {
      return NextResponse.json({ error: 'Full name, phone, and address are required' }, { status: 400 })
    }

    if (is_default) {
      await getSupabaseAdmin()!
        .from('customer_addresses')
        .update({ is_default: false })
        .eq('user_id', userId)
    }

    const { data, error } = await getSupabaseAdmin()!
      .from('customer_addresses')
      .insert({
        user_id: userId,
        label: sanitizeInput(label || 'Home'),
        full_name: sanitizeInput(full_name),
        phone: sanitizeInput(phone),
        address_line1: sanitizeInput(address_line1),
        address_line2: sanitizeInput(address_line2 || ''),
        city: sanitizeInput(city || 'Accra'),
        is_default: is_default || false,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Address create error:', error)
    return NextResponse.json({ error: 'Failed to create address' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { id, label, full_name, phone, address_line1, address_line2, city, is_default } = body

    if (!id) {
      return NextResponse.json({ error: 'Address ID required' }, { status: 400 })
    }

    const updates: Record<string, string | boolean> = {}
    if (label !== undefined) updates.label = sanitizeInput(label)
    if (full_name !== undefined) updates.full_name = sanitizeInput(full_name)
    if (phone !== undefined) updates.phone = sanitizeInput(phone)
    if (address_line1 !== undefined) updates.address_line1 = sanitizeInput(address_line1)
    if (address_line2 !== undefined) updates.address_line2 = sanitizeInput(address_line2)
    if (city !== undefined) updates.city = sanitizeInput(city)
    if (is_default !== undefined) {
      if (is_default) {
        await getSupabaseAdmin()!
          .from('customer_addresses')
          .update({ is_default: false })
          .eq('user_id', userId)
      }
      updates.is_default = is_default
    }

    const { data, error } = await getSupabaseAdmin()!
      .from('customer_addresses')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Address update error:', error)
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Address ID required' }, { status: 400 })
    }

    const { error } = await getSupabaseAdmin()!
      .from('customer_addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Address delete error:', error)
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 })
  }
}
