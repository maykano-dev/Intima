import { NextResponse, NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { isSupabaseConfigured } from '@/lib/supabase'
import { mockSignIn } from '@/lib/mock-auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    if (isSupabaseConfigured()) {
      const response = NextResponse.json({ success: true })

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() { return request.cookies.getAll() },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options)
              )
            },
          },
        }
      )

      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return NextResponse.json({ error: error.message }, { status: 401 })

      // Update response body with data, but KEEP the response object to preserve cookies
      const finalResponse = NextResponse.json(
        { user: data.user, session: data.session },
        { status: 200 }
      )
      
      // Copy cookies from the interim response to the final response
      response.cookies.getAll().forEach(cookie => {
        finalResponse.cookies.set(cookie.name, cookie.value, {
          path: '/',
          ...cookie
        })
      })

      return finalResponse
    }

    const result = mockSignIn(email, password)
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 401 })
    return NextResponse.json({ user: result.data.user, session: result.data.session })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
