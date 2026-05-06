import type { Metadata } from 'next'
import BlogContent from './BlogContent'

export const metadata: Metadata = {
  title: 'Wellness Journal | Tips & Lifestyle Advice',
  description: 'Explore the Intima Wellness Journal. Expert tips, lifestyle guides, and wellness advice for your daily journey.',
  keywords: ['wellness tips Ghana', 'lifestyle guides Accra', 'healthy living Ghana', 'wellness blog Accra', 'discreet health advice'],
}

export default function BlogPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="max-w-2xl mb-10">
        <h1 className="text-3xl font-bold">Wellness Journal</h1>
        <p className="text-muted mt-2">Tips, guides, and advice for your wellness journey.</p>
      </div>
      <BlogContent />
    </div>
  )
}
