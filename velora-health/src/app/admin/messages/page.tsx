'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

interface Message {
  id: string
  name: string
  email: string
  subject: string
  message: string
  read: boolean
  admin_reply?: string
  created_at: string
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showUnread, setShowUnread] = useState(false)
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void; isDanger?: boolean }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  })

  async function handleReply(id: string) {
    if (!replyText[id]) return
    try {
      await fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, admin_reply: replyText[id], read: true }),
      })
      load()
      setReplyText({ ...replyText, [id]: '' })
    } catch {
      setError('Failed to send reply')
    }
  }

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
    setConfirmModal({
      open: true,
      title: 'Delete Message',
      message: 'Are you sure you want to delete this message?',
      isDanger: true,
      onConfirm: async () => {
        try {
          await fetch(`/api/admin/messages?id=${id}`, { method: 'DELETE' })
          load()
          setConfirmModal(prev => ({ ...prev, open: false }))
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
        {[...Array(3)].map((_, i) => (<div key={i} className="h-24 bg-surface rounded-2xl animate-pulse" />))}
      </div>
    )
  }

  return (
    <>
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
              
              {msg.admin_reply ? (
                <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-[10px] uppercase font-bold text-primary mb-1">Your Reply</p>
                  <p className="text-sm italic text-foreground">{msg.admin_reply}</p>
                  <p className="text-[10px] text-muted mt-2">Replied on {new Date(msg.created_at).toLocaleDateString()}</p>
                </div>
              ) : (
                <div className="mt-4 space-y-2">
                  <textarea
                    placeholder="Type your reply here..."
                    value={replyText[msg.id] || ''}
                    onChange={(e) => setReplyText({ ...replyText, [msg.id]: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-card text-sm min-h-[80px] focus:ring-1 focus:ring-primary outline-none"
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleReply(msg.id)}
                      disabled={!replyText[msg.id]}
                      className="text-xs px-4 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-50 transition-colors font-medium"
                    >
                      Send Reply
                    </button>
                    {!msg.read && (
                      <button onClick={() => markRead(msg.id)} className="text-xs px-4 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors">
                        Mark as Read
                      </button>
                    )}
                    <button onClick={() => deleteMessage(msg.id)} className="text-xs px-4 py-1.5 rounded-lg text-danger hover:bg-danger/10 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
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
