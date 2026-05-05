import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { generateOrderId, sanitizeInput } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customer, items, total } = body

    if (!customer || !items || !total) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const orderId = generateOrderId()

    const { data: order, error: orderError } = await getSupabaseAdmin()
      .from('orders')
      .insert({
        id: orderId,
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

    const { error: itemsError } = await getSupabaseAdmin()
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

    const { error } = await getSupabaseAdmin()
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
