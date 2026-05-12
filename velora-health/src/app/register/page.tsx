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
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
        body: JSON.stringify({ name, email, phone, password }),
      })
      
      const data = await res.json()
      
      if (res.ok) {
        // Since we are now using admin creation with auto-confirm
        // we can just redirect to login
        router.push(redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}&registered=true` : "/login?registered=true")
      } else {
        setError(data.error || 'Registration failed')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Input label="Phone Number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="e.g. 0244000000" />
      <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required helperText="At least 6 characters" />
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
        Create Account
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
