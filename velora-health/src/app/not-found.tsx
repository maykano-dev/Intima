import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse" />
          <span className="text-6xl font-bold text-primary">404</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">Page Not Found</h1>
          <p className="text-muted text-lg">
            The page you are looking for doesn&apos;t exist or has been moved to a more discreet location.
          </p>
        </div>

        <div className="pt-4">
          <Link href="/">
            <Button variant="primary" size="lg" fullWidth>
              Return Home
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
