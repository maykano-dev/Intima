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

    // Enrich order_items with product_link from products table
    const orders = (data || []) as Record<string, unknown>[]
    const allProductIds = new Set<string>()
    for (const order of orders) {
      const items = (order.order_items || []) as Record<string, unknown>[]
      for (const item of items) {
        if (item.product_id) allProductIds.add(item.product_id as string)
      }
    }

    if (allProductIds.size > 0) {
      const { data: products } = await getSupabaseAdmin()!
        .from('products')
        .select('id, product_link, images')
        .in('id', Array.from(allProductIds))
      const linkMap: Record<string, string> = {}
      const imageMap: Record<string, string> = {}
      if (products) {
        for (const p of products) {
          if (p.product_link) linkMap[p.id as string] = p.product_link as string
          const imgs = p.images as string[] | undefined
          if (imgs && imgs.length > 0) imageMap[p.id as string] = imgs[0]
        }
      }
      for (const order of orders) {
        const items = (order.order_items || []) as Record<string, unknown>[]
        for (const item of items) {
          const record = item as Record<string, unknown>
          record.product_link = linkMap[item.product_id as string] || null
          record.product_image = imageMap[item.product_id as string] || null
        }
      }
    }

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Admin orders fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { order_id, status, tracking_number, estimated_delivery, shipping_cost_ghs, shipping_method } = body

    if (!order_id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    const updates: Record<string, string | Date | number> = {}

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
    if (shipping_cost_ghs !== undefined) updates.shipping_cost_ghs = Number(shipping_cost_ghs)
    if (shipping_method !== undefined) updates.shipping_method = shipping_method

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

    // Delete order items first to avoid foreign key constraints
    const { error: itemsError } = await getSupabaseAdmin()!
      .from('order_items')
      .delete()
      .eq('order_id', id)

    if (itemsError) throw itemsError

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
