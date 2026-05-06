'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Product, Category } from '@/types'
import ProductGrid from '@/components/product/ProductGrid'
import { cn } from '@/lib/utils'

export default function ShopContent() {
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get('category')

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'popularity' | 'price-asc' | 'price-desc' | 'newest'>('popularity')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortMenuOpen, setSortMenuOpen] = useState(false)

  const sortOptions = [
    { id: 'popularity', label: 'Most Popular' },
    { id: 'price-asc', label: 'Price: Low to High' },
    { id: 'price-desc', label: 'Price: High to Low' },
    { id: 'newest', label: 'Newest First' },
  ] as const

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

  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 12

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

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, currentPage])

  const totalPages = Math.ceil(filtered.length / pageSize)

  useEffect(() => {
    setCurrentPage(1)
  }, [activeCategory, searchQuery, sortBy])

  const sortedCategories = useMemo(() => {
    if (!activeCategory) return categories
    const active = categories.find(c => c.id === activeCategory)
    if (!active) return categories
    return [active, ...categories.filter(c => c.id !== activeCategory)]
  }, [categories, activeCategory])

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <aside className="lg:w-56 flex-shrink-0">
        <div className="sticky top-24 space-y-6">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted mb-3">Categories</h3>
            <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 gap-2 no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
              <a
                href="/shop"
                className={cn(
                  'text-xs lg:text-sm px-4 py-2 rounded-full lg:rounded-lg transition-colors whitespace-nowrap',
                  !activeCategory ? 'bg-[#BFA075] text-[#0A1410]' : 'bg-secondary hover:bg-secondary/80 text-muted hover:text-foreground'
                )}
              >
                All Products
              </a>
              {sortedCategories.map((cat) => (
                <a
                  key={cat.id}
                  href={`/shop?category=${cat.id}`}
                  className={cn(
                    'text-xs lg:text-sm px-4 py-2 rounded-full lg:rounded-lg transition-colors whitespace-nowrap',
                    activeCategory === cat.id ? 'bg-[#BFA075] text-[#0A1410]' : 'bg-secondary hover:bg-secondary/80 text-muted hover:text-foreground'
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
          <div className="flex items-center justify-end">
            <div className="relative">
              <button
                onClick={() => setSortMenuOpen(!sortMenuOpen)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card/50 backdrop-blur-sm text-xs lg:text-sm hover:border-[#BFA075] transition-colors"
              >
                <span className="text-muted">Sort by:</span>
                <span className="font-medium">{sortOptions.find(o => o.id === sortBy)?.label}</span>
                <svg className={cn("w-4 h-4 transition-transform", sortMenuOpen && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {sortMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setSortMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#0F1E18]/80 backdrop-blur-xl border border-[rgba(242,232,223,0.1)] rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                    {sortOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => {
                          setSortBy(option.id as any)
                          setSortMenuOpen(false)
                        }}
                        className={cn(
                          "w-full text-left px-4 py-2.5 text-sm transition-colors",
                          sortBy === option.id 
                            ? "bg-[#BFA075] text-[#0A1410]" 
                            : "hover:bg-[rgba(242,232,223,0.05)] text-muted hover:text-foreground"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
          <>
            <ProductGrid products={paginatedProducts} />
            
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1
                    if (totalPages > 7) {
                      if (page !== 1 && page !== totalPages && Math.abs(page - currentPage) > 1) {
                        if (page === 2 || page === totalPages - 1) return <span key={page} className="px-1 text-muted">...</span>
                        return null
                      }
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          "w-10 h-10 rounded-lg text-sm font-medium transition-all",
                          currentPage === page 
                            ? "bg-[#BFA075] text-[#0A1410]" 
                            : "hover:bg-secondary text-muted hover:text-foreground"
                        )}
                      >
                        {page}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
