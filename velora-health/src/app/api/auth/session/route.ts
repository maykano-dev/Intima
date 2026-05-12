import { NextResponse } from 'next/server'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { mockGetSession } from '@/lib/mock-auth'

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const { createClient } = await import('@/lib/supabase-server')
      const { getSupabaseAdmin } = await import('@/lib/supabase-admin')
      const supabase = await createClient()
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      
      const user = data.session?.user || null
      if (!user) return NextResponse.json({ user: null })

      // Check for admin status
      const admin = getSupabaseAdmin()!
      const { data: adminRecord } = await admin
        .from('admins')
        .select('user_id')
        .eq('user_id', user.id)
        .single()

      const { data: profile } = await admin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const role = adminRecord ? 'admin' : (profile?.role || 'customer')

      return NextResponse.json({ 
        user: { ...user, role } 
      })
    }

    const result = mockGetSession()
    return NextResponse.json({ 
      user: result.data.session?.user ? { ...result.data.session.user, role: 'customer' } : null 
    })
  } catch {
    return NextResponse.json({ user: null })
  }
}
