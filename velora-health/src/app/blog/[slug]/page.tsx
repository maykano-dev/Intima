'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import type { BlogPost } from '@/types'
import Button from '@/components/ui/Button'

export default function BlogPostPage() {
  const { slug } = useParams()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/blog?slug=${slug}`)
        if (res.ok) {
          const data = await res.json()
          setPost(data)
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="space-y-4">
          <div className="h-6 bg-surface rounded w-1/4 animate-pulse" />
          <div className="h-10 bg-surface rounded w-3/4 animate-pulse" />
          <div className="h-64 bg-surface rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Post Not Found</h1>
        <p className="text-muted mb-6">This blog post does not exist.</p>
        <Link href="/blog">
          <Button variant="primary">Back to Blog</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <Link href="/blog" className="text-sm text-primary hover:underline mb-6 inline-block">
        &larr; Back to Blog
      </Link>

      <article>
        <header className="mb-8">
          <p className="text-sm text-muted">
            {new Date(post.published_at).toLocaleDateString('en-GB', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            {' · '}By {post.author}
          </p>
          <h1 className="text-3xl font-bold mt-2">{post.title}</h1>
          <p className="text-lg text-muted mt-3">{post.excerpt}</p>
        </header>

        <div className="aspect-video rounded-2xl bg-secondary flex items-center justify-center mb-8">
          <svg className="w-16 h-16 text-muted opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>

        <div className="prose prose-sm max-w-none text-muted space-y-4 leading-relaxed">
          <p>{post.content}</p>
          <p>
            This is a sample blog post. In production, this content would be loaded from your
            database or CMS. You can write detailed articles here about sexual health tips,
            product guides, relationship advice, and wellness education.
          </p>
        </div>
      </article>
    </div>
  )
}
