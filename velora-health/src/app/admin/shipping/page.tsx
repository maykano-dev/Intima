'use client'

import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface ShippingOption {
  id: string
  name: string
  description: string
  delivery_min_days: number
  delivery_max_days: number
  price_cny: number
  is_active: boolean
  sort_order: number
}

export default function AdminShipping() {
  const [options, setOptions] = useState<ShippingOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<ShippingOption | null>(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: '',
    description: '',
    delivery_min_days: '',
    delivery_max_days: '',
    price_cny: '',
    is_active: true,
    sort_order: '0',
  })

  async function load() {
    try {
      const res = await fetch('/api/admin/shipping')
      if (res.ok) setOptions(await res.json())
    } catch {
      setError('Failed to load shipping options')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function resetForm() {
    setForm({ name: '', description: '', delivery_min_days: '', delivery_max_days: '', price_cny: '', is_active: true, sort_order: '0' })
    setEditing(null)
  }

  function handleEdit(opt: ShippingOption) {
    setForm({
      name: opt.name,
      description: opt.description || '',
      delivery_min_days: String(opt.delivery_min_days),
      delivery_max_days: String(opt.delivery_max_days),
      price_cny: String(opt.price_cny),
      is_active: opt.is_active,
      sort_order: String(opt.sort_order),
    })
    setEditing(opt)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const method = editing ? 'PATCH' : 'POST'
      const body = editing ? { ...form, id: editing.id } : form
      const res = await fetch('/api/admin/shipping', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) { resetForm(); load() }
      else { const d = await res.json(); setError(d.error || 'Failed to save') }
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(id: string, current: boolean) {
    try {
      await fetch('/api/admin/shipping', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !current }),
      })
      load()
    } catch { setError('Failed to update') }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-8 bg-surface rounded w-48 animate-pulse" />
        {[...Array(2)].map((_, i) => (<div key={i} className="h-20 bg-surface rounded-2xl animate-pulse" />))}
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Shipping Options</h1>

      {error && <div className="p-4 rounded-xl bg-danger/10 text-danger text-sm mb-6">{error}</div>}

      {editing && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-border p-6 mb-6 space-y-4">
          <h2 className="font-semibold">Edit Shipping Option</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="Sort Order" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
            <Input label="Min Delivery Days" type="number" value={form.delivery_min_days} onChange={(e) => setForm({ ...form, delivery_min_days: e.target.value })} required />
            <Input label="Max Delivery Days" type="number" value={form.delivery_max_days} onChange={(e) => setForm({ ...form, delivery_max_days: e.target.value })} required />
            <Input label="Price (CNY)" type="number" step="0.01" value={form.price_cny} onChange={(e) => setForm({ ...form, price_cny: e.target.value })} required />
          </div>
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded border-border text-primary" />
            <span className="text-sm">Active (visible to customers)</span>
          </label>
          <div className="flex gap-3">
            <Button type="submit" variant="primary" loading={saving}>Update</Button>
            <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {options.map((opt) => (
          <div key={opt.id} className="rounded-2xl border border-border p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{opt.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${opt.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                    {opt.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-muted">{opt.description}</p>
                <p className="text-xs text-muted mt-1">
                  {opt.delivery_min_days}-{opt.delivery_max_days} days · {opt.price_cny} CNY shipping cost
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(opt)} className="text-xs text-primary hover:underline">Edit</button>
                <button onClick={() => toggleActive(opt.id, opt.is_active)} className="text-xs text-muted hover:underline">
                  {opt.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
