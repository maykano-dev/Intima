'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export default function BackToTop() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-card/80 backdrop-blur-md border border-border text-muted shadow-lg hover:shadow-xl hover:scale-105 hover:text-primary hover:border-primary active:scale-95 transition-all duration-300 flex items-center justify-center group",
        show ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0 pointer-events-none"
      )}
      aria-label="Back to top"
    >
      <svg 
        className="w-5 h-5 transition-transform group-hover:-translate-y-1" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  )
}
