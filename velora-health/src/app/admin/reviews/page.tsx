'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface Review {
  id: string
  customer_name: string
  rating: number
  content: string
  approved: boolean
  created_at: string
  products?: { name: string; slug: string } | null
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending')

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
    if (!confirm('Delete this review?')) return
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' })
      if (res.ok) loadReviews()
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
    </div>
  )
}
