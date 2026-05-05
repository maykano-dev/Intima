'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (res.ok) {
        // Check profile role to redirect appropriately
        const profileRes = await fetch('/api/admin/profile')
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          if (profileData.profile?.role === 'admin') {
            router.push('/admin')
          } else {
            router.push('/dashboard')
          }
        } else {
          router.push('/dashboard')
        }
      } else {
        const data = await res.json()
        setError(data.error || 'Login failed')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-sm mx-auto">
        <h1 className="text-2xl font-bold text-center mb-2">Sign In</h1>
        <p className="text-muted text-center text-sm mb-8">Sign in to your Intima account</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  )
}
