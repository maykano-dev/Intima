import type { Metadata } from 'next'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Intima, Ghana\'s most discreet sexual wellness platform.',
}

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl lg:text-4xl font-bold mb-6">About Intima</h1>

        <div className="prose prose-sm max-w-none text-muted space-y-6">
          <p className="text-lg text-foreground leading-relaxed">
            Intima was created to solve a simple problem: accessing sexual wellness products in Ghana
            should be private, dignified, and stress-free.
          </p>

          <p>
            In Ghana, cultural stigma around sexual wellness creates a significant barrier to access. Many
            people want quality intimacy products but are uncomfortable buying them in person. Existing
            options are either informal WhatsApp resellers with no trust signals, or international stores
            with slow shipping and no local support.
          </p>

          <p>
            We founded Intima to fill this gap, combining international-quality products with local
            speed, local payment methods, and deep cultural sensitivity.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 my-12">
          {[
            { value: '100%', label: 'Discreet Packaging' },
            { value: 'Global', label: 'Sourced Worldwide' },
            { value: 'Reliable', label: 'Email Support' },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-6 rounded-2xl bg-secondary">
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="prose prose-sm max-w-none text-muted space-y-6">
          <h2 className="text-xl font-bold text-foreground">Our Values</h2>
          <ul>
            <li><strong>Privacy First.</strong> Every decision we make starts with protecting your privacy.</li>
            <li><strong>Quality Always.</strong> We only sell body-safe, tested products from verified manufacturers.</li>
            <li><strong>Honest Marketing.</strong> No false claims, no miracle cures, no exaggerated results.</li>
            <li><strong>Local Focus.</strong> Ghana-based, Ghana-owned, built for Ghanaian customers.</li>
          </ul>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Shop?</h2>
          <p className="text-muted mb-6">Experience the most discreet shopping experience in Ghana.</p>
          <Link href="/shop">
            <Button variant="primary" size="lg">Browse Products</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
