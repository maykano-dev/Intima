'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { formatPrice, cn } from '@/lib/utils'

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
  tracking_number: string | null
  estimated_delivery: string | null
  shipped_at: string | null
  delivered_at: string | null
  discreet_packaging: boolean
  created_at: string
  order_items: OrderItem[]
}

const statusSteps = ['pending', 'paid', 'processing', 'shipped', 'delivered']

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Order Placed', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
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

  useEffect(() => {
    async function load() {
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
    load()
  }, [id])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-surface rounded w-48 animate-pulse" />
        <div className="h-4 bg-surface rounded w-64 animate-pulse" />
        <div className="h-40 bg-surface rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="text-center py-16">
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
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/orders" className="text-sm text-primary hover:underline inline-flex items-center gap-1 mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to orders
        </Link>
        <h1 className="text-2xl font-bold">Order {order.id}</h1>
        <p className="text-muted mt-1">
          Placed on {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="rounded-2xl border border-border p-6">
        <h2 className="font-semibold mb-4">Order Status</h2>
        <div className="relative">
          {statusSteps.map((s, i) => {
            const cfg = statusConfig[s]
            const isComplete = currentIdx >= i
            const isCurrent = currentIdx === i
            const isCancelled = order.status === 'cancelled'
            return (
              <div key={s} className="flex items-start gap-4 pb-6 last:pb-0 relative">
                {i < statusSteps.length - 1 && !isCancelled && (
                  <div className={cn(
                    'absolute left-[15px] top-8 w-0.5 h-full -z-10',
                    isComplete ? 'bg-primary' : 'bg-border'
                  )} />
                )}
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
                  isCancelled ? 'bg-danger/10 text-danger' :
                  isComplete ? 'bg-primary text-white' : 'bg-secondary text-muted'
                )}>
                  {isCancelled ? '✕' : isCurrent ? '●' : isComplete ? '✓' : String(i + 1)}
                </div>
                <div className="pt-1">
                  <p className={cn(
                    'font-medium text-sm',
                    isCancelled && i === 0 ? 'text-danger' :
                    isCurrent ? 'text-foreground' :
                    isComplete ? 'text-muted' : 'text-muted/50'
                  )}>
                    {isCancelled && i === 0 ? 'Cancelled' : cfg.label}
                  </p>
                  {isCurrent && !isCancelled && (
                    <span className={cn('inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium', cfg.color)}>
                      {order.status === 'shipped' ? 'On its way!' : 'Current'}
                    </span>
                  )}
                  {isCancelled && i === 0 && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                      This order was cancelled
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border p-5">
          <h2 className="font-semibold mb-3 text-sm">Order Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Payment</span>
              <span className="font-medium capitalize">{order.payment_status}</span>
            </div>
            {order.payment_reference && (
              <div className="flex justify-between">
                <span className="text-muted">Payment Ref</span>
                <span className="font-medium text-xs">{order.payment_reference}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted">Packaging</span>
              <span className="font-medium">{order.discreet_packaging ? 'Discreet' : 'Standard'}</span>
            </div>
            {order.tracking_number && (
              <div className="flex justify-between">
                <span className="text-muted">Tracking</span>
                <span className="font-medium">{order.tracking_number}</span>
              </div>
            )}
            {order.estimated_delivery && (
              <div className="flex justify-between">
                <span className="text-muted">Est. Delivery</span>
                <span className="font-medium">{new Date(order.estimated_delivery).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border p-5">
          <h2 className="font-semibold mb-3 text-sm">Delivery Address</h2>
          <div className="text-sm text-muted space-y-1">
            <p className="text-foreground font-medium">{order.customer_name}</p>
            <p>{order.customer_address}</p>
            <p>{order.city}</p>
            <p>{order.customer_phone}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border p-5">
        <h2 className="font-semibold mb-4">Items</h2>
        <div className="space-y-3">
          {(order.order_items || []).map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>{item.product_name} &times; {item.quantity}</span>
              <span className="font-medium">{formatPrice(item.unit_price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-border mt-4 pt-4 flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      {order.notes && (
        <div className="rounded-2xl border border-border p-5">
          <h2 className="font-semibold mb-2 text-sm">Order Notes</h2>
          <p className="text-sm text-muted">{order.notes}</p>
        </div>
      )}

      <div className="text-center">
        <Link href="/shop">
          <Button variant="primary">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  )
}
