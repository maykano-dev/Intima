'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { formatPrice, cn } from '@/lib/utils'
import PaymentModal from '@/components/checkout/PaymentModal'

interface OrderItem {
  product_name: string
  quantity: number
  unit_price: number
}

interface Order {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_address: string
  city: string
  notes: string
  total: number
  status: string
  payment_status: string
  payment_reference: string
  discreet_packaging: boolean
  shipping_method: string | null
  shipping_cost_ghs: number | null
  shipping_payment_status: string | null
  shipping_payment_reference: string | null
  tracking_number: string | null
  estimated_delivery: string | null
  created_at: string
  order_items: OrderItem[]
}

type PaymentStatus = 'idle' | 'pending' | 'otp_required' | 'paid' | 'failed'

const statusSteps = ['pending', 'paid', 'processing', 'shipped', 'delivered']

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Awaiting Payment', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  paid: { label: 'Payment Confirmed', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  processing: { label: 'Processing', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
}

export default function DashboardOrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [changingShipping, setChangingShipping] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [paymentConfig, setPaymentConfig] = useState<{
    total: number;
    orderId: string;
    moolrePrefix?: string;
    onSuccess: () => void;
  } | null>(null)

  async function loadOrder() {
    try {
      const res = await fetch(`/api/user/orders?id=${id}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
      } else {
        const err = await res.json()
        setError(err.error || 'Order not found')
      }
    } catch {
      setError('Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrder()
  }, [id])

  async function handlePayOrder() {
    if (!order) return
    setPaymentConfig({
      total: order.total,
      orderId: order.id,
      onSuccess: () => {
        setPaymentModalOpen(false)
        loadOrder()
      }
    })
    setPaymentModalOpen(true)
  }

  async function handlePayShipping() {
    if (!order || !order.shipping_cost_ghs) return
    setPaymentConfig({
      total: order.shipping_cost_ghs,
      orderId: order.id,
      moolrePrefix: 'SHIP',
      onSuccess: async () => {
        await markShippingPaid(order.id)
        setPaymentModalOpen(false)
      }
    })
    setPaymentModalOpen(true)
  }

  async function markShippingPaid(orderId: string) {
    await fetch('/api/user/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId, shipping_payment_status: 'paid' }),
    })
    loadOrder()
  }

  async function updateShippingMethod(method: string) {
    setChangingShipping(true)
    try {
      const res = await fetch('/api/user/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: id, shipping_method: method }),
      })
      if (res.ok) loadOrder()
    } finally {
      setChangingShipping(false)
    }
  }

  async function confirmDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/user/orders?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        window.location.href = '/dashboard/orders'
      } else {
        const err = await res.json()
        setFeedback({ type: 'error', title: 'Error', message: err.error || 'Failed to delete order' })
      }
    } catch {
      setFeedback({ type: 'error', title: 'Error', message: 'Failed to delete order' })
    } finally {
      setDeleting(false)
      setDeleteModalOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto py-8 px-4">
        <div className="h-8 bg-surface rounded w-48 animate-pulse" />
        <div className="h-4 bg-surface rounded w-64 animate-pulse" />
        <div className="h-40 bg-surface rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="text-center py-16 max-w-4xl mx-auto px-4">
        <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
        <p className="text-muted mb-6">{error || 'No order matches that ID.'}</p>
        <Link href="/dashboard/orders">
          <Button variant="outline">Back to Orders</Button>
        </Link>
      </div>
    )
  }

  const currentIdx = statusSteps.indexOf(order.status)

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Link href="/dashboard/orders" className="text-sm text-primary hover:underline inline-flex items-center gap-1 mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to orders
          </Link>
          <h1 className="text-3xl font-bold">Order {order.id}</h1>
          <p className="text-muted mt-1 font-medium">
            Placed on {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        {order.payment_status !== 'paid' && order.status !== 'cancelled' && (
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="text-sm text-danger hover:bg-danger/10 px-4 py-2 rounded-xl transition-colors font-semibold"
          >
            Delete Order
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-border p-6 bg-card">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full" />
              Tracking
            </h2>
            <div className="relative pl-4">
              {statusSteps.map((s, i) => {
                const cfg = statusConfig[s]
                const isComplete = currentIdx >= i
                const isCurrent = currentIdx === i
                const isCancelled = order.status === 'cancelled'
                return (
                  <div key={s} className="flex items-start gap-6 pb-8 last:pb-0 relative">
                    {i < statusSteps.length - 1 && !isCancelled && (
                      <div className={cn(
                        'absolute left-[15px] top-10 w-0.5 h-full -z-10',
                        isComplete ? 'bg-primary' : 'bg-border'
                      )} />
                    )}
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all duration-500 shadow-sm',
                      isCancelled ? 'bg-danger/10 text-danger' :
                      isComplete ? 'bg-primary text-white scale-110' : 'bg-secondary text-muted'
                    )}>
                      {isCancelled ? '✕' : isCurrent ? '●' : isComplete ? '✓' : String(i + 1)}
                    </div>
                    <div className="pt-1 flex-1">
                      <div className="flex items-center justify-between">
                        <p className={cn(
                          'font-bold text-sm tracking-tight',
                          isCancelled && i === 0 ? 'text-danger' :
                          isCurrent ? 'text-foreground' :
                          isComplete ? 'text-foreground/80' : 'text-muted/50'
                        )}>
                          {isCancelled && i === 0 ? 'Cancelled' : cfg.label}
                        </p>
                        {isCurrent && !isCancelled && (
                          <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest', cfg.color)}>
                            Current
                          </span>
                        )}
                      </div>
                      {isCurrent && order.status === 'shipped' && (
                        <p className="text-xs text-muted mt-1 italic">Your package is on its way to you.</p>
                      )}
                      {isCancelled && i === 0 && (
                        <p className="text-xs text-danger mt-1 italic">This order was cancelled and will not be processed.</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-border p-6 bg-card">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full" />
              Order Items
            </h2>
            <div className="space-y-4">
              {(order.order_items || []).map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{item.product_name}</span>
                    <span className="text-xs text-muted">Quantity: {item.quantity}</span>
                  </div>
                  <span className="font-bold text-[#BFA075]">{formatPrice(item.unit_price * item.quantity)}</span>
                </div>
              ))}
              <div className="pt-4 flex justify-between items-center text-lg">
                <span className="font-bold">Total Amount</span>
                <span className="font-black text-primary">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-border p-6 bg-card h-fit">
            <h2 className="text-sm font-black uppercase tracking-widest text-muted mb-6">Order Details</h2>
            <div className="space-y-5">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-muted/60 tracking-wider">Payment Status</span>
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "font-bold text-sm px-3 py-1 rounded-lg w-fit",
                    order.payment_status === 'paid' ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                  )}>
                    {order.payment_status === 'pending' ? 'Awaiting Payment' : order.payment_status}
                  </span>
                  {order.payment_status !== 'paid' && order.status !== 'cancelled' && (
                    <Button variant="primary" size="sm" onClick={handlePayOrder}>Pay Now</Button>
                  )}
                </div>
              </div>

              {order.payment_reference && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-muted/60 tracking-wider">Reference</span>
                  <span className="font-mono text-xs break-all">{order.payment_reference}</span>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-muted/60 tracking-wider">Shipping</span>
                <div className="flex items-center justify-between">
                  {['pending', 'paid'].includes(order.status) ? (
                    <select 
                      value={order.shipping_method || 'sea'} 
                      onChange={(e) => updateShippingMethod(e.target.value)}
                      disabled={changingShipping}
                      className="bg-secondary text-xs font-bold rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-primary appearance-none pr-8 relative"
                    >
                      <option value="sea">Sea Freight</option>
                      <option value="air">Air Freight</option>
                    </select>
                  ) : (
                    <span className="font-bold text-sm capitalize">{order.shipping_method || 'Sea Freight'}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-muted/60 tracking-wider">Shipping Fee</span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">
                    {order.shipping_cost_ghs && order.shipping_cost_ghs > 0 
                      ? formatPrice(order.shipping_cost_ghs) 
                      : 'Calculating...'}
                  </span>
                  {order.shipping_cost_ghs && order.shipping_cost_ghs > 0 && order.shipping_payment_status !== 'paid' && (
                    <button
                      onClick={handlePayShipping}
                      className="text-[10px] bg-primary text-white px-4 py-1.5 rounded-full font-black uppercase tracking-widest hover:bg-primary-dark transition-all"
                    >
                      Pay Fee
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border p-6 bg-card">
            <h2 className="text-sm font-black uppercase tracking-widest text-muted mb-4">Address</h2>
            <div className="text-sm space-y-1.5">
              <p className="font-bold">{order.customer_name}</p>
              <p className="text-muted leading-relaxed">{order.customer_address}</p>
              <p className="text-muted">{order.city}</p>
              <p className="text-primary font-medium">{order.customer_phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal open={deleteModalOpen} onClose={() => !deleting && setDeleteModalOpen(false)}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4 text-danger">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">Delete Order?</h3>
          <p className="text-sm text-muted mb-8">This will permanently remove the order. This action cannot be undone.</p>
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setDeleteModalOpen(false)} disabled={deleting}>Cancel</Button>
            <Button variant="danger" fullWidth onClick={confirmDelete} loading={deleting}>Delete</Button>
          </div>
        </div>
      </Modal>

      {/* Feedback Modal */}
      <Modal open={!!feedback} onClose={() => setFeedback(null)}>
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

      {paymentConfig && (
        <PaymentModal
          open={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          total={paymentConfig.total}
          orderId={paymentConfig.moolrePrefix ? `${paymentConfig.moolrePrefix}-${paymentConfig.orderId}` : paymentConfig.orderId}
          initialPhone={order.customer_phone}
          onSuccess={paymentConfig.onSuccess}
        />
      )}
    </div>
  )
}
