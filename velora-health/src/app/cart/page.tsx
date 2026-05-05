'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/components/cart/CartProvider'
import { formatPrice, cn } from '@/lib/utils'
import Button from '@/components/ui/Button'

export default function CartPage() {
  const { items, subtotal, itemCount, updateQuantity, removeItem, clearCart } = useCart()

  const groups = useMemo(() => {
    const local = items.filter((i) => i.delivery_profile === 'local')
    const standard = items.filter((i) => i.delivery_profile !== 'local')
    return { local, standard }
  }, [items])

  const isMixed = groups.local.length > 0 && groups.standard.length > 0

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="max-w-md mx-auto">
          <svg className="w-20 h-20 mx-auto text-muted mb-6 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h1 className="text-2xl font-bold mb-2">Your Cart is Empty</h1>
          <p className="text-muted mb-6">Looks like you haven&apos;t added anything yet.</p>
          <Link href="/shop">
            <Button variant="primary" size="lg">Browse Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  function renderItemGroup(groupItems: typeof items, title: string, badge: string, badgeClass: string) {
    if (groupItems.length === 0) return null
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-semibold">{title}</h3>
          <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', badgeClass)}>{badge}</span>
        </div>
        <div className="space-y-3">
          {groupItems.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 rounded-2xl border border-border">
              <div className="relative w-20 h-20 rounded-xl bg-secondary overflow-hidden flex-shrink-0">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-2xl opacity-30">&#x2764;</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/product/${item.slug}`} className="font-medium hover:text-primary transition-colors line-clamp-1">
                  {item.name}
                </Link>
                <p className="text-sm text-muted mt-0.5">{formatPrice(item.price_ghs)}</p>
                <p className="text-xs text-muted mt-0.5">
                  {item.delivery_profile === 'local' ? 'Arrives in ' : 'Arrives in '}{item.lead_time || (item.delivery_profile === 'local' ? '1-3 Days' : '7-14 Days')}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border border-border rounded-lg">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-secondary transition-colors text-sm">-</button>
                    <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-secondary transition-colors text-sm">+</button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-sm text-danger hover:underline">Remove</button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatPrice(item.price_ghs * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold">Cart ({itemCount})</h1>
        <button onClick={clearCart} className="text-sm text-danger hover:underline">Clear Cart</button>
      </div>

      {isMixed && (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm text-muted mb-6">
          Your cart contains items from different fulfillment groups and may arrive in separate packages at different times.
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {renderItemGroup(groups.local, 'Ready to Ship', 'In Stock Locally', 'bg-success/10 text-success')}
          {renderItemGroup(groups.standard, 'Standard Fulfillment', 'Discreet Delivery', 'bg-primary/10 text-primary')}
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-border p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Delivery</span>
                <span className="font-medium">Calculated at checkout</span>
              </div>
              {isMixed && (
                <p className="text-xs text-muted border-t border-border pt-3">
                  Items may be delivered in separate shipments. Delivery estimates shown per item.
                </p>
              )}
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
            </div>
            <Link href="/checkout" className="block mt-6">
              <Button variant="primary" size="lg" fullWidth>Proceed to Checkout</Button>
            </Link>
            <Link href="/shop" className="block text-center text-sm text-primary hover:underline mt-3">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
