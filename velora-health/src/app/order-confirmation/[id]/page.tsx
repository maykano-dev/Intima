'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'

function OrderConfirmationContent() {
  const { id } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const reference = searchParams.get('ref')

  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      router.push(`/dashboard/orders/${id}`)
    }
  }, [countdown, router, id])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-lg mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6 animate-scale-in">
          <svg className="w-10 h-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-muted mb-6">
          Thank you for your order. We&apos;ll send you a confirmation via WhatsApp and email shortly.
        </p>

        <div className="bg-secondary rounded-2xl p-6 mb-8 text-left space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Order Reference</span>
            <span className="font-medium">{id}</span>
          </div>
          {reference && (
            <div className="flex justify-between text-sm">
              <span className="text-muted">Payment Ref</span>
              <span className="font-medium">{reference}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted">Estimated Delivery</span>
            <span className="font-medium">Same-day (Accra) / 2-5 days (National)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Packaging</span>
            <span className="font-medium">100% Discreet</span>
          </div>
        </div>

        <p className="text-sm text-muted mb-6">
          We&apos;ll send you WhatsApp updates at each stage: Confirmed, Packed, and Out for Delivery.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={`/dashboard/orders/${id}`}>
            <Button variant="primary">View Order Details</Button>
          </Link>
          <Link href="/shop">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
        </div>

        {countdown > 0 && (
          <p className="text-xs text-muted mt-6 font-medium">
            Redirecting to your order dashboard in {countdown} seconds...
          </p>
        )}
      </div>
    </div>
  )
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-surface animate-pulse mx-auto mb-6" />
        <div className="h-8 bg-surface rounded w-48 mx-auto mb-4 animate-pulse" />
        <div className="h-4 bg-surface rounded w-64 mx-auto animate-pulse" />
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  )
}
