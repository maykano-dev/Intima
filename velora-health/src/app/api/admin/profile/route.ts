import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { getSupabase } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = getSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const { data: profile, error } = await getSupabaseAdmin()
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (error) throw error

    return NextResponse.json({
      user: session.user,
      profile,
    })
  } catch (error) {
    console.error('Admin profile error:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}
