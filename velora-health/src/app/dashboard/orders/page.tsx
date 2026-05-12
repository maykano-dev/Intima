'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatPrice, cn } from '@/lib/utils'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import PaymentModal from '@/components/checkout/PaymentModal'

interface OrderSummary {
  id: string
  total: number
  status: string
  payment_status: string
  created_at: string
  customer_phone: string
  tracking_number: string | null
  estimated_delivery: string | null
}

type PaymentStatus = 'idle' | 'pending' | 'otp_required' | 'paid' | 'failed'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  processing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
}

export default function DashboardOrders() {
  const router = useRouter()
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [payingId, setPayingId] = useState<string | null>(null)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [paymentConfig, setPaymentConfig] = useState<{
    total: number;
    orderId: string;
    phone: string;
    onSuccess: () => void;
  } | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null)

  async function loadOrders() {
    setLoading(true)
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

  useEffect(() => {
    loadOrders()
  }, [])

  async function handlePay(e: React.MouseEvent, order: OrderSummary) {
    e.preventDefault()
    e.stopPropagation()

    setPaymentConfig({
      total: order.total,
      orderId: order.id,
      phone: order.customer_phone || '',
      onSuccess: () => {
        setPaymentModalOpen(false)
        loadOrders()
      }
    })
    setPaymentModalOpen(true)
  }

  async function handleDelete(e: React.MouseEvent, orderId: string) {
    e.preventDefault()
    e.stopPropagation()
    setOrderToDelete(orderId)
    setDeleteModalOpen(true)
  }

  async function confirmDelete() {
    if (!orderToDelete) return
    
    setDeleting(true)
    try {
      const res = await fetch(`/api/orders?id=${orderToDelete}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setOrders(prev => prev.filter(o => o.id !== orderToDelete))
        setDeleteModalOpen(false)
        setOrderToDelete(null)
      } else {
        setFeedback({ 
          type: 'error', 
          title: 'Deletion Failed', 
          message: 'We could not delete this order. Please try again or contact support.' 
        })
      }
    } catch {
      setFeedback({ 
        type: 'error', 
        title: 'Network Error', 
        message: 'Please check your connection and try again.' 
      })
    } finally {
      setDeleting(false)
    }
  }


  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="h-8 bg-secondary/50 rounded w-48 mb-6 animate-pulse" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-secondary/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">My Orders</h1>
          <Link href="/shop" className="text-sm font-medium text-primary hover:underline">
            Shop More
          </Link>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-danger/10 text-danger text-sm mb-6">{error}</div>
        )}

        {orders.length === 0 ? (
          <div className="rounded-3xl border border-border p-12 text-center bg-card">
            <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">No orders found</h2>
            <p className="text-sm text-muted mb-8 max-w-xs mx-auto">Your order history is currently empty. Start shopping to fill it up!</p>
            <Button variant="primary" onClick={() => router.push('/shop')}>
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                className="group relative block rounded-2xl border border-border p-6 bg-card hover:border-primary/50 transition-all cursor-pointer overflow-hidden shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg">{order.id}</span>
                    <span className={cn(
                      'inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                      statusColors[order.status] || ''
                    )}>
                      {order.status === 'pending' ? 'Awaiting Payment' : order.status}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, order.id)}
                    className="p-2 text-muted hover:text-danger hover:bg-danger/10 rounded-full transition-all"
                    title="Delete Order"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center justify-between text-sm mb-4">
                  <div className="flex flex-col">
                    <span className="text-muted text-xs uppercase tracking-tighter">Order Date</span>
                    <span className="font-medium">
                      {new Date(order.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-muted text-xs uppercase tracking-tighter">Total Amount</span>
                    <span className="font-bold text-[#BFA075] text-lg">{formatPrice(order.total)}</span>
                  </div>
                </div>

                {order.payment_status !== 'paid' && order.status !== 'cancelled' && (
                  <div className="mt-4 pt-4 border-t border-border/50" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between bg-danger/5 p-4 rounded-xl">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wider text-danger">Unpaid Order</span>
                      </div>
                      <button
                        onClick={(e) => handlePay(e, order)}
                        className="px-6 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-dark shadow-sm hover:shadow-lg transition-all"
                      >
                        Pay Now
                      </button>
                    </div>
                  </div>
                )}
                {order.tracking_number && (
                  <div className="mt-4 p-3 rounded-lg bg-secondary/30 flex items-center gap-3 text-xs">
                    <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span className="text-muted">Tracking: <span className="font-bold text-foreground">{order.tracking_number}</span></span>
                    {order.estimated_delivery && (
                      <span className="text-muted border-l border-border pl-3 ml-auto italic">
                        Est: {new Date(order.estimated_delivery).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal 
        open={deleteModalOpen} 
        onClose={() => !deleting && setDeleteModalOpen(false)}
        className="max-w-md"
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4 text-danger">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">Delete Order?</h3>
          <p className="text-sm text-muted mb-8">
            Are you sure you want to delete order <span className="font-bold text-foreground">{orderToDelete}</span>? 
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              fullWidth 
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              fullWidth 
              onClick={confirmDelete}
              loading={deleting}
            >
              Delete Order
            </Button>
          </div>
        </div>
      </Modal>

      {/* Feedback Modal (Alert replacement) */}
      <Modal 
        open={!!feedback} 
        onClose={() => setFeedback(null)}
        className="max-w-sm"
      >
        <div className="text-center">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
            feedback?.type === 'success' ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
          )}>
            {feedback?.type === 'success' ? (
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <h3 className="text-lg font-bold mb-1">{feedback?.title}</h3>
          <p className="text-sm text-muted mb-6">{feedback?.message}</p>
          <Button variant="primary" fullWidth onClick={() => setFeedback(null)}>
            Dismiss
          </Button>
        </div>
      </Modal>

      {paymentConfig && (
        <PaymentModal
          open={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          total={paymentConfig.total}
          orderId={paymentConfig.orderId}
          initialPhone={paymentConfig.phone}
          onSuccess={paymentConfig.onSuccess}
        />
      )}
    </>
  )
}
