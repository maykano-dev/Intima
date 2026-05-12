import { NextResponse } from 'next/server'
import { checkMoolreStatus } from '@/lib/moolre'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const order_id = searchParams.get('order_id')

    if (!order_id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    console.log(`[POLL] Checking Moolre status for order: ${order_id}`)
    
    // Extract real order ID (INT-XXXXXX) from potential suffixed ref (INT-XXXXXX-TIMESTAMP)
    const parts = order_id.split('-')
    const realOrderId = parts.length >= 2 ? `${parts[0]}-${parts[1]}` : order_id

    const result = await checkMoolreStatus(order_id)
    console.log(`[POLL] Moolre result for ${order_id}:`, JSON.stringify(result))

    // Moolre status check response structure according to docs:
    // result.data contains txstatus (1=Successful, 0=Pending, 2=Failed)
    const data = result.data as Record<string, unknown>
    const txStatus = data?.txstatus !== undefined ? data.txstatus : result.status
    const transactionId = data?.transactionid || data?.transaction_id || order_id

    // Check for success (txstatus === 1)
    if (txStatus === 1) {
      console.log(`[POLL] Success detected for ${realOrderId}. Updating DB.`)
      const { error: updateError } = await getSupabaseAdmin()!
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'paid',
          payment_reference: transactionId.toString()
        })
        .eq('id', realOrderId)

      if (updateError) {
        console.error('[POLL] Error updating order status:', updateError)
      }

      return NextResponse.json({
        status: 'paid',
        message: 'Payment confirmed successfully.'
      })
    }

    // Check for failure (txstatus === 2)
    if (txStatus === 2) {
      console.log(`[POLL] Failure detected for ${realOrderId}.`)
      return NextResponse.json({
        status: 'failed',
        message: result.message || data?.message || 'Payment failed or was declined.'
      })
    }

    // Still pending (txstatus === 0)
    let pendingMessage = result.message || 'Payment is still pending. Please complete the prompt on your phone.'
    if (pendingMessage.toLowerCase().includes('not found')) {
      pendingMessage = 'Waiting for payment confirmation... Please check your phone for the prompt.'
    }

    return NextResponse.json({
      status: 'pending',
      message: pendingMessage
    })
  } catch (error) {
    console.error('[POLL] Moolre status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    )
  }
}
