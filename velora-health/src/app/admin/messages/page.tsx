'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  name: string
  email: string
  subject: string
  message: string
  read: boolean
  created_at: string
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showUnread, setShowUnread] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/messages${showUnread ? '?unread=true' : ''}`)
      if (res.ok) setMessages(await res.json())
    } catch {
      setError('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [showUnread])

  async function markRead(id: string) {
    try {
      await fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: true }),
      })
      load()
    } catch {
      setError('Failed to update')
    }
  }

  async function deleteMessage(id: string) {
    if (!confirm('Delete this message?')) return
    try {
      await fetch(`/api/admin/messages?id=${id}`, { method: 'DELETE' })
      load()
    } catch {
      setError('Failed to delete')
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-8 bg-surface rounded w-48 animate-pulse" />
        {[...Array(3)].map((_, i) => (<div key={i} className="h-24 bg-surface rounded-2xl animate-pulse" />))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Contact Messages</h1>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showUnread}
            onChange={(e) => setShowUnread(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary"
          />
          <span className="text-sm">Unread only</span>
        </label>
      </div>

      {error && <div className="p-4 rounded-xl bg-danger/10 text-danger text-sm mb-6">{error}</div>}

      {messages.length === 0 ? (
        <div className="text-center py-16 text-muted">No messages found.</div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'rounded-2xl border p-5 transition-colors',
                msg.read ? 'border-border' : 'border-primary/30 bg-primary/5'
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-sm">{msg.name}</p>
                  <p className="text-xs text-muted">{msg.email} · {new Date(msg.created_at).toLocaleString()}</p>
                </div>
                {!msg.read && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">New</span>
                )}
              </div>
              <p className="font-medium text-sm mb-1">{msg.subject}</p>
              <p className="text-sm text-muted whitespace-pre-wrap">{msg.message}</p>
              <div className="flex gap-2 mt-3">
                {!msg.read && (
                  <button onClick={() => markRead(msg.id)} className="text-xs px-3 py-1 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors">
                    Mark Read
                  </button>
                )}
                <button onClick={() => deleteMessage(msg.id)} className="text-xs px-3 py-1 rounded-lg border border-danger text-danger hover:bg-danger/10 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
