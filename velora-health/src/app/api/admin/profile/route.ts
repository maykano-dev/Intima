import { NextResponse, NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { isSupabaseConfigured } from '@/lib/supabase'
import { mockGetSession } from '@/lib/mock-auth'

export async function GET(request: NextRequest) {
  try {
    if (isSupabaseConfigured()) {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() { return request.cookies.getAll() },
            setAll() {},
          },
        }
      )

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return NextResponse.json({ user: null }, { status: 401 })

      const admin = getSupabaseAdmin()!
      if (!admin) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })
      const { data: profile, error } = await admin
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (error) throw error
      return NextResponse.json({ user: session.user, profile })
    }

    const session = mockGetSession().data.session
    if (!session) return NextResponse.json({ user: null }, { status: 401 })

    return NextResponse.json({
      user: session.user,
      profile: { role: 'user', full_name: session.user.user_metadata?.full_name || 'Dev User' },
    })
  } catch (error) {
    console.error('Admin profile error:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}
