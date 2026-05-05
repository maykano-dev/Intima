'use client'

import { useEffect, useState } from 'react'

interface Subscriber {
  id: string
  email: string
  created_at: string
}

export default function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
    if (!confirm('Remove this subscriber?')) return
    try {
      const res = await fetch(`/api/admin/subscribers?id=${id}`, { method: 'DELETE' })
      if (res.ok) load()
    } catch {
      setError('Failed to delete')
    }
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
    <div>
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
    </div>
  )
}
