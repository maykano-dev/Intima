'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { isValidEmail } from '@/lib/utils'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValidEmail(form.email)) {
      setError('Please enter a valid email.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSuccess(true)
        setForm({ name: '', email: '', subject: '', message: '' })
      } else {
        setError('Failed to send. Please email us at support@intima.com')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
        <p className="text-muted mb-8">
          For inquiries, please email us. We typically respond within 24 hours.
        </p>

        <div className="flex items-center gap-3 p-4 rounded-2xl border border-border mb-10 max-w-sm mx-auto">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium">Email</p>
            <p className="text-xs text-muted">support@intima.com</p>
          </div>
        </div>

        {success ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Message Sent!</h2>
            <p className="text-muted">We&apos;ll get back to you within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Your Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="John Doe"
              />
              <Input
                label="Your Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="john@example.com"
              />
            </div>
            <Input
              label="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              required
              placeholder="How can we help?"
            />
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Message</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                rows={5}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none bg-card"
                placeholder="Write your message here..."
              />
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" variant="primary" size="lg" loading={submitting}>
              Send Message
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
