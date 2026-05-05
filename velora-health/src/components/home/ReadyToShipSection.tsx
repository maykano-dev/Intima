'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Product } from '@/types'
import { formatPrice } from '@/lib/utils'

export default function ReadyToShipSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/products')
        if (res.ok) {
          const all: Product[] = await res.json()
          const local = all.filter((p) => p.delivery_profile === 'local' && p.in_stock)
          setProducts(local.slice(0, 4))
        }
      } catch {
        // Fallback empty
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <section className="py-20 px-6 sm:px-12 lg:px-24 bg-cream">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 bg-surface rounded w-48 mb-8 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-surface rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) return null

  return (
    <section className="py-20 px-6 sm:px-12 lg:px-24 bg-cream">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="section-eyebrow">Fast Delivery</p>
            <h2 className="font-serif text-[clamp(2rem,3vw,3rem)] font-light text-accent leading-[1.15]">
              Ready to Ship<br />
              <em className="italic text-primary">Available Now</em>
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden sm:inline-block text-[0.8rem] tracking-[0.12em] uppercase text-primary hover:text-primary-dark transition-colors"
          >
            View All &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              className="group relative rounded-2xl bg-card border border-border overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="aspect-square bg-secondary/50 flex items-center justify-center p-6">
                <span className="text-5xl opacity-20 group-hover:opacity-30 transition-opacity">&#x2764;</span>
              </div>
              <div className="p-4">
                <p className="text-xs text-muted uppercase tracking-wider mb-1">{p.category_name}</p>
                <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">{p.name}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-semibold">{formatPrice(p.price_ghs)}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">
                    In Stock
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link
            href="/shop"
            className="inline-block text-[0.8rem] tracking-[0.12em] uppercase text-primary hover:text-primary-dark transition-colors"
          >
            View All Products &rarr;
          </Link>
        </div>
      </div>
    </section>
  )
}
