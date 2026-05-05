'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/components/cart/CartProvider'
import { formatPrice, truncate, cn } from '@/lib/utils'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  variant?: 'default' | 'compact'
}

export default function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const { addItem } = useCart()

  return (
    <div className={cn(
      'group bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
      variant === 'compact' && 'rounded-xl'
    )}>
      <Link href={`/product/${product.slug}`} className="block">
        <div className={cn(
          'relative aspect-square bg-secondary overflow-hidden',
          variant === 'compact' && 'aspect-[4/3]'
        )}>
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl opacity-30 select-none">&#x2764;</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>

      <div className={cn('p-4', variant === 'compact' && 'p-3')}>
        <span className="text-xs text-muted uppercase tracking-wider">{product.category_name || 'Wellness'}</span>
        <Link href={`/product/${product.slug}`}>
          <h3 className={cn(
            'font-semibold mt-0.5 group-hover:text-primary transition-colors',
            variant === 'compact' ? 'text-sm' : 'text-base'
          )}>
            {truncate(product.name, 40)}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mt-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              className={cn('w-3.5 h-3.5', i < Math.round(product.rating) ? 'text-amber-400' : 'text-gray-200 dark:text-gray-600')}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="text-xs text-muted ml-1">({product.review_count})</span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">{formatPrice(product.price_ghs)}</span>
            {product.compare_price_ghs && (
              <span className="text-sm text-muted line-through">{formatPrice(product.compare_price_ghs)}</span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault()
              addItem({
                product_id: product.id,
                name: product.name,
                price_ghs: product.price_ghs,
                image: product.images[0] || '',
                slug: product.slug,
              })
            }}
            className="w-9 h-9 flex-shrink-0 rounded-full bg-[#BFA075] text-[#0A1410] flex items-center justify-center hover:bg-[#F2E8DF] transition-colors active:scale-95 shadow-sm"
            aria-label="Add to cart"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
