'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Product } from '@/types'
import ProductCard from '@/components/product/ProductCard'
import Button from '@/components/ui/Button'

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/products?featured=true&limit=4')
        if (res.ok) {
          const data = await res.json()
          setProducts(data)
        }
      } catch {
        // Fallback handled by empty state
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-surface animate-pulse aspect-square" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) return null

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs uppercase tracking-widest text-primary font-semibold">Featured</span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-1">Bestselling Products</h2>
          </div>
          <Link href="/shop" className="hidden sm:block">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Link href="/shop">
            <Button variant="outline">View All Products</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
