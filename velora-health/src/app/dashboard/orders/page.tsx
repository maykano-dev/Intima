'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatPrice, cn } from '@/lib/utils'

interface OrderSummary {
  id: string
  total: number
  status: string
  payment_status: string
  created_at: string
  tracking_number: string | null
  estimated_delivery: string | null
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  processing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
}

export default function DashboardOrders() {
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/user/orders')
        if (res.ok) {
          const data = await res.json()
          setOrders(Array.isArray(data) ? data : [])
        } else {
          const err = await res.json()
          setError(err.error || 'Failed to load orders')
        }
      } catch {
        setError('Failed to load orders')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div>
        <div className="h-8 bg-surface rounded w-48 mb-6 animate-pulse" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-surface rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {error && (
        <div className="p-4 rounded-xl bg-danger/10 text-danger text-sm mb-6">{error}</div>
      )}

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-border p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="font-semibold mb-1">No orders yet</h2>
          <p className="text-sm text-muted mb-4">Your order history will appear here.</p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-lg bg-primary text-white px-5 py-2.5 text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            Browse Shop
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/dashboard/orders/${order.id}`}
              className="block rounded-2xl border border-border p-5 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{order.id}</span>
                <span className={cn(
                  'inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                  statusColors[order.status] || ''
                )}>
                  {order.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">
                  {new Date(order.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <span className="font-medium">{formatPrice(order.total)}</span>
              </div>
              {order.tracking_number && (
                <div className="mt-2 text-xs text-muted">
                  Tracking: {order.tracking_number}
                  {order.estimated_delivery && ` · Est. delivery: ${new Date(order.estimated_delivery).toLocaleDateString()}`}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
