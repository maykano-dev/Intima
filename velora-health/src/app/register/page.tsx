'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect')
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState('')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      if (res.ok) {
        setIsVerifying(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Registration failed')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResendEmail() {
    setResendLoading(true)
    setResendSuccess('')
    try {
      const res = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setResendSuccess('Confirmation email resent successfully!')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to resend email')
      }
    } catch {
      setError('Failed to resend. Please check your connection.')
    } finally {
      setResendLoading(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="text-center space-y-6 py-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold">Check your email</h2>
        <p className="text-sm text-muted max-w-xs mx-auto">
          We've sent a confirmation link to <span className="font-semibold text-foreground">{email}</span>. Please verify your account to continue.
        </p>
        
        <div className="pt-4 space-y-3">
          <Button 
            onClick={handleResendEmail} 
            variant="secondary" 
            fullWidth 
            loading={resendLoading}
          >
            Resend Email
          </Button>
          {resendSuccess && <p className="text-xs text-success">{resendSuccess}</p>}
          <Link 
            href={redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login"}
            className="block text-sm text-primary hover:underline"
          >
            Already verified? Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required helperText="At least 6 characters" />
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
        Send Confirmation Email
      </Button>
    </form>
  )
}

export default function RegisterPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-sm mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8">Create Account</h1>

        <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading...</div>}>
          <RegisterForm />
        </Suspense>

        <p className="text-center text-sm text-muted mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
