'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

interface Review {
  id: string
  customer_name: string
  rating: number
  content: string
  approved: boolean
  admin_reply?: string
  created_at: string
  products?: { name: string; slug: string } | null
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending')
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
      await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, admin_reply: replyText[id] }),
      })
      loadReviews()
      setReplyText({ ...replyText, [id]: '' })
    } catch {
      setError('Failed to send reply')
    }
  }

  async function loadReviews() {
    setLoading(true)
    try {
      const params = filter === 'all' ? '' : `?approved=${filter === 'approved'}`
      const res = await fetch(`/api/admin/reviews${params}`)
      if (res.ok) setReviews(await res.json())
    } catch {
      setError('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadReviews() }, [filter])

  async function toggleApproval(id: string, current: boolean) {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approved: !current }),
      })
      if (res.ok) loadReviews()
    } catch {
      setError('Failed to update')
    }
  }

  async function deleteReview(id: string) {
    setConfirmModal({
      open: true,
      title: 'Delete Review',
      message: 'Are you sure you want to delete this review?',
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' })
          if (res.ok) {
            loadReviews()
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
        {[...Array(3)].map((_, i) => (<div key={i} className="h-24 bg-surface rounded-2xl animate-pulse" />))}
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Reviews</h1>
        <div className="flex gap-2">
          {(['pending', 'approved', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                filter === f ? 'bg-primary text-white' : 'bg-secondary text-muted hover:bg-secondary/80'
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="p-4 rounded-xl bg-danger/10 text-danger text-sm mb-6">{error}</div>}

      {reviews.length === 0 ? (
        <div className="text-center py-16 text-muted">No reviews found.</div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-2xl border border-border p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-sm">{review.customer_name}</p>
                  <p className="text-xs text-muted">
                    {review.products?.name || 'Unknown product'}
                    {' · '}
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </p>
                </div>
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium',
                  review.approved ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                )}>
                  {review.approved ? 'Approved' : 'Pending'}
                </span>
              </div>
              <p className="text-sm text-muted mb-3">{review.content}</p>

              {review.admin_reply ? (
                <div className="mb-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-[10px] uppercase font-bold text-primary mb-1">Your Reply</p>
                  <p className="text-sm italic text-foreground">{review.admin_reply}</p>
                </div>
              ) : (
                <div className="mb-4 space-y-2">
                  <textarea
                    placeholder="Write a public reply..."
                    value={replyText[review.id] || ''}
                    onChange={(e) => setReplyText({ ...replyText, [review.id]: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-card text-sm min-h-[60px] focus:ring-1 focus:ring-primary outline-none"
                  />
                  <button 
                    onClick={() => handleReply(review.id)}
                    disabled={!replyText[review.id]}
                    className="text-xs px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-50 transition-colors"
                  >
                    Post Reply
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => toggleApproval(review.id, review.approved)}
                  className="text-xs px-3 py-1 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors"
                >
                  {review.approved ? 'Unapprove' : 'Approve'}
                </button>
                <button
                  onClick={() => deleteReview(review.id)}
                  className="text-xs px-3 py-1 rounded-lg border border-danger text-danger hover:bg-danger/10 transition-colors"
                >
                  Delete
                </button>
              </div>
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
