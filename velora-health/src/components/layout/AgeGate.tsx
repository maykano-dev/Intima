'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'

export default function AgeGate() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const verified = localStorage.getItem('intima-age-verified')
    if (verified === 'true') {
      setShow(false)
    }
  }, [])

  function handleVerify() {
    try {
      localStorage.setItem('intima-age-verified', 'true')
    } catch {
      // localStorage unavailable — dismiss anyway
    }
    setShow(false)
  }

  function handleDeny() {
    window.location.href = 'https://google.com'
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-lg animate-scale-in rounded-2xl bg-card p-8 shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Are You 18+?</h2>
          <p className="text-muted mb-6 max-w-sm mx-auto">
            Intima sells adult-oriented products. Please confirm you are 18 years or older to enter.
          </p>
          <div className="flex flex-col gap-3">
            <Button variant="primary" size="lg" fullWidth onClick={handleVerify}>
              Yes, I am 18 or Older
            </Button>
            <Button variant="ghost" size="lg" fullWidth onClick={handleDeny}>
              No, Leave Site
            </Button>
          </div>
          <p className="text-xs text-muted mt-4">
            By entering, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}
