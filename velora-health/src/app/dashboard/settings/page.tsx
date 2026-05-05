'use client'

import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface Profile {
  full_name: string
  email: string
  phone: string
  email_notifications: boolean
}

export default function DashboardSettings() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/user/settings')
        if (res.ok) {
          const data = await res.json()
          setProfile(data)
          setFullName(data.full_name || '')
          setPhone(data.phone || '')
          setEmailNotifications(data.email_notifications ?? true)
        }
      } catch {
        setError('Failed to load settings')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          phone,
          email_notifications: emailNotifications,
        }),
      })
      if (res.ok) {
        setMessage('Settings saved successfully')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to save')
      }
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-surface rounded w-48 animate-pulse" />
        <div className="h-64 bg-surface rounded-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

      <form onSubmit={handleSave} className="max-w-lg space-y-6">
        <div className="rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-semibold">Personal Information</h2>
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <Input
            label="Email"
            value={profile?.email || ''}
            disabled
            helperText="Email cannot be changed"
          />
          <Input
            label="Phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+233 XX XXX XXXX"
          />
        </div>

        <div className="rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-semibold">Notifications</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <div>
              <p className="text-sm font-medium">Email notifications</p>
              <p className="text-xs text-muted">Order updates via email</p>
            </div>
          </label>
        </div>

        {message && (
          <div className="p-4 rounded-xl bg-success/10 text-success text-sm">{message}</div>
        )}
        {error && (
          <div className="p-4 rounded-xl bg-danger/10 text-danger text-sm">{error}</div>
        )}

        <Button type="submit" variant="primary" loading={saving}>
          Save Changes
        </Button>
      </form>
    </div>
  )
}
