import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { getPaystackSecretKey } from '@/lib/paystack'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-paystack-signature')

    const secret = getPaystackSecretKey()
    if (!secret) {
      return NextResponse.json({ error: 'Not configured' }, { status: 500 })
    }

    const expectedSignature = crypto
      .createHmac('sha512', secret)
      .update(body)
      .digest('hex')

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(body)

    // Handle successful charge
    if (event.event === 'charge.success') {
      const { reference, metadata } = event.data
      const orderId = metadata?.order_id

      if (orderId) {
        await getSupabaseAdmin()!
          .from('orders')
          .update({
            payment_reference: reference,
            status: 'paid',
            payment_status: 'paid',
          })
          .eq('id', orderId)

        // Fetch order for notification
        const { data: order } = await getSupabaseAdmin()!
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single()

        if (order) {
          // In production: send WhatsApp notification to admin
          console.log(`Order ${orderId} paid — notify admin`)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
