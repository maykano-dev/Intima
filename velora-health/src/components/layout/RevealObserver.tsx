'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function RevealObserver() {
  const pathname = usePathname()

  useEffect(() => {
    let observer: IntersectionObserver | null = null

    const initObserver = () => {
      const reveals = document.querySelectorAll('.reveal')
      
      if (!reveals.length) {
        // If no elements found yet, try again in a bit (handles slow hydration)
        return
      }

      // Cleanup existing observer if it exists
      if (observer) {
        observer.disconnect()
      }

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('active')
              // Once it's active, we can stop observing it
              observer?.unobserve(e.target)
            }
          })
        },
        { 
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px' // Trigger slightly before it's fully in view
        }
      )

      reveals.forEach((r) => {
        // If it's already active, don't observe
        if (!r.classList.contains('active')) {
          observer?.observe(r)
        }
      })
    }

    // Run multiple times to catch elements as they hydrate
    const timers = [
      setTimeout(initObserver, 100),
      setTimeout(initObserver, 500),
      setTimeout(initObserver, 1000),
      setTimeout(initObserver, 2000)
    ]

    return () => {
      timers.forEach(clearTimeout)
      if (observer) {
        observer.disconnect()
      }
    }
  }, [pathname]) // Re-run on every route change

  return null
}
