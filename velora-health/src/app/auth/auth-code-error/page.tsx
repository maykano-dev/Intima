import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold">Verification Link Invalid</h1>
        <p className="text-muted text-sm">
          The link you clicked may have expired or has already been used. Please try registering again or contact support if the issue persists.
        </p>

        <div className="pt-4 space-y-3">
          <Link href="/register">
            <Button variant="primary" fullWidth>
              Return to Signup
            </Button>
          </Link>
          <Link href="/login" className="block text-sm text-primary hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
