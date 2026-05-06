'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import type { Product, Review } from '@/types'
import { useCart } from '@/components/cart/CartProvider'
import { formatPrice } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import ProductGallery from '@/components/product/ProductGallery'
import ProductReviews from '@/components/product/ProductReviews'

export default function ProductPage() {
  const { slug } = useParams()
  const { addItem } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [productRes, reviewsRes] = await Promise.all([
          fetch(`/api/products?slug=${slug}`),
          fetch(`/api/reviews?product_slug=${slug}`),
        ])
        if (productRes.ok) {
          const data = await productRes.json()
          setProduct(data)
        }
        if (reviewsRes.ok) {
          const data = await reviewsRes.json()
          setReviews(Array.isArray(data) ? data : [])
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  function handleAddToCart() {
    if (!product) return
    addItem({
      product_id: product.id,
      name: product.name,
      price_ghs: product.price_ghs,
      image: product.images[0] || '',
      slug: product.slug,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="aspect-square rounded-2xl bg-surface animate-pulse" />
          <div className="space-y-4">
            <div className="h-4 bg-surface rounded w-1/4 animate-pulse" />
            <div className="h-8 bg-surface rounded w-3/4 animate-pulse" />
            <div className="h-6 bg-surface rounded w-1/3 animate-pulse" />
            <div className="h-20 bg-surface rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
        <p className="text-muted mb-6">This product does not exist or has been removed.</p>
        <Link href="/shop">
          <Button variant="primary">Browse Shop</Button>
        </Link>
      </div>
    )
  }

  const discount = product.compare_price_ghs
    ? Math.round((1 - product.price_ghs / product.compare_price_ghs) * 100)
    : 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <nav className="flex items-center gap-2 text-sm text-muted mb-6">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-foreground transition-colors">Shop</Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        <ProductGallery images={product.images} />

        <div className="flex flex-col">
          <span className="text-sm text-muted uppercase tracking-wider">
            {product.category_name || 'Wellness'}
          </span>
          <h1 className="text-2xl lg:text-3xl font-bold mt-1">{product.name}</h1>

          <div className="flex items-center gap-2 mt-3">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${i < Math.round(product.rating) ? 'text-amber-400' : 'text-gray-200 dark:text-gray-600'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-muted">
              {product.rating.toFixed(1)} ({product.review_count} reviews)
            </span>
          </div>

          <div className="flex items-baseline gap-3 mt-4">
            <span className="text-3xl font-bold">{formatPrice(product.price_ghs)}</span>
            {product.compare_price_ghs && (
              <>
                <span className="text-lg text-muted line-through">{formatPrice(product.compare_price_ghs)}</span>
                <Badge variant="success">Save {discount}%</Badge>
              </>
            )}
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <h3 className="font-semibold mb-1">Description</h3>
              <p className="text-sm text-muted leading-relaxed">{product.description}</p>
            </div>

            {product.benefits && (
              <div>
                <h3 className="font-semibold mb-1">Benefits</h3>
                <ul className="text-sm text-muted space-y-1">
                  {product.benefits.split('\n').map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.usage_guide && (
              <div>
                <h3 className="font-semibold mb-1">Usage Guide</h3>
                <p className="text-sm text-muted leading-relaxed">{product.usage_guide}</p>
              </div>
            )}

            {product.material && (
              <div>
                <h3 className="font-semibold mb-1">Material</h3>
                <p className="text-sm text-muted">{product.material}</p>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button variant="primary" size="lg" fullWidth onClick={handleAddToCart}>
              {added ? 'Added to Cart!' : 'Add to Cart'}
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
            {product.delivery_profile === 'local' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 text-success font-medium">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                In Stock in Ghana, Delivered in {product.lead_time || '1-3 Days'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Imported Item, Delivered in {product.lead_time || '7-14 Days'}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-muted">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Discreet packaging
            </span>
          </div>
        </div>
      </div>

      <div className="mt-16 lg:mt-20">
        <ProductReviews reviews={reviews} productId={product.id} />
      </div>
    </div>
  )
}
