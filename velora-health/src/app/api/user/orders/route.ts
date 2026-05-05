import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { getSupabase } from '@/lib/supabase'

async function getUserId(): Promise<string | null> {
  const supabase = getSupabase()
  const { data } = await supabase.auth.getSession()
  return data.session?.user?.id || null
}

async function getUserEmail(): Promise<string | null> {
  const supabase = getSupabase()
  const { data } = await supabase.auth.getSession()
  return data.session?.user?.email || null
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
      const { data: order, error } = await getSupabaseAdmin()
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

    let query = getSupabaseAdmin()
      .from('orders')
      .select('id, customer_name, total, status, payment_status, created_at, tracking_number, estimated_delivery')
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    } else if (userEmail) {
      query = query.eq('customer_email', userEmail)
    }

    const { data, error } = await query

    if (error) throw error
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('User orders fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
