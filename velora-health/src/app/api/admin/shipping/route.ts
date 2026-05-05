import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('shipping_options')
      .select('*')
      .order('sort_order')

    if (error) throw error
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Admin shipping fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch shipping options' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, delivery_min_days, delivery_max_days, price_cny, is_active, sort_order } = body

    if (!name || !delivery_min_days || !delivery_max_days) {
      return NextResponse.json({ error: 'Name and delivery days required' }, { status: 400 })
    }

    const { data, error } = await getSupabaseAdmin()
      .from('shipping_options')
      .insert({
        name,
        description: description || '',
        delivery_min_days: parseInt(delivery_min_days),
        delivery_max_days: parseInt(delivery_max_days),
        price_cny: parseFloat(price_cny || '0'),
        is_active: is_active ?? true,
        sort_order: parseInt(sort_order || '0'),
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Admin shipping create error:', error)
    return NextResponse.json({ error: 'Failed to create shipping option' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, name, description, delivery_min_days, delivery_max_days, price_cny, is_active, sort_order } = body

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    const updates: Record<string, string | number | boolean> = {}
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    if (delivery_min_days !== undefined) updates.delivery_min_days = parseInt(delivery_min_days)
    if (delivery_max_days !== undefined) updates.delivery_max_days = parseInt(delivery_max_days)
    if (price_cny !== undefined) updates.price_cny = parseFloat(price_cny)
    if (is_active !== undefined) updates.is_active = is_active
    if (sort_order !== undefined) updates.sort_order = parseInt(sort_order)

    const { error } = await getSupabaseAdmin()
      .from('shipping_options')
      .update(updates)
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin shipping update error:', error)
    return NextResponse.json({ error: 'Failed to update shipping option' }, { status: 500 })
  }
}
