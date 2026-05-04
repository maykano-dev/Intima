'use client'

import { Suspense, useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Product, Category } from '@/types'
import ProductGrid from '@/components/product/ProductGrid'
import { cn } from '@/lib/utils'

function ShopContent() {
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get('category')

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'popularity' | 'price-asc' | 'price-desc' | 'newest'>('popularity')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/products?categories=true'),
        ])
        if (productsRes.ok) {
          const data = await productsRes.json()
          setProducts(Array.isArray(data) ? data : [])
        }
        if (categoriesRes.ok) {
          const data = await categoriesRes.json()
          setCategories(Array.isArray(data) ? data : [])
        }
      } catch {
        // Fallback empty
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let result = [...products]
    if (activeCategory) {
      result = result.filter((p) => p.category_id === activeCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.category_name || '').toLowerCase().includes(q)
      )
    }
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price_ghs - b.price_ghs)
        break
      case 'price-desc':
        result.sort((a, b) => b.price_ghs - a.price_ghs)
        break
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      default:
        result.sort((a, b) => b.review_count - a.review_count)
    }
    return result
  }, [products, activeCategory, sortBy, searchQuery])

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <aside className="lg:w-56 flex-shrink-0">
        <div className="sticky top-24 space-y-6">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted mb-3">Categories</h3>
            <div className="flex lg:flex-col flex-wrap gap-2">
              <a
                href="/shop"
                className={cn(
                  'text-sm px-3 py-1.5 rounded-lg transition-colors',
                  !activeCategory ? 'bg-primary text-white' : 'hover:bg-secondary'
                )}
              >
                All Products
              </a>
              {categories.map((cat) => (
                <a
                  key={cat.id}
                  href={`/shop?category=${cat.id}`}
                  className={cn(
                    'text-sm px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap',
                    activeCategory === cat.id ? 'bg-primary text-white' : 'hover:bg-secondary'
                  )}
                >
                  {cat.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-lg border border-border pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-card"
            />
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted whitespace-nowrap">
              {filtered.length} product{filtered.length !== 1 ? 's' : ''}
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="text-sm border border-border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary bg-card"
            >
              <option value="popularity">Most Popular</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-surface animate-pulse aspect-square" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-12 h-12 mx-auto text-muted mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-muted font-medium">
              {searchQuery ? `No products matching "${searchQuery}"` : 'No products found in this category.'}
            </p>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-sm text-primary hover:underline mt-2">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <ProductGrid products={filtered} />
        )}
      </div>
    </div>
  )
}

export default function ShopPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Shop</h1>
        <p className="text-muted mt-1">Browse our curated collection of wellness products.</p>
      </div>
      <Suspense fallback={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-surface animate-pulse aspect-square" />
          ))}
        </div>
      }>
        <ShopContent />
      </Suspense>
    </div>
  )
}
