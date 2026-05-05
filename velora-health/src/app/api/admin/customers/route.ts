import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  try {
    const { data: profiles, error: profilesError } = await getSupabaseAdmin()!
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) throw profilesError

    const { data: banned, error: bannedError } = await getSupabaseAdmin()!
      .from('banned_users')
      .select('user_id')

    if (bannedError) throw bannedError

    const bannedIds = new Set((banned || []).map((b: { user_id: string }) => b.user_id))

    const { data: orders, error: ordersError } = await getSupabaseAdmin()!
      .from('orders')
      .select('user_id, total')
      .not('user_id', 'is', null)

    if (ordersError) throw ordersError

    const orderStats: Record<string, { count: number; total: number }> = {}
    for (const o of orders || []) {
      if (!orderStats[o.user_id]) orderStats[o.user_id] = { count: 0, total: 0 }
      orderStats[o.user_id].count++
      orderStats[o.user_id].total += Number(o.total)
    }

    const customers = (profiles || []).map((p: Record<string, unknown>) => ({
      id: p.id,
      email: p.email || '',
      full_name: p.full_name || '',
      phone: p.phone || '',
      role: p.role || 'customer',
      created_at: p.created_at,
      total_orders: orderStats[p.id as string]?.count || 0,
      total_spent: orderStats[p.id as string]?.total || 0,
      is_banned: bannedIds.has(p.id as string),
    }))

    return NextResponse.json(customers)
  } catch (error) {
    console.error('Admin customers fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, user_id, reason, note } = body

    if (!user_id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    if (action === 'ban') {
      const { error } = await getSupabaseAdmin()!
        .from('banned_users')
        .insert({ user_id, reason: reason || '', banned_by: (await getSupabaseAdmin()!.auth.getSession()).data.session?.user?.id || null })

      if (error) {
        if (error.code === '23505') {
          return NextResponse.json({ error: 'User already banned' }, { status: 409 })
        }
        throw error
      }

      return NextResponse.json({ success: true })
    }

    if (action === 'note') {
      const { error } = await getSupabaseAdmin()!
        .from('customer_notes')
        .insert({ user_id, note, created_by: (await getSupabaseAdmin()!.auth.getSession()).data.session?.user?.id || null })

      if (error) throw error
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('Admin customer action error:', error)
    return NextResponse.json({ error: 'Failed to process action' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    await getSupabaseAdmin()!.from('customer_notes').delete().eq('user_id', userId)
    await getSupabaseAdmin()!.from('banned_users').delete().eq('user_id', userId)
    await getSupabaseAdmin()!.from('customer_addresses').delete().eq('user_id', userId)
    await getSupabaseAdmin()!.from('profiles').delete().eq('id', userId)

    const { error } = await getSupabaseAdmin()!.auth.admin.deleteUser(userId)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin customer delete error:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
