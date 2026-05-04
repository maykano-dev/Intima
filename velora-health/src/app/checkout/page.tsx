'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/components/cart/CartProvider'
import { formatPrice, sanitizeInput, isValidEmail, isValidGhanaPhone } from '@/lib/utils'
import { getPaystackPublicKey } from '@/lib/paystack'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { cn } from '@/lib/utils'

type ShippingMethod = 'express' | 'sea'

const SHIPPING_OPTIONS: Record<ShippingMethod, { label: string; price: number; time: string; desc: string }> = {
  sea: {
    label: 'Standard Sea',
    price: 25,
    time: '6–8 weeks',
    desc: 'Budget-friendly option. Best value for money.',
  },
  express: {
    label: 'Express Air',
    price: 65,
    time: '12–16 days',
    desc: 'Fast international shipping with priority handling.',
  },
}

interface FormData {
  name: string
  email: string
  phone: string
  address: string
  city: string
  notes: string
  discreet_packaging: boolean
}

interface FormErrors {
  [key: string]: string
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: {
        key: string
        email: string
        amount: number
        currency: string
        ref: string
        metadata: Record<string, unknown>
        callback: (response: { reference: string }) => void
        onClose: () => void
      }) => {
        openIframe: () => void
      }
    }
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('sea')
  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Accra',
    notes: '',
    discreet_packaging: true,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)

  const shipping = SHIPPING_OPTIONS[shippingMethod]
  const total = subtotal + shipping.price

  function validate(): boolean {
    const errs: FormErrors = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!isValidEmail(form.email)) errs.email = 'Invalid email address'
    if (!form.phone.trim()) errs.phone = 'Phone is required'
    else if (!isValidGhanaPhone(form.phone)) errs.phone = 'Enter a valid Ghana phone number (e.g., 024XXXXXXX)'
    if (!form.address.trim()) errs.address = 'Delivery address is required'
    if (!form.city.trim()) errs.city = 'City is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handlePayWithMoMo() {
    if (!validate()) return

    const paystackPublicKey = getPaystackPublicKey()
    if (!paystackPublicKey || paystackPublicKey.startsWith('pk_test_')) {
      setErrors({ email: 'Payment not configured.' })
      return
    }

    setSubmitting(true)
    setPaymentLoading(true)

    try {
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: sanitizeInput(form.name),
            email: sanitizeInput(form.email),
            phone: sanitizeInput(form.phone),
            address: sanitizeInput(form.address),
            city: sanitizeInput(form.city),
            notes: sanitizeInput(form.notes),
            discreet_packaging: form.discreet_packaging,
          },
          items: items.map((item) => ({
            product_id: item.product_id,
            product_name: item.name,
            quantity: item.quantity,
            unit_price: item.price_ghs,
          })),
          total,
          shipping_method: shippingMethod,
          shipping_price: shipping.price,
        }),
      })

      if (!orderRes.ok) throw new Error('Failed to create order')
      const order = await orderRes.json()

      const reference = `INT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      const handler = window.PaystackPop.setup({
        key: paystackPublicKey,
        email: form.email,
        amount: Math.round(total * 100),
        currency: 'GHS',
        ref: reference,
        metadata: {
          order_id: order.id,
          custom_fields: [
            { display_name: 'Customer Name', variable_name: 'customer_name', value: form.name },
            { display_name: 'Phone', variable_name: 'phone', value: form.phone },
          ],
        },
        callback: async (response) => {
          try {
            await fetch('/api/create-order', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                order_id: order.id,
                payment_reference: response.reference,
                status: 'paid',
              }),
            })
          } catch {
            // Handled by webhook
          }
          clearCart()
          router.push(`/order-confirmation/${order.id}?ref=${response.reference}`)
        },
        onClose: () => {
          setPaymentLoading(false)
          setSubmitting(false)
        },
      })
      handler.openIframe()
    } catch {
      setErrors({ email: 'Failed to process order. Please try again.' })
      setSubmitting(false)
      setPaymentLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Nothing to Checkout</h1>
        <p className="text-muted mb-6">Your cart is empty.</p>
        <Button variant="primary" onClick={() => router.push('/shop')}>
          Browse Products
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <h1 className="text-2xl lg:text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Delivery Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  error={errors.name}
                  placeholder="John Doe"
                />
              </div>
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                error={errors.email}
                placeholder="john@example.com"
              />
              <Input
                label="Phone (Ghana)"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                error={errors.phone}
                placeholder="024XXXXXXX"
              />
              <div className="sm:col-span-2">
                <Input
                  label="Delivery Address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  error={errors.address}
                  placeholder="Street address, landmark, digital address"
                />
              </div>
              <Input
                label="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                error={errors.city}
                placeholder="Accra"
              />
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Order Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none bg-card"
                  placeholder="Delivery instructions, gate code, etc."
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Shipping Method</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {(Object.entries(SHIPPING_OPTIONS) as [ShippingMethod, typeof SHIPPING_OPTIONS[ShippingMethod]][]).map(
                ([key, option]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setShippingMethod(key)}
                    className={cn(
                      'relative rounded-xl border-2 p-4 text-left transition-all',
                      shippingMethod === key
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted'
                    )}
                  >
                    {key === 'sea' && (
                      <div className="absolute -top-2.5 right-3 bg-primary text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        Recommended
                      </div>
                    )}
                    <div className="text-xl mb-1">{key === 'express' ? '\u2708\ufe0f' : '\u26f5'}</div>
                    <div className="font-semibold text-sm">{option.label}</div>
                    <div className="text-xs text-muted mt-0.5">{option.time}</div>
                    <div className="text-xs text-muted mt-1">{option.desc}</div>
                    <div className="font-bold text-sm mt-2">
                      {formatPrice(option.price)}
                    </div>
                  </button>
                )
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Privacy Options</h2>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.discreet_packaging}
                onChange={(e) => setForm({ ...form, discreet_packaging: e.target.checked })}
                className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <div>
                <span className="font-medium text-sm">Discreet Packaging</span>
                <p className="text-xs text-muted mt-0.5">
                  Plain, unbranded outer packaging. No product names or logos visible.
                  Neutral sender name on waybill.
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted line-clamp-1">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="font-medium ml-2">{formatPrice(item.price_ghs * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">
                  Shipping ({shipping.label})
                  <span className="block text-xs text-muted">{shipping.time}</span>
                </span>
                <span className="font-medium">{formatPrice(shipping.price)}</span>
              </div>
            </div>
            <div className="border-t border-border pt-3 flex justify-between text-base">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-lg">{formatPrice(total)}</span>
            </div>

            <div className="mt-6 space-y-3">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handlePayWithMoMo}
                loading={submitting && paymentLoading}
                disabled={submitting}
              >
                {paymentLoading ? 'Processing...' : `Pay ${formatPrice(total)}`}
              </Button>

              <div className="flex items-center justify-center gap-3 text-xs text-muted">
                <span>MTN MoMo</span>
                <span className="w-1 h-1 rounded-full bg-muted" />
                <span>Vodafone Cash</span>
                <span className="w-1 h-1 rounded-full bg-muted" />
                <span>Visa/MC</span>
              </div>
              <p className="text-xs text-muted text-center">
                Secure payment powered by Paystack. Your information is encrypted.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
