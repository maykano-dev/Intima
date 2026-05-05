'use client'

import { useEffect, useState } from 'react'
import { formatPrice, cn } from '@/lib/utils'

interface Order {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  total: number
  status: string
  payment_status: string
  payment_reference: string
  tracking_number: string | null
  estimated_delivery: string | null
  created_at: string
  order_items?: { product_name: string; quantity: number; unit_price: number }[]
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

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [trackingInput, setTrackingInput] = useState('')

  async function loadOrders() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/orders')
      if (res.ok) {
        const data = await res.json()
        setOrders(Array.isArray(data) ? data : [])
      }
    } catch {
      setError('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadOrders() }, [])

  async function updateStatus(orderId: string, status: string) {
    setUpdating(orderId)
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, status }),
      })
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)))
        if (selectedOrder?.id === orderId) setSelectedOrder((prev) => prev ? { ...prev, status } : null)
      }
    } catch {
      // Ignore
    } finally {
      setUpdating(null)
    }
  }

  async function updateTracking(orderId: string) {
    if (!trackingInput.trim()) return
    setUpdating(orderId)
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, tracking_number: trackingInput.trim() }),
      })
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, tracking_number: trackingInput.trim() } : o)))
        if (selectedOrder?.id === orderId) setSelectedOrder((prev) => prev ? { ...prev, tracking_number: trackingInput.trim() } : null)
        setTrackingInput('')
      }
    } catch {
      // Ignore
    } finally {
      setUpdating(null)
    }
  }

  async function deleteOrder(id: string) {
    if (!confirm('Delete this order?')) return
    try {
      const res = await fetch(`/api/admin/orders?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== id))
        setSelectedOrder(null)
      }
    } catch {
      setError('Failed to delete order')
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-8 bg-surface rounded w-48 animate-pulse" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-surface rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <button
          onClick={loadOrders}
          className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-secondary transition-colors"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-danger/10 text-danger text-sm mb-6">{error}</div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-card rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{selectedOrder.id}</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-1 hover:bg-secondary rounded-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="text-sm space-y-2">
              <p><span className="text-muted">Customer:</span> {selectedOrder.customer_name}</p>
              <p><span className="text-muted">Email:</span> {selectedOrder.customer_email}</p>
              <p><span className="text-muted">Phone:</span> {selectedOrder.customer_phone}</p>
              <p><span className="text-muted">Total:</span> {formatPrice(selectedOrder.total)}</p>
              <p><span className="text-muted">Status:</span> <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium capitalize', statusColors[selectedOrder.status])}>{selectedOrder.status}</span></p>
              <p><span className="text-muted">Payment:</span> {selectedOrder.payment_status} {selectedOrder.payment_reference && `(${selectedOrder.payment_reference})`}</p>
              <p><span className="text-muted">Date:</span> {new Date(selectedOrder.created_at).toLocaleString()}</p>
              {selectedOrder.tracking_number && <p><span className="text-muted">Tracking:</span> {selectedOrder.tracking_number}</p>}
              {selectedOrder.estimated_delivery && <p><span className="text-muted">Est. Delivery:</span> {new Date(selectedOrder.estimated_delivery).toLocaleDateString()}</p>}
            </div>

            {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm mb-2">Items</h3>
                <div className="space-y-1 text-sm">
                  {selectedOrder.order_items.map((item, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{item.product_name} &times; {item.quantity}</span>
                      <span>{formatPrice(item.unit_price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                <button
                  onClick={() => updateStatus(selectedOrder.id, nextStatus[selectedOrder.status])}
                  disabled={updating === selectedOrder.id}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {updating === selectedOrder.id ? '...' : `Mark ${nextStatus[selectedOrder.status]}`}
                </button>
              )}
              <button
                onClick={() => deleteOrder(selectedOrder.id)}
                className="px-4 py-2 rounded-lg border border-danger text-danger text-sm hover:bg-danger/10 transition-colors"
              >
                Delete
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="Add tracking number..."
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-transparent text-sm"
              />
              <button
                onClick={() => updateTracking(selectedOrder.id)}
                disabled={updating === selectedOrder.id || !trackingInput.trim()}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-16 text-muted">No orders yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-muted">Order</th>
                <th className="text-left py-3 px-2 font-medium text-muted">Customer</th>
                <th className="text-left py-3 px-2 font-medium text-muted">Total</th>
                <th className="text-left py-3 px-2 font-medium text-muted">Status</th>
                <th className="text-left py-3 px-2 font-medium text-muted">Payment</th>
                <th className="text-left py-3 px-2 font-medium text-muted">Date</th>
                <th className="text-left py-3 px-2 font-medium text-muted">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-border hover:bg-secondary/50 transition-colors cursor-pointer"
                  onClick={() => { setSelectedOrder(order); setTrackingInput(order.tracking_number || '') }}
                >
                  <td className="py-3 px-2 font-medium">{order.id}</td>
                  <td className="py-3 px-2">
                    <p>{order.customer_name}</p>
                    <p className="text-xs text-muted">{order.customer_email}</p>
                  </td>
                  <td className="py-3 px-2">{formatPrice(order.total)}</td>
                  <td className="py-3 px-2">
                    <span className={cn('inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize', statusColors[order.status])}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 capitalize">{order.payment_status}</td>
                  <td className="py-3 px-2 text-muted text-xs">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-2">
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); updateStatus(order.id, nextStatus[order.status]) }}
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
    </div>
  )
}
