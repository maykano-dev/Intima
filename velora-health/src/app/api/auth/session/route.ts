import { NextResponse } from 'next/server'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { mockGetSession } from '@/lib/mock-auth'

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const { createClient } = await import('@/lib/supabase-server')
      const supabase = await createClient()
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      return NextResponse.json({ user: data.session?.user || null })
    }

    const result = mockGetSession()
    return NextResponse.json({ user: result.data.session?.user || null })
  } catch {
    return NextResponse.json({ user: null })
  }
}
