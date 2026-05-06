import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { sanitizeInput, slugify } from '@/lib/utils'

export async function GET() {
  try {
    const { data, error } = await getSupabaseAdmin()!
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false })

    if (error) throw error

    const productIds = (data || []).map((item: Record<string, unknown>) => item.id).filter(Boolean)

    let variantsMap: Record<string, unknown[]> = {}
    if (productIds.length > 0) {
      const { data: variants } = await getSupabaseAdmin()!
        .from('product_variants')
        .select('*')
        .in('product_id', productIds)
        .order('sort_order', { ascending: true })
      if (variants) {
        for (const v of variants) {
          const pid = v.product_id as string
          if (!variantsMap[pid]) variantsMap[pid] = []
          variantsMap[pid].push(v)
        }
      }
    }

    const transformed = (data || []).map((item: Record<string, unknown>) => ({
      ...item,
      category_name: (item.categories as { name?: string })?.name || null,
      categories: undefined,
      variants: variantsMap[item.id as string] || [],
    }))

    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Admin products fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, slug, description, benefits, usage_guide, material, price_ghs, compare_price_ghs, images, category_id, in_stock, is_featured, product_link, variants } = body

    if (!name || !price_ghs || !category_id) {
      return NextResponse.json({ error: 'Name, price, and category are required' }, { status: 400 })
    }

    const productSlug = slug || slugify(name)

    const { data, error } = await getSupabaseAdmin()!
      .from('products')
      .insert({
        name: sanitizeInput(name),
        slug: productSlug,
        description: description ? sanitizeInput(description) : '',
        benefits: benefits || '',
        usage_guide: usage_guide || '',
        material: material || '',
        price_ghs,
        compare_price_ghs: compare_price_ghs || null,
        images: images || [],
        product_link: product_link || null,
        category_id,
        in_stock: in_stock ?? true,
        is_featured: is_featured ?? false,
      })
      .select()
      .single()

    if (error) throw error

    if (variants && Array.isArray(variants) && variants.length > 0) {
      const variantInserts = variants.map((v: Record<string, unknown>) => ({
        product_id: data.id,
        name: v.name,
        type: v.type || 'size',
        price_ghs: v.price_ghs || null,
        in_stock: v.in_stock ?? true,
        image: v.image || null,
        sort_order: 0,
      }))
      await getSupabaseAdmin()!.from('product_variants').insert(variantInserts)
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Admin product create error:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, name, slug, description, benefits, usage_guide, material, price_ghs, compare_price_ghs, images, category_id, in_stock, is_featured, product_link, variants } = body

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const updates: Record<string, string | number | boolean | string[]> = {}
    if (name !== undefined) updates.name = sanitizeInput(name)
    if (slug !== undefined) updates.slug = slug
    if (description !== undefined) updates.description = sanitizeInput(description)
    if (benefits !== undefined) updates.benefits = benefits
    if (usage_guide !== undefined) updates.usage_guide = usage_guide
    if (material !== undefined) updates.material = material
    if (price_ghs !== undefined) updates.price_ghs = price_ghs
    if (compare_price_ghs !== undefined) updates.compare_price_ghs = compare_price_ghs
    if (images !== undefined) updates.images = images
    if (product_link !== undefined) updates.product_link = product_link
    if (category_id !== undefined) updates.category_id = category_id
    if (in_stock !== undefined) updates.in_stock = in_stock
    if (is_featured !== undefined) updates.is_featured = is_featured

    if (variants && Array.isArray(variants)) {
      await getSupabaseAdmin()!.from('product_variants').delete().eq('product_id', id)
      if (variants.length > 0) {
        const variantInserts = variants.map((v: Record<string, unknown>) => ({
          product_id: id,
          name: v.name,
          type: v.type || 'size',
          price_ghs: v.price_ghs || null,
          in_stock: v.in_stock ?? true,
          image: v.image || null,
          sort_order: 0,
        }))
        await getSupabaseAdmin()!.from('product_variants').insert(variantInserts)
      }
    }

    const { data, error } = await getSupabaseAdmin()!
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Admin product update error:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const { error } = await getSupabaseAdmin()!
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin product delete error:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
