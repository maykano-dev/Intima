'use client'

import { useEffect } from 'react'
import Button from '@/components/ui/Button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Production Error:', error)
  }, [error])

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative mx-auto w-24 h-24 bg-danger/10 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">Something went wrong</h1>
          <p className="text-muted text-lg">
            We encountered an unexpected error. Please try refreshing the page or returning home.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button variant="primary" size="lg" fullWidth onClick={() => reset()}>
            Try Again
          </Button>
          <Button variant="secondary" size="lg" fullWidth onClick={() => window.location.href = '/'}>
            Return Home
          </Button>
        </div>

        <p className="text-xs text-muted">
          If the problem persists, please contact our discreet support team.
        </p>
      </div>
    </div>
  )
}
