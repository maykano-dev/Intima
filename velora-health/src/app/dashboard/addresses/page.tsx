'use client'

import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface Address {
  id: string
  label: string
  full_name: string
  phone: string
  address_line1: string
  address_line2: string
  city: string
  is_default: boolean
}

export default function DashboardAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    label: 'Home',
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: 'Accra',
    is_default: false,
  })

  async function loadAddresses() {
    try {
      const res = await fetch('/api/user/addresses')
      if (res.ok) {
        const data = await res.json()
        setAddresses(data)
      }
    } catch {
      setError('Failed to load addresses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAddresses() }, [])

  function resetForm() {
    setForm({ label: 'Home', full_name: '', phone: '', address_line1: '', address_line2: '', city: 'Accra', is_default: false })
    setEditingId(null)
    setShowForm(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const url = editingId ? '/api/user/addresses' : '/api/user/addresses'
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { ...form, id: editingId } : form),
      })
      if (res.ok) {
        resetForm()
        loadAddresses()
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

  async function handleDelete(id: string) {
    if (!confirm('Delete this address?')) return
    try {
      const res = await fetch(`/api/user/addresses?id=${id}`, { method: 'DELETE' })
      if (res.ok) loadAddresses()
    } catch {
      setError('Failed to delete')
    }
  }

  function handleEdit(addr: Address) {
    setForm({
      label: addr.label,
      full_name: addr.full_name,
      phone: addr.phone,
      address_line1: addr.address_line1,
      address_line2: addr.address_line2,
      city: addr.city,
      is_default: addr.is_default,
    })
    setEditingId(addr.id)
    setShowForm(true)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-surface rounded w-48 animate-pulse" />
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-24 bg-surface rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Addresses</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors"
          >
            Add Address
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-danger/10 text-danger text-sm mb-6">{error}</div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-border p-6 mb-6 space-y-4">
          <h2 className="font-semibold">{editingId ? 'Edit Address' : 'New Address'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Home, Work, etc." />
            <Input label="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
            <Input label="Phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
          </div>
          <Input label="Address Line 1" value={form.address_line1} onChange={(e) => setForm({ ...form, address_line1: e.target.value })} required />
          <Input label="Address Line 2 (optional)" value={form.address_line2} onChange={(e) => setForm({ ...form, address_line2: e.target.value })} />
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm">Set as default address</span>
          </label>
          <div className="flex gap-3">
            <Button type="submit" variant="primary" loading={saving}>
              {editingId ? 'Update' : 'Save'}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="rounded-2xl border border-border p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="font-semibold mb-1">No addresses saved</h2>
          <p className="text-sm text-muted">Add an address for faster checkout.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div key={addr.id} className="rounded-2xl border border-border p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{addr.label}</span>
                    {addr.is_default && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Default</span>
                    )}
                  </div>
                  <p className="text-sm">{addr.full_name}</p>
                  <p className="text-sm text-muted">{addr.address_line1}</p>
                  {addr.address_line2 && <p className="text-sm text-muted">{addr.address_line2}</p>}
                  <p className="text-sm text-muted">{addr.city}</p>
                  <p className="text-sm text-muted">{addr.phone}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(addr)} className="text-xs text-primary hover:underline">Edit</button>
                  <button onClick={() => handleDelete(addr.id)} className="text-xs text-danger hover:underline">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
