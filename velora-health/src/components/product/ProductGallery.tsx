'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ProductGalleryProps {
  images: string[]
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0)

  const displayImages = images.length > 0
    ? images
    : ['/placeholder.svg']

  return (
    <div className="space-y-4">
      <div className="aspect-square rounded-2xl bg-secondary flex items-center justify-center overflow-hidden">
        <span className="text-6xl opacity-20 select-none">&#x2764;</span>
      </div>
      {displayImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {displayImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={cn(
                'w-16 h-16 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 border-2 transition-colors',
                selected === i ? 'border-primary' : 'border-transparent hover:border-border'
              )}
            >
              <span className="text-xl opacity-30">&#x2764;</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
