import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  try {
    const { data, error } = await getSupabaseAdmin()!
      .from('platform_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ exchange_rate_cny_to_ghs: 0.52 })
      }
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Admin rates fetch error:', error)
    return NextResponse.json({ exchange_rate_cny_to_ghs: 0.52 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { exchange_rate_cny_to_ghs } = body

    if (!exchange_rate_cny_to_ghs || exchange_rate_cny_to_ghs <= 0) {
      return NextResponse.json({ error: 'Invalid exchange rate' }, { status: 400 })
    }

    const { data: existing } = await getSupabaseAdmin()!
      .from('platform_settings')
      .select('id')
      .limit(1)
      .single()

    if (existing) {
      const { error } = await getSupabaseAdmin()!
        .from('platform_settings')
        .update({ exchange_rate_cny_to_ghs })
        .eq('id', existing.id)

      if (error) throw error
    } else {
      const { error } = await getSupabaseAdmin()!
        .from('platform_settings')
        .insert({ exchange_rate_cny_to_ghs })

      if (error) throw error
    }

    return NextResponse.json({ success: true, exchange_rate_cny_to_ghs })
  } catch (error) {
    console.error('Admin rates update error:', error)
    return NextResponse.json({ error: 'Failed to update rate' }, { status: 500 })
  }
}
