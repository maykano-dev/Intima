'use client'

import { useEffect } from 'react'

export default function RevealObserver() {
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal')
    if (!reveals.length) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('visible')
        })
      },
      { threshold: 0.12 }
    )
    reveals.forEach((r) => obs.observe(r))
    return () => obs.disconnect()
  }, [])

  return null
}
