'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { isValidEmail } from '@/lib/utils'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValidEmail(email)) return

    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="py-16 lg:py-20 bg-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">Stay in the Know</h2>
          <p className="text-muted mt-3 mb-8">
            Subscribe for discreet wellness tips, new product alerts, and exclusive offers.
            No spam. Unsubscribe anytime.
          </p>
          {status === 'success' ? (
            <p className="text-success font-medium">Thanks for subscribing! Check your inbox.</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 rounded-lg border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-card"
              />
              <Button type="submit" variant="primary" size="lg" loading={status === 'loading'}>
                Subscribe
              </Button>
            </form>
          )}
          {status === 'error' && (
            <p className="text-danger text-sm mt-2">Something went wrong. Please try again.</p>
          )}
          <p className="text-xs text-muted mt-4">
            By subscribing, you agree to our Privacy Policy. You must be 18+.
          </p>
        </div>
      </div>
    </section>
  )
}
