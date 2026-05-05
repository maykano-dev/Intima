'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ProductGalleryProps {
  images: string[]
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0)

  const displayImages = images.length > 0
    ? images
    : ['/placeholder.svg']

  const currentSrc = displayImages[selected] || '/placeholder.svg'

  return (
    <div className="space-y-4">
      <div className="relative aspect-square rounded-2xl bg-secondary overflow-hidden">
        {currentSrc !== '/placeholder.svg' ? (
          <Image
            src={currentSrc}
            alt="Product image"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl opacity-20 select-none">&#x2764;</span>
          </div>
        )}
      </div>
      {displayImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {displayImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={cn(
                'relative w-16 h-16 rounded-xl bg-secondary overflow-hidden flex-shrink-0 border-2 transition-colors',
                selected === i ? 'border-primary' : 'border-transparent hover:border-border'
              )}
            >
              {img !== '/placeholder.svg' ? (
                <Image
                  src={img}
                  alt={`Product thumbnail ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <span className="text-xl opacity-30">&#x2764;</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
