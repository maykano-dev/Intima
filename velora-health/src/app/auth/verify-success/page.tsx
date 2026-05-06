'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function VerifySuccessPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/login')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative mx-auto w-24 h-24">
          {/* Success Ring Animation */}
          <div className="absolute inset-0 rounded-full border-4 border-success/20 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-4 border-success border-t-transparent animate-spin duration-700" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-success transform scale-100 animate-in zoom-in duration-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">Email Verified!</h1>
          <p className="text-muted text-lg">
            Your account has been successfully validated.
          </p>
        </div>

        <div className="bg-secondary/30 rounded-2xl p-6 border border-border">
          <p className="text-sm font-medium mb-4">
            Redirecting you to login in <span className="text-primary font-bold text-xl">{countdown}</span> seconds...
          </p>
          <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-1000 ease-linear"
              style={{ width: `${(countdown / 5) * 100}%` }}
            />
          </div>
        </div>

        <div className="pt-4">
          <Link href="/login">
            <Button variant="primary" size="lg" fullWidth>
              Go to Login Now
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted">
          Absolute Privacy. Discreet Fulfillment. Intima Wellness.
        </p>
      </div>
    </div>
  )
}
