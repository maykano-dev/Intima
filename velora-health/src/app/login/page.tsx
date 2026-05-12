'use client'; // Re-triggering HMR to resolve useRef reference issue

import { useState, useEffect, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { toast } from 'sonner'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'
  const isAdminLogin = redirectTo.startsWith('/admin')
  const accessError = searchParams.get('error')
  const isVerified = searchParams.get('verified') === 'true'
  const isRegistered = searchParams.get('registered') === 'true'
  const toastShown = useRef(false)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(accessError === 'admin_required' ? 'Admin access denied. You do not have admin privileges.' : '')
  const [loading, setLoading] = useState(false)
  const [unconfirmedEmail, setUnconfirmedEmail] = useState('')
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  useEffect(() => {
    if (toastShown.current) return

    if (isVerified) {
      toast.success('Email confirmed! You can now sign in.', {
        duration: 5000,
        position: 'top-center',
      })
      toastShown.current = true
    }
    if (isRegistered) {
      toast.success('Account created successfully! You can now sign in.', {
        duration: 5000,
        position: 'top-center',
      })
      toastShown.current = true
    }
  }, [isVerified, isRegistered])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setUnconfirmedEmail('')
    setResent(false)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (res.ok) {
        const profileRes = await fetch('/api/admin/profile')
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          if (profileData.profile?.role === 'admin') {
            router.push('/admin')
            router.refresh()
            return
          }
        }
        if (isAdminLogin) {
          setError('This account does not have admin access.')
          return
        }
        router.push(redirectTo)
        router.refresh()
      } else {
        const data = await res.json()
        const msg = data.error || ''
        if (msg.toLowerCase().includes('email not confirmed') || msg.toLowerCase().includes('email not verified')) {
          setUnconfirmedEmail(email)
        } else {
          setError(msg)
        }
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (!unconfirmedEmail) return
    setResending(true)
    setResent(false)
    try {
      const res = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: unconfirmedEmail }),
      })
      if (res.ok) {
        setResent(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to resend confirmation')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setResending(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-sm text-primary hover:underline">
          Forgot Password?
        </Link>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      {unconfirmedEmail && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-sm space-y-2">
          <p className="text-amber-500 font-bold">Email not verified</p>
          <p className="text-[#8A7F76]">Please contact support to verify your account as email confirmation is currently unavailable.</p>
        </div>
      )}
      <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
        {isAdminLogin ? 'Admin Sign In' : 'Sign In'}
      </Button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 relative">
      <Link href="/" className="absolute top-6 left-4 sm:left-6 flex items-center gap-1.5 text-xs sm:text-sm text-[#8A7F76] hover:text-[#BFA075] transition-colors no-underline">
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Home
      </Link>
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-center font-serif text-3xl tracking-[0.3em] text-[#BFA075] no-underline mb-8 hover:opacity-80 transition-opacity">
          INTIMA
        </Link>
        <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading...</div>}>
          <AdminAwareLogin />
        </Suspense>
      </div>
    </div>
  )
}

function AdminAwareLogin() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'
  const isAdminLogin = redirectTo.startsWith('/admin')

  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-2">
        {isAdminLogin ? 'Admin Login' : 'Sign In'}
      </h1>
      <p className="text-muted text-center text-sm mb-8">
        {isAdminLogin
          ? 'Authorized administrators only'
          : 'Sign in to your Intima account'}
      </p>

      <LoginForm />

      {!isAdminLogin && (
        <p className="text-center text-sm text-muted mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary hover:underline">Create one</Link>
        </p>
      )}
    </>
  )
}
