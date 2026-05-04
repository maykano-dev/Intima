'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { testimonials } from '@/lib/products-data'

export default function Testimonials() {
  const [active, setActive] = useState(0)

  const t = testimonials[active]

  return (
    <section className="py-16 lg:py-24 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest text-primary font-semibold">Testimonials</span>
          <h2 className="text-2xl sm:text-3xl font-bold mt-2">Real People, Real Privacy</h2>
          <p className="text-muted mt-3">Hear from customers who trusted us with their privacy.</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-card rounded-3xl p-8 lg:p-10 shadow-sm border border-border">
            <div className="flex gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={cn('w-5 h-5', i < t.rating ? 'text-amber-400' : 'text-gray-200 dark:text-gray-600')}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <blockquote className="text-lg text-foreground leading-relaxed mb-6">
              &ldquo;{t.text}&rdquo;
            </blockquote>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm text-muted">{t.location} &middot; Ordered {t.product}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={cn(
                  'w-2.5 h-2.5 rounded-full transition-all duration-300',
                  i === active ? 'bg-primary w-8' : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                )}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
