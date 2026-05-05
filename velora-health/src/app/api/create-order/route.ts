import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { getSupabase } from '@/lib/supabase'
import { generateOrderId, sanitizeInput } from '@/lib/utils'

async function getUserId(): Promise<string | null> {
  try {
    const supabase = getSupabase()!
    const { data } = await supabase.auth.getSession()
    return data.session?.user?.id || null
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customer, items, total, shipping_method, shipping_cost } = body

    if (!customer || !items || !total) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const userId = await getUserId()
    const orderId = generateOrderId()

    // Get exchange rate for shipping cost conversion
    let exchangeRate: number | null = null
    try {
      const { data: rateData } = await getSupabaseAdmin()!
        .from('platform_settings')
        .select('exchange_rate')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (rateData?.exchange_rate) exchangeRate = rateData.exchange_rate
    } catch {
      // ignore
    }

    const estimatedDelivery = shipping_method === 'sea'
      ? new Date(Date.now() + 49 * 86400000).toISOString().split('T')[0]
      : new Date(Date.now() + 13 * 86400000).toISOString().split('T')[0]

    const { data: order, error: orderError } = await getSupabaseAdmin()!
      .from('orders')
      .insert({
        id: orderId,
        user_id: userId,
        customer_name: sanitizeInput(customer.name),
        customer_email: sanitizeInput(customer.email),
        customer_phone: sanitizeInput(customer.phone),
        customer_address: sanitizeInput(customer.address),
        city: sanitizeInput(customer.city),
        notes: sanitizeInput(customer.notes || ''),
        total,
        status: 'pending',
        payment_status: 'pending',
        discreet_packaging: customer.discreet_packaging,
        estimated_delivery: estimatedDelivery,
        shipping_option_id: shipping_method,
        shipping_cost_cny: exchangeRate ? Math.round(shipping_cost * exchangeRate * 100) / 100 : null,
        shipping_cost_ghs: shipping_cost,
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Insert order items
    const orderItems = items.map(
      (item: { product_id: string; product_name: string; quantity: number; unit_price: number }) => ({
        order_id: orderId,
        product_id: item.product_id,
        product_name: sanitizeInput(item.product_name),
        quantity: item.quantity,
        unit_price: item.unit_price,
      })
    )

    const { error: itemsError } = await getSupabaseAdmin()!
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { order_id, payment_reference, status } = body

    if (!order_id) {
      return NextResponse.json(
        { error: 'Order ID required' },
        { status: 400 }
      )
    }

    const updateData: Record<string, string> = {}
    if (payment_reference) updateData.payment_reference = payment_reference
    if (status) {
      updateData.status = status
      updateData.payment_status = status === 'paid' ? 'paid' : 'pending'
    }

    const { error } = await getSupabaseAdmin()!
      .from('orders')
      .update(updateData)
      .eq('id', order_id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Order update error:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}
