import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { isSupabaseConfigured } from '@/lib/supabase'
import { mockGetSession } from '@/lib/mock-auth'
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
  return mockGetSession().data.session?.user?.id || null
}

async function getUserEmail(): Promise<string | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.error('getUserEmail: getUser error:', error.message)
        return null
      }
      return user?.email || null
    } catch (e) {
      console.error('getUserEmail: unexpected error:', e)
      return null
    }
  }
  return mockGetSession().data.session?.user?.email || null
}

export async function GET(request: Request) {
  try {
    const userId = await getUserId()
    const userEmail = await getUserEmail()
    if (!userId && !userEmail) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      const { data: order, error } = await getSupabaseAdmin()!
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }
        throw error
      }

      if (order.user_id && order.user_id !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }

      return NextResponse.json(order)
    }

    let data, error;
    try {
      let query = getSupabaseAdmin()!
        .from('orders')
        .select('id, customer_name, customer_phone, customer_email, total, status, payment_status, created_at, tracking_number, estimated_delivery')
        .order('created_at', { ascending: false })

      if (userId) {
        query = query.eq('user_id', userId)
      } else if (userEmail) {
        query = query.eq('customer_email', userEmail)
      }

      const res = await query
      data = res.data
      error = res.error
    } catch (err) {
      console.warn('User orders fetch by user_id failed, falling back to email:', err)
      // Fallback: try fetching by email only if userId failed
      const { data: emailData, error: emailError } = await getSupabaseAdmin()!
        .from('orders')
        .select('id, customer_name, customer_phone, customer_email, total, status, payment_status, created_at, tracking_number, estimated_delivery')
        .eq('customer_email', userEmail)
        .order('created_at', { ascending: false })
      
      data = emailData
      error = emailError
    }

    if (error) {
      console.error('User orders DB Error:', error)
      throw error
    }
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('User orders API Crash:', error)
    return NextResponse.json({ error: 'Failed to fetch orders', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await getUserId()
    const userEmail = await getUserEmail()
    if (!userId && !userEmail) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { order_id, shipping_method, shipping_payment_reference, payment_reference } = body

    if (!order_id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    const { data: order, error: fetchError } = await getSupabaseAdmin()!
      .from('orders')
      .select('user_id, customer_email, status')
      .eq('id', order_id)
      .single()

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Auth check
    const isOwner = (userId && order.user_id === userId) || (userEmail && order.customer_email === userEmail)
    if (!isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const updates: Record<string, unknown> = {}
    
    if (shipping_method) {
      if (['pending', 'paid'].includes(order.status)) {
        updates.shipping_method = shipping_method
      } else {
        return NextResponse.json({ error: 'Cannot change shipping method after processing' }, { status: 400 })
      }
    }

    if (shipping_payment_reference) {
      updates.shipping_payment_reference = shipping_payment_reference
      updates.shipping_payment_status = 'paid'
    }

    if (payment_reference) {
      updates.payment_reference = payment_reference
      updates.payment_status = 'paid'
      // If it was pending, mark as paid status too
      updates.status = 'paid'
    }

    const { error: updateError } = await getSupabaseAdmin()!
      .from('orders')
      .update(updates)
      .eq('id', order_id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('User order update error:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getUserId()
    const userEmail = await getUserEmail()
    if (!userId && !userEmail) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    const { data: order, error: fetchError } = await getSupabaseAdmin()!
      .from('orders')
      .select('user_id, customer_email, status, payment_status')
      .eq('id', id)
      .single()

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Auth check
    const isOwner = (userId && order.user_id === userId) || (userEmail && order.customer_email === userEmail)
    if (!isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Status check
    if (order.payment_status === 'paid') {
      return NextResponse.json({ error: 'Cannot delete order that has been paid' }, { status: 400 })
    }

    // Delete order items first to avoid foreign key constraints
    const { error: itemsError } = await getSupabaseAdmin()!
      .from('order_items')
      .delete()
      .eq('order_id', id)

    if (itemsError) throw itemsError

    const { error: deleteError } = await getSupabaseAdmin()!
      .from('orders')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('User order delete error:', error)
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
  }
}
