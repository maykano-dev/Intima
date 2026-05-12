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

      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        console.warn('Admin profile: Not authenticated', authError?.message)
        return NextResponse.json({ user: null }, { status: 401 })
      }

      const admin = getSupabaseAdmin()!
      if (!admin) {
        console.error('Admin profile: Supabase Admin client not configured')
        return NextResponse.json({ error: 'DB not configured' }, { status: 500 })
      }
      
      // 1. Get the profile
      const { data: profile } = await admin
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // 2. Check if the user is in the admins table
      const { data: adminRecord } = await admin
        .from('admins')
        .select('user_id')
        .eq('user_id', user.id)
        .single()

      const role = adminRecord ? 'admin' : (profile?.role || 'customer')
      
      return NextResponse.json({ 
        user, 
        profile: { ...profile, role } 
      })
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
