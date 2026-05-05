import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const status = searchParams.get('status')

    let query = getSupabaseAdmin()!
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })

    if (id) {
      query = query.eq('id', id)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Admin orders fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { order_id, status, tracking_number, estimated_delivery } = body

    if (!order_id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    const updates: Record<string, string | Date> = {}

    if (status) {
      const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }
      updates.status = status
      if (status === 'shipped') updates.shipped_at = new Date().toISOString()
      if (status === 'delivered') updates.delivered_at = new Date().toISOString()
    }

    if (tracking_number !== undefined) updates.tracking_number = tracking_number
    if (estimated_delivery !== undefined) updates.estimated_delivery = estimated_delivery

    const { error } = await getSupabaseAdmin()!
      .from('orders')
      .update(updates)
      .eq('id', order_id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin order update error:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    const { error } = await getSupabaseAdmin()!
      .from('orders')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin order delete error:', error)
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
  }
}
