'use client'

import { useEffect, useState } from 'react'
import { formatPrice, cn } from '@/lib/utils'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

interface OrderItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  variant_option?: string
  variant_value?: string
  variant_image?: string
  product_image?: string
  product_link?: string
}

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
  shipping_method: string | null
  shipping_cost_ghs: number | null
  created_at: string
  order_items?: OrderItem[]
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
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [trackingInput, setTrackingInput] = useState('')
  const [shippingCostInput, setShippingCostInput] = useState('')
  const [shippingMethodInput, setShippingMethodInput] = useState('')
  const [statusInput, setStatusInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

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

  async function saveOrderChanges() {
    if (!selectedOrder) return
    setUpdating(selectedOrder.id)
    const updates = {
      status: statusInput,
      shipping_method: shippingMethodInput,
      shipping_cost_ghs: Number(shippingCostInput),
      tracking_number: trackingInput.trim()
    }
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: selectedOrder.id, ...updates }),
      })
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === selectedOrder.id ? { ...o, ...updates } : o)))
        setSelectedOrder((prev) => prev ? { ...prev, ...updates } : null)
        setFeedback({ type: 'success', title: 'Success', message: 'Order changes saved successfully.' })
      } else {
        setFeedback({ type: 'error', title: 'Error', message: 'Failed to save changes.' })
      }
    } catch {
      setFeedback({ type: 'error', title: 'Error', message: 'An unexpected error occurred.' })
    } finally {
      setUpdating(null)
    }
  }

  async function deleteOrder(id: string) {
    setOrderToDelete(id)
    setDeleteModalOpen(true)
  }

  async function confirmDelete() {
    if (!orderToDelete) return
    setDeleting(orderToDelete)
    try {
      const res = await fetch(`/api/admin/orders?id=${orderToDelete}`, { method: 'DELETE' })
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderToDelete))
        setSelectedOrder(null)
        setDeleteModalOpen(false)
        setOrderToDelete(null)
      } else {
        setFeedback({ type: 'error', title: 'Error', message: 'Failed to delete order.' })
      }
    } catch {
      setFeedback({ type: 'error', title: 'Error', message: 'Failed to delete order.' })
    } finally {
      setDeleting(null)
    }
  }

  const filteredOrders = orders.filter(order => {
    const q = searchQuery.toLowerCase()
    return (
      order.id.toLowerCase().includes(q) ||
      order.customer_name.toLowerCase().includes(q) ||
      order.customer_phone.toLowerCase().includes(q) ||
      order.customer_email.toLowerCase().includes(q)
    )
  })

  function toggleSelect(id: string) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  function toggleSelectAll() {
    setSelectedIds(prev => prev.length === filteredOrders.length ? [] : filteredOrders.map(o => o.id))
  }

  async function bulkUpdateStatus(status: string) {
    if (selectedIds.length === 0) return
    setLoading(true)
    try {
      await Promise.all(selectedIds.map(id => 
        fetch('/api/admin/orders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: id, status }),
        })
      ))
      setOrders(prev => prev.map(o => selectedIds.includes(o.id) ? { ...o, status } : o))
      setFeedback({ type: 'success', title: 'Bulk Update Success', message: `Updated ${selectedIds.length} orders to ${status}.` })
      setSelectedIds([])
    } catch {
      setFeedback({ type: 'error', title: 'Bulk Update Failed', message: 'Some updates may have failed.' })
    } finally {
      setLoading(false)
    }
  }

  async function bulkDelete() {
    if (selectedIds.length === 0) return
    setLoading(true)
    try {
      await Promise.all(selectedIds.map(id => 
        fetch(`/api/admin/orders?id=${id}`, { method: 'DELETE' })
      ))
      setOrders(prev => prev.filter(o => !selectedIds.includes(o.id)))
      setFeedback({ type: 'success', title: 'Bulk Delete Success', message: `Deleted ${selectedIds.length} orders.` })
      setSelectedIds([])
    } catch {
      setFeedback({ type: 'error', title: 'Bulk Delete Failed', message: 'Some deletions may have failed.' })
    } finally {
      setLoading(false)
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
    <>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input 
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-card border border-border text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={loadOrders}
            className="p-2 rounded-xl border border-border text-muted hover:bg-secondary transition-colors"
            title="Refresh"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold">{selectedIds.length} orders selected</span>
            <div className="h-4 w-px bg-primary/20" />
            <div className="flex items-center gap-2">
              <button 
                onClick={() => bulkUpdateStatus('processing')}
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                Mark Processing
              </button>
              <button 
                onClick={() => bulkUpdateStatus('shipped')}
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                Mark Shipped
              </button>
              <button 
                onClick={() => bulkUpdateStatus('delivered')}
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                Mark Delivered
              </button>
            </div>
          </div>
          <button 
            onClick={bulkDelete}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
          >
            Delete Selected
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-danger/10 text-danger text-sm mb-6">{error}</div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-lg font-bold font-mono text-xs">{selectedOrder.id}</h2>
                <p className="text-xs text-muted mt-0.5">{new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 hover:bg-secondary rounded-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2 p-4 rounded-xl bg-secondary/5 border border-border/50">
                  <h4 className="text-[10px] uppercase font-bold text-muted tracking-wider">Customer</h4>
                  <p className="font-medium">{selectedOrder.customer_name}</p>
                  <p className="text-muted">{selectedOrder.customer_email}</p>
                  <p className="text-muted">{selectedOrder.customer_phone}</p>
                </div>
                <div className="space-y-2 p-4 rounded-xl bg-secondary/5 border border-border/50">
                  <h4 className="text-[10px] uppercase font-bold text-muted tracking-wider">Order Info</h4>
                  <p><span className="text-muted">Total:</span> <span className="font-bold">{formatPrice(selectedOrder.total)}</span></p>
                  <p>
                    <span className="text-muted">Status: </span>
                    <span className={cn('inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize', statusColors[selectedOrder.status])}>{selectedOrder.status}</span>
                  </p>
                  <p><span className="text-muted">Payment:</span> {selectedOrder.payment_status} {selectedOrder.payment_reference && `(${selectedOrder.payment_reference})`}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-secondary/5 border border-border/50">
                <h4 className="text-[10px] uppercase font-bold text-muted tracking-wider mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.order_items?.map((item, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-lg bg-card border border-border/50">
                      {(item.variant_image || item.product_image) && (
                        <div className="w-14 h-14 rounded-lg overflow-hidden border border-border flex-shrink-0 bg-card">
                          <img src={item.variant_image || item.product_image || ''} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product_name}</p>
                        <p className="text-xs text-muted">
                          {formatPrice(item.unit_price)} &times; {item.quantity}
                          {item.variant_option && <span> &mdash; {item.variant_option}: {item.variant_value}</span>}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs font-semibold">{formatPrice(item.unit_price * item.quantity)}</span>
                          {item.product_link && (
                            <div className="flex items-center gap-1 ml-auto">
                              <a
                                href={item.product_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-primary hover:underline truncate max-w-[120px] inline-block"
                                title={item.product_link}
                              >
                                {item.product_link.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                              </a>
                              <button
                                type="button"
                                onClick={() => { navigator.clipboard.writeText(item.product_link || '') }}
                                className="p-1 rounded hover:bg-primary/10 text-primary transition-colors"
                                title="Copy supplier link"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-secondary/5 border border-border/50 space-y-4">
                <h4 className="text-[10px] uppercase font-bold text-muted tracking-wider">Update Order</h4>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted">Status</label>
                  <select 
                    value={statusInput} 
                    onChange={(e) => setStatusInput(e.target.value)}
                    className="w-full bg-card text-sm rounded-lg border border-border px-3 py-2 outline-none focus:ring-1 focus:ring-primary"
                  >
                    {['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted">Shipping Mode</label>
                    <select 
                      value={shippingMethodInput || 'sea'} 
                      onChange={(e) => setShippingMethodInput(e.target.value)}
                      className="w-full bg-card text-sm rounded-lg border border-border px-3 py-2 outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="sea">Sea Freight</option>
                      <option value="air">Air Freight</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted">Shipping Cost (GHS)</label>
                    <input 
                      type="number"
                      value={shippingCostInput}
                      onChange={(e) => setShippingCostInput(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-card text-sm rounded-lg border border-border px-3 py-2 outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted">Tracking Number</label>
                  <input 
                    type="text"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    placeholder="Enter tracking ID..."
                    className="w-full bg-card text-sm rounded-lg border border-border px-3 py-2 outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={saveOrderChanges}
                    disabled={updating === selectedOrder.id}
                    className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    {updating === selectedOrder.id ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => deleteOrder(selectedOrder.id)}
                    className="px-4 py-2.5 rounded-lg border border-danger text-danger text-sm hover:bg-danger/10 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 text-muted bg-card rounded-3xl border border-border/50">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium">No orders found matching your search.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-card rounded-3xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 px-4 text-left">
                  <input 
                    type="checkbox"
                    checked={selectedIds.length === filteredOrders.length && filteredOrders.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                </th>
                <th className="text-left py-3 px-2 font-bold text-xs uppercase tracking-wider text-muted">Order</th>
                <th className="text-left py-3 px-2 font-bold text-xs uppercase tracking-wider text-muted">Customer</th>
                <th className="text-left py-3 px-2 font-bold text-xs uppercase tracking-wider text-muted">Total</th>
                <th className="text-left py-3 px-2 font-bold text-xs uppercase tracking-wider text-muted">Status</th>
                <th className="text-left py-3 px-2 font-bold text-xs uppercase tracking-wider text-muted">Payment</th>
                <th className="text-left py-3 px-2 font-bold text-xs uppercase tracking-wider text-muted">Date</th>
                <th className="text-left py-3 px-2 font-bold text-xs uppercase tracking-wider text-muted">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className={cn(
                    "border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer",
                    selectedIds.includes(order.id) && "bg-primary/5"
                  )}
                  onClick={() => { 
                    setSelectedOrder(order); 
                    setStatusInput(order.status);
                    setTrackingInput(order.tracking_number || '');
                    setShippingCostInput(order.shipping_cost_ghs?.toString() || '');
                    setShippingMethodInput(order.shipping_method || '');
                  }}
                >
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox"
                      checked={selectedIds.includes(order.id)}
                      onChange={() => toggleSelect(order.id)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                  </td>
                  <td className="py-3 px-2 font-mono text-[10px] font-bold">{order.id}</td>
                  <td className="py-3 px-2">
                    <p className="font-bold">{order.customer_name}</p>
                    <p className="text-[10px] text-muted">{order.customer_email}</p>
                  </td>
                  <td className="py-3 px-2 font-bold text-xs">{formatPrice(order.total)}</td>
                  <td className="py-3 px-2">
                    <span className={cn('inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter', statusColors[order.status])}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 capitalize text-xs font-medium">{order.payment_status}</td>
                  <td className="py-3 px-2 text-muted text-[10px] font-medium">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <button
                          onClick={() => updateStatus(order.id, nextStatus[order.status])}
                          disabled={updating === order.id}
                          className="text-[10px] font-bold px-3 py-1 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50 uppercase"
                        >
                          {updating === order.id ? '...' : nextStatus[order.status]}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal open={deleteModalOpen} onClose={() => !deleting && setDeleteModalOpen(false)} className="max-w-md">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4 text-danger">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">Delete Order?</h3>
          <p className="text-sm text-muted mb-8">Are you sure you want to delete order <span className="font-bold text-foreground">{orderToDelete}</span>? This action cannot be undone.</p>
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setDeleteModalOpen(false)} disabled={!!deleting}>Cancel</Button>
            <Button variant="danger" fullWidth onClick={confirmDelete} loading={!!deleting}>Delete Order</Button>
          </div>
        </div>
      </Modal>

      {/* Feedback Modal */}
      <Modal open={!!feedback} onClose={() => setFeedback(null)} className="max-w-sm">
        <div className="text-center">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
            feedback?.type === 'success' ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
          )}>
            {feedback?.type === 'success' ? (
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            )}
          </div>
          <h3 className="text-lg font-bold mb-1">{feedback?.title}</h3>
          <p className="text-sm text-muted mb-6">{feedback?.message}</p>
          <Button variant="primary" fullWidth onClick={() => setFeedback(null)}>Dismiss</Button>
        </div>
      </Modal>
    </>
  )
}
