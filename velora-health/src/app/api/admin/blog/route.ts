import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { sanitizeInput, slugify } from '@/lib/utils'

export async function GET() {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('blog_posts')
      .select('*')
      .order('published_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Admin blog fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, slug, content, excerpt, image, author, published_at } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const postSlug = slug || slugify(title)

    const { data, error } = await getSupabaseAdmin()
      .from('blog_posts')
      .insert({
        title: sanitizeInput(title),
        slug: postSlug,
        content,
        excerpt: excerpt ? sanitizeInput(excerpt) : '',
        image: image || null,
        author: author || 'Intima Wellness Team',
        published_at: published_at || new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Admin blog create error:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, title, slug, content, excerpt, image, author, published_at } = body

    if (!id) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 })
    }

    const updates: Record<string, string> = {}
    if (title !== undefined) updates.title = sanitizeInput(title)
    if (slug !== undefined) updates.slug = slug
    if (content !== undefined) updates.content = content
    if (excerpt !== undefined) updates.excerpt = sanitizeInput(excerpt)
    if (image !== undefined) updates.image = image
    if (author !== undefined) updates.author = sanitizeInput(author)
    if (published_at !== undefined) updates.published_at = published_at

    const { data, error } = await getSupabaseAdmin()
      .from('blog_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Admin blog update error:', error)
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 })
    }

    const { error } = await getSupabaseAdmin()
      .from('blog_posts')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin blog delete error:', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
