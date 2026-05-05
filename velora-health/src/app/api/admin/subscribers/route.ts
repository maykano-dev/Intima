import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('subscribers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Admin subscribers fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Subscriber ID required' }, { status: 400 })
    }

    const { error } = await getSupabaseAdmin()
      .from('subscribers')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin subscriber delete error:', error)
    return NextResponse.json({ error: 'Failed to delete subscriber' }, { status: 500 })
  }
}
