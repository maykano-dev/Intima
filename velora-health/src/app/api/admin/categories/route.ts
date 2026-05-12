import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { sanitizeInput } from '@/lib/utils'

export async function GET() {
  try {
    const { data, error } = await getSupabaseAdmin()!
      .from('categories')
      .select('*')
      .order('name')

    if (error) throw error
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Admin categories fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, name, slug, description, image } = body

    if (!id || !name || !slug) {
      return NextResponse.json({ error: 'ID, name, and slug are required' }, { status: 400 })
    }

    const { data, error } = await getSupabaseAdmin()!
      .from('categories')
      .insert({
        id,
        name: sanitizeInput(name),
        slug: slug || id,
        description: description ? sanitizeInput(description) : '',
        image: image || null,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Admin category create error:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, name, slug, description, image } = body

    if (!id) {
      return NextResponse.json({ error: 'Category ID required' }, { status: 400 })
    }

    const updates: Record<string, string> = {}
    if (name !== undefined) updates.name = sanitizeInput(name)
    if (slug !== undefined) updates.slug = slug
    if (description !== undefined) updates.description = sanitizeInput(description)
    if (image !== undefined) updates.image = image

    const { data, error } = await getSupabaseAdmin()!
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Admin category update error:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Category ID required' }, { status: 400 })
    }

    const { error } = await getSupabaseAdmin()!
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin category delete error:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
