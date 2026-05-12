import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { verifyMoolreWebhook } from '@/lib/moolre'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const secret = process.env.MOOLRE_SECRET
    if (!secret) {
      return NextResponse.json({ error: 'Not configured' }, { status: 500 })
    }

    if (!verifyMoolreWebhook(body, secret)) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
    }

    // Moolre webhook payload usually has data nested or flat depending on version
    // The documentation shows data object with txstatus
    const data = body.data || body
    const txStatus = data.txstatus
    const externalref = data.externalref
    const transactionid = data.transactionid

    if (!externalref) {
      return NextResponse.json({ error: 'Missing externalref' }, { status: 400 })
    }

    // Extract real order ID (INT-XXXXXX) from potential suffixed ref (INT-XXXXXX-TIMESTAMP)
    const parts = externalref.split('-')
    const realOrderId = parts.length >= 2 ? `${parts[0]}-${parts[1]}` : externalref

    if (txStatus === 1) {
      await getSupabaseAdmin()!
        .from('orders')
        .update({
          payment_reference: transactionid?.toString() || externalref,
          status: 'paid',
          payment_status: 'paid',
        })
        .eq('id', realOrderId)

      console.log(`[WEBHOOK] Order ${realOrderId} paid via Moolre`)
    } else if (txStatus === 2) {
       console.log(`[WEBHOOK] Order ${realOrderId} failed via Moolre`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Moolre webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
