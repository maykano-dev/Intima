import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const approved = searchParams.get('approved')
    const productId = searchParams.get('product_id')

    let query = getSupabaseAdmin()!
      .from('reviews')
      .select('*, products(name, slug)')
      .order('created_at', { ascending: false })

    if (approved === 'true') query = query.eq('approved', true)
    else if (approved === 'false') query = query.eq('approved', false)
    if (productId) query = query.eq('product_id', productId)

    const { data, error } = await query

    if (error) throw error
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Admin reviews fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, approved, admin_reply } = body

    if (!id) {
      return NextResponse.json({ error: 'Review ID required' }, { status: 400 })
    }

    const updates: any = {}
    if (approved !== undefined) updates.approved = approved
    if (admin_reply !== undefined) {
      updates.admin_reply = admin_reply
      updates.replied_at = new Date().toISOString()
      updates.approved = true // Auto-approve if replied? Maybe.
    }

    const { data, error } = await getSupabaseAdmin()!
      .from('reviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Admin review update error:', error)
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Review ID required' }, { status: 400 })
    }

    const { error } = await getSupabaseAdmin()!
      .from('reviews')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin review delete error:', error)
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}
