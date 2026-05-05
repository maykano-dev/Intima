import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { blogPosts } from '@/lib/products-data'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    // Try fetching from Supabase first
    if (slug) {
      const { data, error } = await getSupabaseAdmin()
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        return NextResponse.json(data)
      }

      // Fallback to seed data
      const post = blogPosts.find((p) => p.slug === slug)
      if (post) {
        return NextResponse.json({ ...post, id: slug })
      }

      return NextResponse.json(null, { status: 404 })
    }

    // Try Supabase first
    const { data, error } = await getSupabaseAdmin()
      .from('blog_posts')
      .select('*')
      .order('published_at', { ascending: false })

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    if (data && data.length > 0) {
      return NextResponse.json(data)
    }

    // Fallback to seed data
    const posts = blogPosts.map((p, i) => ({
      id: String(i + 1),
      ...p,
    }))

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Blog API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}
