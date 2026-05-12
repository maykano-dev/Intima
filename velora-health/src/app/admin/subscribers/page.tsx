'use client'

import { useEffect, useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface Subscriber {
  id: string
  email: string
  created_at: string
}

export default function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void; isDanger?: boolean }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  })

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/subscribers')
      if (res.ok) setSubscribers(await res.json())
    } catch {
      setError('Failed to load subscribers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function deleteSub(id: string) {
    setConfirmModal({
      open: true,
      title: 'Remove Subscriber',
      message: 'Are you sure you want to remove this subscriber from the list?',
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/subscribers?id=${id}`, { method: 'DELETE' })
          if (res.ok) {
            load()
            setConfirmModal(prev => ({ ...prev, open: false }))
          }
        } catch {
          setError('Failed to delete')
        }
      }
    })
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-8 bg-surface rounded w-48 animate-pulse" />
        {[...Array(5)].map((_, i) => (<div key={i} className="h-12 bg-surface rounded-xl animate-pulse" />))}
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Subscribers ({subscribers.length})</h1>
        <button onClick={load} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-secondary transition-colors">Refresh</button>
      </div>

      {error && <div className="p-4 rounded-xl bg-danger/10 text-danger text-sm mb-6">{error}</div>}

      {subscribers.length === 0 ? (
        <div className="text-center py-16 text-muted">No subscribers yet.</div>
      ) : (
        <div className="space-y-2">
          {subscribers.map((sub) => (
            <div key={sub.id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-secondary/50 transition-colors">
              <div>
                <p className="text-sm font-medium">{sub.email}</p>
                <p className="text-xs text-muted">Subscribed {new Date(sub.created_at).toLocaleDateString()}</p>
              </div>
              <button onClick={() => deleteSub(sub.id)} className="text-xs text-danger hover:underline">Remove</button>
            </div>
          ))}
        </div>
      )}

      {subscribers.length > 0 && (
        <div className="mt-6 p-4 rounded-xl bg-secondary/50">
          <p className="text-sm font-medium mb-1">Export</p>
          <p className="text-xs text-muted mb-2">Copy all emails for your email marketing tool:</p>
          <pre className="text-xs bg-background p-3 rounded-lg overflow-x-auto">{subscribers.map((s) => s.email).join('\n')}</pre>
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
