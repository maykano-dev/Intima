'use client'

import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'

export default function AdminRates() {
  const [rate, setRate] = useState('0.2800')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/rates')
        if (res.ok) {
          const data = await res.json()
          setRate(String(data.exchange_rate_cny_to_ghs))
        }
      } catch {
        setError('Failed to load exchange rate')
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
      const res = await fetch('/api/admin/rates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exchange_rate_cny_to_ghs: parseFloat(rate) }),
      })
      if (res.ok) {
        setMessage('Exchange rate updated. All product prices will recalculate.')
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
        <div className="h-32 bg-surface rounded-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Exchange Rate</h1>
      <p className="text-sm text-muted mb-6">
        Set the CNY to GHS conversion rate. Product prices are stored in CNY (yuan) and
        displayed in GHS (cedis) on the storefront using this rate.
      </p>

      <form onSubmit={handleSave} className="max-w-md space-y-4">
        <div className="rounded-2xl border border-border p-6">
          <label className="block text-sm font-medium mb-2">1 CNY = ? GHS</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              step="0.0001"
              min="0.0001"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-border bg-transparent text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <span className="text-sm text-muted font-medium">GHS</span>
          </div>
          <p className="text-xs text-muted mt-3">
            Example: A product priced at 100 CNY will show as {formatGHS(parseFloat(rate) > 0 ? 100 / parseFloat(rate) : 0)} GHS
          </p>
        </div>

        {message && <div className="p-4 rounded-xl bg-success/10 text-success text-sm">{message}</div>}
        {error && <div className="p-4 rounded-xl bg-danger/10 text-danger text-sm">{error}</div>}

        <Button type="submit" variant="primary" loading={saving}>
          Update Rate
        </Button>
      </form>
    </div>
  )
}

function formatGHS(amount: number): string {
  return `GHS ${amount.toFixed(2)}`
}
