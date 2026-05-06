'use client'

import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/utils'

interface Customer {
  id: string
  email: string
  full_name: string
  phone: string
  role: string
  created_at: string
  total_orders?: number
  total_spent?: number
  is_banned?: boolean
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [banReason, setBanReason] = useState('')
  const [adminNote, setAdminNote] = useState('')

  async function loadCustomers() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/customers')
      if (res.ok) setCustomers(await res.json())
    } catch {
      setError('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCustomers() }, [])

  async function banCustomer(userId: string) {
    if (!banReason.trim()) return
    try {
      const res = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ban', user_id: userId, reason: banReason }),
      })
      if (res.ok) {
        setBanReason('')
        setSelectedCustomer(null)
        loadCustomers()
      }
    } catch {
      setError('Failed to ban user')
    }
  }

  async function deleteCustomer(userId: string) {
    if (!confirm('Permanently delete this account? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/admin/customers?user_id=${userId}`, { method: 'DELETE' })
      if (res.ok) {
        setSelectedCustomer(null)
        loadCustomers()
      }
    } catch {
      setError('Failed to delete account')
    }
  }

  async function addNote(userId: string) {
    if (!adminNote.trim()) return
    try {
      const res = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'note', user_id: userId, note: adminNote }),
      })
      if (res.ok) {
        setAdminNote('')
      }
    } catch {
      setError('Failed to add note')
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-8 bg-surface rounded w-48 animate-pulse" />
        {[...Array(5)].map((_, i) => (<div key={i} className="h-14 bg-surface rounded-xl animate-pulse" />))}
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Customers</h1>

      {error && <div className="p-4 rounded-xl bg-danger/10 text-danger text-sm mb-6">{error}</div>}

      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedCustomer(null)}>
          <div className="bg-card rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{selectedCustomer.full_name || 'Unknown'}</h2>
              <button onClick={() => setSelectedCustomer(null)} className="p-1 hover:bg-secondary rounded-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="text-sm space-y-2">
              <p><span className="text-muted">Email:</span> {selectedCustomer.email}</p>
              <p><span className="text-muted">Phone:</span> {selectedCustomer.phone || '-'}</p>
              <p><span className="text-muted">Role:</span> {selectedCustomer.role}</p>
              <p><span className="text-muted">Joined:</span> {new Date(selectedCustomer.created_at).toLocaleDateString()}</p>
              <p><span className="text-muted">Orders:</span> {selectedCustomer.total_orders ?? 0}</p>
              <p><span className="text-muted">Total Spent:</span> {formatPrice(selectedCustomer.total_spent ?? 0)}</p>
              {selectedCustomer.is_banned && (
                <p className="text-danger font-medium">This account is banned</p>
              )}
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <h3 className="font-semibold text-sm">Ban Account</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Reason for ban..."
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-transparent text-sm"
                />
                <button
                  onClick={() => banCustomer(selectedCustomer.id)}
                  disabled={!banReason.trim()}
                  className="px-4 py-2 rounded-lg bg-danger text-white text-sm hover:bg-danger/80 transition-colors disabled:opacity-50"
                >
                  Ban
                </button>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <h3 className="font-semibold text-sm">Add Note</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Internal note..."
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-transparent text-sm"
                />
                <button
                  onClick={() => addNote(selectedCustomer.id)}
                  disabled={!adminNote.trim()}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <button
                onClick={() => deleteCustomer(selectedCustomer.id)}
                className="px-4 py-2 rounded-lg border border-danger text-danger text-sm hover:bg-danger/10 transition-colors w-full"
              >
                Delete Account Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {customers.length === 0 ? (
        <div className="text-center py-16 text-muted">No customers found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-muted">Name</th>
                <th className="text-left py-3 px-2 font-medium text-muted">Email</th>
                <th className="text-left py-3 px-2 font-medium text-muted">Phone</th>
                <th className="text-left py-3 px-2 font-medium text-muted">Orders</th>
                <th className="text-left py-3 px-2 font-medium text-muted">Status</th>
                <th className="text-left py-3 px-2 font-medium text-muted">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-border hover:bg-secondary/50 transition-colors cursor-pointer"
                  onClick={() => { setSelectedCustomer(c); setBanReason(''); setAdminNote('') }}
                >
                  <td className="py-3 px-2 font-medium">{c.full_name || '-'}</td>
                  <td className="py-3 px-2 text-muted">{c.email}</td>
                  <td className="py-3 px-2 text-muted">{c.phone || '-'}</td>
                  <td className="py-3 px-2">{c.total_orders ?? 0}</td>
                  <td className="py-3 px-2">
                    {c.is_banned ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Banned</span>
                    ) : c.role === 'admin' ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">Admin</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Active</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-xs text-muted">{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
