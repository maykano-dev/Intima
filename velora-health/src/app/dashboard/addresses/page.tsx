'use client'

import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'

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

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [addrToDelete, setAddrToDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete(id: string) {
    setAddrToDelete(id)
    setDeleteModalOpen(true)
  }

  async function confirmDelete() {
    if (!addrToDelete) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/user/addresses?id=${addrToDelete}`, { method: 'DELETE' })
      if (res.ok) {
        loadAddresses()
        setDeleteModalOpen(false)
        setAddrToDelete(null)
      }
    } catch {
      setError('Failed to delete')
    } finally {
      setDeleting(false)
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
    <>
      <div className="space-y-8">
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
          <form onSubmit={handleSubmit} className="rounded-2xl border border-border p-6 mb-6 space-y-4 bg-card shadow-sm">
            <h2 className="font-semibold">{editingId ? 'Edit Address' : 'New Address'}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Home, Work, etc." />
              <Input label="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
              <Input label="Phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
            </div>
            <Input label="Address Line 1" value={form.address_line1} onChange={(e) => setForm({ ...form, address_line1: e.target.value })} required />
            <Input label="Address Line 2 (optional)" value={form.address_line2} onChange={(e) => setForm({ ...form, address_line2: e.target.value })} />
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={form.is_default}
                onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium group-hover:text-primary transition-colors">Set as default address</span>
            </label>
            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="primary" loading={saving} className="px-8">
                {editingId ? 'Update Address' : 'Save Address'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {addresses.length === 0 && !showForm ? (
          <div className="rounded-3xl border border-border p-12 text-center bg-card">
            <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">No addresses saved</h2>
            <p className="text-sm text-muted mb-8 max-w-xs mx-auto">Add an address for faster checkout. You can manage multiple delivery locations here.</p>
            <Button variant="primary" onClick={() => setShowForm(true)}>
              Add New Address
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div key={addr.id} className="rounded-2xl border border-border p-6 bg-card hover:border-primary/50 transition-all shadow-sm group">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-sm uppercase tracking-wider">{addr.label}</span>
                      {addr.is_default && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-black uppercase tracking-tighter">Default</span>
                      )}
                    </div>
                    <p className="font-bold text-lg mb-1">{addr.full_name}</p>
                    <div className="space-y-0.5">
                      <p className="text-sm text-muted font-medium">{addr.address_line1}</p>
                      {addr.address_line2 && <p className="text-sm text-muted font-medium">{addr.address_line2}</p>}
                      <p className="text-sm text-muted font-medium">{addr.city}</p>
                      <p className="text-sm text-primary font-bold mt-2">{addr.phone}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(addr)} 
                      className="p-2 rounded-xl hover:bg-primary/10 text-primary transition-all hover:scale-110"
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(addr.id)} 
                      className="p-2 rounded-xl hover:bg-danger/10 text-danger transition-all hover:scale-110"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={deleteModalOpen} onClose={() => !deleting && setDeleteModalOpen(false)} className="max-w-md">
        <div className="text-center p-2">
          <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4 text-danger">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2 tracking-tight">Delete Address?</h3>
          <p className="text-sm text-muted mb-8 leading-relaxed">Are you sure you want to delete this address? You will need to re-enter it for future orders.</p>
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setDeleteModalOpen(false)} disabled={deleting}>Cancel</Button>
            <Button variant="danger" fullWidth onClick={confirmDelete} loading={deleting}>Delete Address</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
