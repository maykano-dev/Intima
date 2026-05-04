'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { BlogPost } from '@/types'
import { truncate } from '@/lib/utils'

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/blog')
        if (res.ok) {
          const data = await res.json()
          setPosts(Array.isArray(data) ? data : [])
        }
      } catch {
        // Fallback empty
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="max-w-2xl mb-10">
        <h1 className="text-3xl font-bold">Wellness Journal</h1>
        <p className="text-muted mt-2">Tips, guides, and advice for your wellness journey.</p>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-surface animate-pulse h-80" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted">No posts yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="aspect-video bg-secondary flex items-center justify-center">
                <svg className="w-10 h-10 text-muted opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <div className="p-5">
                <p className="text-xs text-muted mb-2">{new Date(post.published_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <h2 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">{post.title}</h2>
                <p className="text-sm text-muted mt-2 line-clamp-2">{truncate(post.excerpt, 120)}</p>
                <span className="text-sm text-primary font-medium mt-3 inline-block group-hover:underline">
                  Read More
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
