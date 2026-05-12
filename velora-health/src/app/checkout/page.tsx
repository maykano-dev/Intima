'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useCart } from '@/components/cart/CartProvider'
import { formatPrice, sanitizeInput, isValidGhanaPhone, cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import PaymentModal from '@/components/checkout/PaymentModal'

type ShippingMethod = 'sea' | 'air'

interface SavedAddress {
  id: string
  address: string
  city: string
  is_default: boolean
}

interface FormData {
  phone: string
  address: string
  city: string
  notes: string
  discreet_packaging: boolean
}

interface FormErrors {
  [key: string]: string
}

type PaymentStatus = 'idle' | 'pending' | 'otp_required' | 'paid' | 'failed'

export default function CheckoutPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { items, subtotal, clearCart, openDrawer } = useCart()
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('sea')
  const [profile, setProfile] = useState<{ full_name?: string; email?: string } | null>(null)
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [form, setForm] = useState<Omit<FormData, 'name' | 'email'>>({
    phone: '',
    address: '',
    city: 'Accra',
    notes: '',
    discreet_packaging: true,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle')
  const [paymentMessage, setPaymentMessage] = useState('')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  const groups = useMemo(() => {
    const local = items.filter((i) => i.delivery_profile === 'local')
    const standard = items.filter((i) => i.delivery_profile !== 'local')
    return { local, standard }
  }, [items])

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch('/api/auth/session')
      if (res.ok) {
        const data = await res.json()
        if (!data.user) {
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
        } else {
          setAuthenticated(true)
          // Get profile
          const profileRes = await fetch('/api/user/settings')
          if (profileRes.ok) {
            const profileData = await profileRes.json()
            setProfile(profileData)
            setForm(f => ({ ...f, phone: profileData.phone || '' }))
          }
          // Get addresses
          const addrRes = await fetch('/api/user/addresses')
          if (addrRes.ok) {
            const addrs = await addrRes.json()
            setSavedAddresses(addrs)
            const def = addrs.find((a: SavedAddress) => a.is_default) || addrs[0]
            if (def) {
              setForm(f => ({ ...f, address: def.address, city: def.city }))
              setIsEditingAddress(false)
            } else {
              setIsEditingAddress(true)
            }
          } else {
            setIsEditingAddress(true)
          }
        }
      }
      setAuthChecked(true)
    }
    checkAuth()
  }, [router, pathname])

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!authenticated) return null


  const isMixed = groups.local.length > 0 && groups.standard.length > 0

  const shippingOptions = {
    sea: { label: 'Sea Freight', price: 0, time: '6-8 weeks', desc: 'Shipping costs will be calculated and billed after your order is processed.' },
    air: { label: 'Air Freight', price: 0, time: '10-16 days', desc: 'Shipping costs will be calculated and billed after your order is processed.' },
  } as const

  const shipping = shippingOptions[shippingMethod]
  const serviceFee = subtotal * 0.1
  const total = subtotal + serviceFee + shipping.price

  function validate(): boolean {
    const errs: FormErrors = {}
    if (!form.phone.trim()) errs.phone = 'Phone is required'
    else if (!isValidGhanaPhone(form.phone)) errs.phone = 'Enter a valid Ghana phone number (e.g., 024XXXXXXX)'
    if (!form.address.trim()) errs.address = 'Delivery address is required'
    if (!form.city.trim()) errs.city = 'City is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handlePayWithMoMo() {
    if (!validate() || !profile) return

    setSubmitting(true)
    setPaymentLoading(true)
    setPaymentStatus('pending')
    setPaymentMessage('Creating your order...')

    try {
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: profile.full_name || 'Customer',
            email: profile.email || '',
            phone: sanitizeInput(form.phone),
            address: sanitizeInput(form.address),
            city: sanitizeInput(form.city),
            notes: sanitizeInput(form.notes),
            discreet_packaging: form.discreet_packaging,
          },
          items: items.map((item) => ({
            product_id: item.product_id,
            product_name: item.name + (item.variant_value ? ` (${item.variant_value})` : ''),
            quantity: item.quantity,
            unit_price: item.price_ghs,
            variant_option: item.variant_option || '',
            variant_value: item.variant_value || '',
            variant_image: item.variant_image || '',
          })),
          total,
          shipping_method: shippingMethod,
          shipping_cost: shipping.price,
        }),
      })

      if (!orderRes.ok) throw new Error('Failed to create order')
      const order = await orderRes.json()
      setOrderId(order.id)
      
      // Open the premium payment modal
      setShowPaymentModal(true)
      setSubmitting(false)
      setPaymentLoading(false)
      setPaymentStatus('idle') // Reset local state as modal takes over
    } catch {
      setPaymentStatus('failed')
      setPaymentMessage('Failed to create order. Please try again.')
      setSubmitting(false)
      setPaymentLoading(false)
    }
  }

  function handlePaymentSuccess() {
    clearCart()
    router.push(`/order-confirmation/${orderId}`)
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
      <div className="flex items-center gap-4 mb-8">
        <button onClick={openDrawer} className="text-sm font-medium text-primary hover:underline flex items-center gap-2">
          &larr; Back to Cart
        </button>
        <h1 className="text-2xl lg:text-3xl font-bold">Checkout</h1>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Delivery Details</h2>
              {savedAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(!isEditingAddress)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {isEditingAddress ? 'Cancel' : 'Change Address'}
                </button>
              )}
            </div>

            {!isEditingAddress && savedAddresses.length > 0 ? (
              <div className="p-4 rounded-xl border border-border bg-card">
                <p className="font-medium text-sm">{profile?.full_name}</p>
                <p className="text-sm text-muted mt-1">{form.address}</p>
                <p className="text-sm text-muted">{form.city}</p>
                <p className="text-sm text-muted mt-2">{form.phone}</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Phone (Ghana)"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  error={errors.phone}
                  placeholder="024XXXXXXX"
                />
                <Input
                  label="City"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  error={errors.city}
                  placeholder="Accra"
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
                {savedAddresses.length > 0 && (
                  <div className="sm:col-span-2 space-y-2">
                    <p className="text-xs font-medium text-muted uppercase tracking-wider">Select Saved Address</p>
                    <div className="grid grid-cols-1 gap-2">
                      {savedAddresses.map((addr) => (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => {
                            setForm({ ...form, address: addr.address, city: addr.city })
                            setIsEditingAddress(false)
                          }}
                          className="text-left p-3 rounded-lg border border-border hover:border-primary transition-colors text-sm"
                        >
                          <p className="font-medium">{addr.address}</p>
                          <p className="text-xs text-muted">{addr.city}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4">
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

          <div className="rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Shipping Method</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {(Object.entries(shippingOptions) as [ShippingMethod, typeof shippingOptions[ShippingMethod]][]).map(
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
                    <div className="text-xl mb-1">{key === 'air' ? '\u2708\ufe0f' : '\u26f5'}</div>
                    <div className="font-semibold text-sm">{option.label}</div>
                    <div className="text-xs text-muted mt-0.5">{option.time}</div>
                    <div className="text-xs text-muted mt-1">{option.desc}</div>
                    <div className="font-bold text-sm mt-2">
                      {option.price === 0 ? 'Billed Later' : formatPrice(option.price)}
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
            {isMixed && (
              <p className="text-xs text-muted mb-3 pb-3 border-b border-border">
                Items may arrive in separate packages at different times.
              </p>
            )}
            <div className="space-y-4 mb-4">
              {groups.local.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-success font-semibold mb-2">In Stock in Ghana</p>
                  {groups.local.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm py-1">
                      <span className="text-muted line-clamp-1 flex-1">{item.name} x{item.quantity}</span>
                      <span className="font-medium ml-2">{formatPrice(item.price_ghs * item.quantity)}</span>
                    </div>
                  ))}
                  <p className="text-[10px] text-success/70 mt-1">Arrives in {groups.local[0]?.lead_time || '1-3 Days'}</p>
                </div>
              )}
              {groups.standard.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-2">Imported Item</p>
                  {groups.standard.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm py-1">
                      <span className="text-muted line-clamp-1 flex-1">{item.name} x{item.quantity}</span>
                      <span className="font-medium ml-2">{formatPrice(item.price_ghs * item.quantity)}</span>
                    </div>
                  ))}
                  <p className="text-[10px] text-primary/70 mt-1">Estimated Arrival: {shipping.time}</p>
                </div>
              )}
            </div>
            <div className="border-t border-border pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Items Total</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Service Fee</span>
                <span className="font-medium">{formatPrice(serviceFee)}</span>
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
                loading={submitting || paymentLoading}
                disabled={submitting}
              >
                {submitting ? 'Processing...' : `Pay ${formatPrice(total)}`}
              </Button>

              <p className="text-xs text-muted text-center pt-2">
                Secure payment powered by Moolre. Pay with Mobile Money.
              </p>

              {paymentStatus === 'failed' && paymentMessage && (
                <p className="text-xs text-danger text-center bg-danger/5 py-2 px-3 rounded-lg border border-danger/20">{paymentMessage}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <PaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        total={total}
        orderId={orderId || ''}
        initialPhone={form.phone}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  )
}
