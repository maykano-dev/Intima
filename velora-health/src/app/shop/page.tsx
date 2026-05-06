import { Suspense } from 'react'
import type { Metadata } from 'next'
import ShopContent from './ShopContent'

export const metadata: Metadata = {
  title: 'Shop Wellness & Lifestyle Essentials',
  description: 'Browse our curated collection of premium wellness products in Ghana. Discreetly packaged, anonymously delivered, and quality-guaranteed.',
  keywords: ['wellness products Ghana', 'lifestyle essentials Accra', 'discreet shopping Ghana', 'health and beauty Accra', 'Intima shop'],
}

export default function ShopPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Shop</h1>
        <p className="text-muted mt-1">Browse our curated collection of wellness products.</p>
      </div>
      <Suspense fallback={
        <div className="grid lg:grid-cols-4 gap-8">
          <aside className="lg:w-56 h-96 bg-surface animate-pulse rounded-2xl" />
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-surface animate-pulse aspect-square" />
            ))}
          </div>
        </div>
      }>
        <ShopContent />
      </Suspense>
    </div>
  )
}
