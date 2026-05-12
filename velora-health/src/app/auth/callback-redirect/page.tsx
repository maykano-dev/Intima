'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = getSupabase()

  useEffect(() => {
    const handleAuth = async () => {
      if (!supabase) return

      // 1. Check for 'code' (Server-side/PKCE flow)
      const code = searchParams.get('code')
      const next = searchParams.get('next') || '/update-password'

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          router.push('/auth/auth-code-error')
          return
        }
        router.push(next)
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        router.push(next)
        return
      }

      // 3. Fallback: Wait a moment in case it's still processing
      const timeout = setTimeout(() => {
        console.log('Auth Callback: No code or session found after timeout.')
        router.push('/auth/auth-code-error')
      }, 5000)

      return () => clearTimeout(timeout)
    }

    handleAuth()
  }, [router, searchParams, supabase])

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#0A1410]">
      <div className="text-center space-y-6">
        <div className="w-16 h-16 border-4 border-[#BFA075] border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-xl font-medium text-[#F2E8DF]">Finalizing authentication...</h2>
        <p className="text-[#8A7F76] text-sm italic">Verifying your secure link, please wait.</p>
      </div>
    </div>
  )
}
