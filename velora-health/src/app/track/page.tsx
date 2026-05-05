'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function TrackPage() {
  const router = useRouter()
  const [orderId, setOrderId] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!orderId.trim()) {
      setError('Please enter your order ID')
      return
    }
    setError('')
    router.push(`/orders/${orderId.trim()}`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="max-w-md mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
        <p className="text-muted mb-8">
          Enter your order ID (e.g., INT-XXXXXXXX) to check your order status and delivery progress.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Order ID"
            value={orderId}
            onChange={(e) => { setOrderId(e.target.value); setError('') }}
            placeholder="INT-XXXXXXXX"
            error={error}
          />
          <Button type="submit" variant="primary" size="lg" fullWidth>
            Track Order
          </Button>
        </form>

        <p className="text-xs text-muted mt-6">
          Your order ID was sent to you after checkout via WhatsApp and email.
        </p>
      </div>
    </div>
  )
}
