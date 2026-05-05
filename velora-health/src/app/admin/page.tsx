'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatPrice, cn } from '@/lib/utils'
import Button from '@/components/ui/Button'

interface Order {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  total: number
  status: string
  payment_status: string
  created_at: string
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  processing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
}

const nextStatus: Record<string, string> = {
  pending: 'processing',
  paid: 'processing',
  processing: 'shipped',
  shipped: 'delivered',
  delivered: 'delivered',
  cancelled: 'cancelled',
}

export default function AdminPage() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/session')
        if (res.ok) {
          const data = await res.json()
          setAuthenticated(!!data.user)
        }
      } catch {
        setAuthenticated(false)
      } finally {
        setAuthChecked(true)
      }
    }
    checkAuth()
  }, [])

  useEffect(() => {
    if (authenticated) loadOrders()
  }, [authenticated])

  async function loadOrders() {
    setLoading(true)
    try {
      const res = await fetch('/api/orders')
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

  async function updateStatus(orderId: string, status: string) {
    setUpdating(orderId)
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, status }),
      })
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status } : o))
        )
      }
    } catch {
      // Ignore
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {!authChecked ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : !authenticated ? (
        <div className="max-w-md mx-auto text-center py-16">
          <h1 className="text-2xl font-bold mb-2">Admin Access</h1>
          <p className="text-muted mb-6">Sign in to manage your store.</p>
          <Link href="/login">
            <Button variant="primary">Sign In</Button>
          </Link>
        </div>
      ) : (
        <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted mt-1">Manage orders, track fulfillment</p>
        </div>
        <button
          onClick={loadOrders}
          className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-secondary transition-colors"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-danger/10 text-danger text-sm mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-surface animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted">No orders yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-muted">Order</th>
                <th className="text-left py-3 px-2 font-medium text-muted">Customer</th>
                <th className="text-left py-3 px-2 font-medium text-muted">Email</th>
                <th className="text-left py-3 px-2 font-medium text-muted">Total</th>
                <th className="text-left py-3 px-2 font-medium text-muted">Status</th>
                <th className="text-left py-3 px-2 font-medium text-muted">Payment</th>
                <th className="text-left py-3 px-2 font-medium text-muted">Date</th>
                <th className="text-left py-3 px-2 font-medium text-muted">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                  <td className="py-3 px-2 font-medium">{order.id}</td>
                  <td className="py-3 px-2">{order.customer_name}</td>
                  <td className="py-3 px-2 text-muted">{order.customer_email}</td>
                  <td className="py-3 px-2">{formatPrice(order.total)}</td>
                  <td className="py-3 px-2">
                    <span className={cn('inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize', statusColors[order.status] || '')}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 capitalize">{order.payment_status}</td>
                  <td className="py-3 px-2 text-muted text-xs">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-2">
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <button
                        onClick={() => updateStatus(order.id, nextStatus[order.status] || order.status)}
                        disabled={updating === order.id}
                        className="text-xs px-3 py-1 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
                      >
                        {updating === order.id ? '...' : `Mark ${nextStatus[order.status]}`}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
        </>
      )}
    </div>
  )
}
