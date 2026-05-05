import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = parseInt(searchParams.get('period') || '30')
    const monthly = searchParams.get('monthly')

    if (monthly === 'true') {
      const { data, error } = await getSupabaseAdmin()
        .from('monthly_stats')
        .select('*')

      if (error) throw error
      return NextResponse.json(data || [])
    }

    const since = new Date()
    since.setDate(since.getDate() - period)

    const { data, error } = await getSupabaseAdmin()
      .from('sales_summary')
      .select('*')
      .gte('sale_date', since.toISOString().split('T')[0])

    if (error) throw error
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Admin sales fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch sales data' }, { status: 500 })
  }
}
