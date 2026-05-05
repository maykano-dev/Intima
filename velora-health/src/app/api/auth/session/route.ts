import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return NextResponse.json({ user: data.session?.user || null })
  } catch {
    return NextResponse.json({ user: null })
  }
}
