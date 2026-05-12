'use client'

import { useEffect, useState } from 'react'
import { formatPrice, cn } from '@/lib/utils'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'

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
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void; isDanger?: boolean }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  })

  const filteredCustomers = customers.filter(c => {
    const q = searchQuery.toLowerCase()
    return (
      (c.full_name || '').toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q)
    )
  })

  function toggleSelect(id: string) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  function toggleSelectAll() {
    setSelectedIds(prev => prev.length === filteredCustomers.length ? [] : filteredCustomers.map(c => c.id))
  }

  async function bulkDelete() {
    if (selectedIds.length === 0) return
    setConfirmModal({
      open: true,
      title: 'Delete Customer Accounts',
      message: `Are you sure you want to delete ${selectedIds.length} customer accounts? This action cannot be undone.`,
      isDanger: true,
      onConfirm: async () => {
        setLoading(true)
        try {
          await Promise.all(selectedIds.map(id => fetch(`/api/admin/customers?user_id=${id}`, { method: 'DELETE' })))
          loadCustomers()
          setSelectedIds([])
          setConfirmModal(prev => ({ ...prev, open: false }))
        } catch {
          setError('Bulk delete failed')
        } finally {
          setLoading(false)
        }
      }
    })
  }

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
    setConfirmModal({
      open: true,
      title: 'Delete Customer Account',
      message: 'Are you sure you want to permanently delete this account? This cannot be undone.',
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/customers?user_id=${userId}`, { method: 'DELETE' })
          if (res.ok) {
            setSelectedCustomer(null)
            loadCustomers()
            setConfirmModal(prev => ({ ...prev, open: false }))
          }
        } catch {
          setError('Failed to delete account')
        }
      }
    })
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
    <>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-serif tracking-tight">Customers</h1>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input 
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={loadCustomers}
            className="p-2.5 rounded-xl border border-border text-muted hover:bg-secondary transition-colors"
            title="Refresh"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="mb-8 p-4 rounded-3xl bg-primary/5 border border-primary/20 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold">{selectedIds.length} customers selected</span>
            <div className="h-4 w-px bg-primary/20" />
            <p className="text-xs text-muted">Bulk actions apply to all selected accounts.</p>
          </div>
          <button 
            onClick={bulkDelete}
            className="text-xs font-bold px-4 py-2 rounded-xl bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
          >
            Delete Selected Accounts
          </button>
        </div>
      )}

      {error && <div className="p-4 rounded-xl bg-danger/10 text-danger text-sm mb-6">{error}</div>}

      {/* Selected Customer Modal */}
      <Modal open={!!selectedCustomer} onClose={() => setSelectedCustomer(null)} className="max-w-2xl">
        {selectedCustomer && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-serif tracking-tight">{selectedCustomer.full_name}</h2>
                <p className="text-sm text-muted">{selectedCustomer.email}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-secondary rounded-full transition-colors">
                <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted">Phone</label>
                  <p className="font-bold">{selectedCustomer.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted">Joined</label>
                  <p className="font-bold">{new Date(selectedCustomer.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="space-y-4 text-right">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted">Total Orders</label>
                  <p className="font-bold text-xl">{selectedCustomer.total_orders ?? 0}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted">Customer Status</label>
                  <div className="mt-1">
                    {selectedCustomer.is_banned ? (
                      <Badge variant="danger">Banned</Badge>
                    ) : (
                      <Badge variant="success">Active</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-8 border-t border-border">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-primary">Admin Note</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Add a private note about this customer..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-secondary/30 border border-border text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button onClick={() => addNote(selectedCustomer.id)}>Save Note</Button>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-danger/5 border border-danger/20 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-danger uppercase tracking-widest">Account Management</h3>
                  {!selectedCustomer.is_banned ? (
                    <Button variant="danger" onClick={() => banCustomer(selectedCustomer.id)}>Ban Account</Button>
                  ) : (
                    <Button variant="outline" onClick={() => banCustomer(selectedCustomer.id)}>Unban Account</Button>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-danger uppercase tracking-widest ml-1">Reason for Ban</label>
                  <textarea 
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-white border border-danger/20 text-sm outline-none focus:ring-2 focus:ring-danger min-h-[80px]"
                    placeholder="Provide a reason for banning this account..."
                  />
                </div>
                <div className="pt-4 mt-4 border-t border-danger/10">
                  <button 
                    onClick={() => deleteCustomer(selectedCustomer.id)}
                    className="text-xs font-bold text-danger hover:underline"
                  >
                    Delete Account Permanently
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {filteredCustomers.length === 0 ? (
        <div className="text-center py-20 text-muted bg-card rounded-[2rem] border border-border/50 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-muted/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium">No customers found matching your search.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[2rem] border border-border bg-card/30 backdrop-blur-sm shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/5 border-b border-border">
                <th className="p-5 text-left">
                  <input 
                    type="checkbox"
                    checked={selectedIds.length === filteredCustomers.length && filteredCustomers.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-border text-primary focus:ring-primary bg-card"
                  />
                </th>
                <th className="text-left py-4 px-2 text-[10px] font-black uppercase tracking-widest text-muted">Name</th>
                <th className="text-left py-4 px-2 text-[10px] font-black uppercase tracking-widest text-muted">Email</th>
                <th className="text-left py-4 px-2 text-[10px] font-black uppercase tracking-widest text-muted">Phone</th>
                <th className="text-left py-4 px-2 text-[10px] font-black uppercase tracking-widest text-muted text-center">Orders</th>
                <th className="text-left py-4 px-2 text-[10px] font-black uppercase tracking-widest text-muted text-center">Status</th>
                <th className="text-left py-4 px-2 text-[10px] font-black uppercase tracking-widest text-muted">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c) => (
                <tr
                  key={c.id}
                  className={cn(
                    "border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer",
                    selectedIds.includes(c.id) && "bg-primary/[0.02]"
                  )}
                  onClick={() => { setSelectedCustomer(c); setBanReason(''); setAdminNote('') }}
                >
                  <td className="p-5" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(c.id)}
                      onChange={() => toggleSelect(c.id)}
                      className="rounded border-border text-primary focus:ring-primary bg-card"
                    />
                  </td>
                  <td className="py-4 px-2 font-bold tracking-tight">{c.full_name || '-'}</td>
                  <td className="py-4 px-2 text-muted font-medium">{c.email}</td>
                  <td className="py-4 px-2 text-muted font-medium">{c.phone || '-'}</td>
                  <td className="py-4 px-2 text-center font-black text-xs">{c.total_orders ?? 0}</td>
                  <td className="py-4 px-2 text-center">
                    {c.is_banned ? (
                      <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Banned</span>
                    ) : c.role === 'admin' ? (
                      <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">Admin</span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Active</span>
                    )}
                  </td>
                  <td className="py-4 px-2 text-muted font-bold text-[10px]">{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal 
        open={confirmModal.open} 
        onClose={() => setConfirmModal(prev => ({ ...prev, open: false }))}
        className="max-w-md"
      >
        <div className="text-center p-2">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
            confirmModal.isDanger ? "bg-danger/10 text-danger" : "bg-primary/10 text-primary"
          )}>
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2 tracking-tight">{confirmModal.title}</h3>
          <p className="text-sm text-muted mb-8 leading-relaxed">{confirmModal.message}</p>
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))}>Cancel</Button>
            <Button 
              variant={confirmModal.isDanger ? "danger" : "primary"} 
              fullWidth 
              onClick={confirmModal.onConfirm}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
