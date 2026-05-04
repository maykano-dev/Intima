import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { categories, products as seedProducts, type SeedProduct } from '@/lib/products-data'

function mapProduct(p: SeedProduct, index: number) {
  const cat = categories.find((c) => c.id === p.category_id)
  return {
    id: `prod_${index + 1}`,
    name: p.name,
    slug: p.slug,
    description: p.description,
    benefits: p.benefits,
    usage_guide: p.usage_guide,
    material: p.material,
    price_ghs: p.price_ghs,
    compare_price_ghs: p.compare_price_ghs,
    images: [],
    category_id: p.category_id,
    category_name: cat?.name || null,
    in_stock: p.in_stock,
    is_featured: p.is_featured,
    rating: p.rating,
    review_count: p.review_count,
    created_at: new Date(2025, 0, 15 + index).toISOString(),
  }
}

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  return url.startsWith('https://') && key.length > 20 && !key.includes('placeholder')
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const featured = searchParams.get('featured')
    const getCategories = searchParams.get('categories')
    const limit = searchParams.get('limit')

    if (getCategories) {
      return NextResponse.json(categories)
    }

    // Try Supabase only if configured
    if (isSupabaseConfigured()) {
      try {
        if (slug) {
          const { data, error } = await supabaseAdmin
            .from('products')
            .select('*, categories(name)')
            .eq('slug', slug)
            .single()

          if (error && error.code !== 'PGRST116') throw error

          if (data) {
            return NextResponse.json({
              ...data,
              category_name: data.categories?.name || null,
              categories: undefined,
            })
          }

          const seedIndex = seedProducts.findIndex((p) => p.slug === slug)
          if (seedIndex >= 0) {
            return NextResponse.json(mapProduct(seedProducts[seedIndex], seedIndex))
          }
          return NextResponse.json(null, { status: 404 })
        }

        let query = supabaseAdmin
          .from('products')
          .select('*, categories(name)')
          .eq('in_stock', true)
          .order('created_at', { ascending: false })

        if (featured === 'true') {
          query = query.eq('is_featured', true)
        }

        if (limit) {
          query = query.limit(parseInt(limit))
        }

        const { data, error } = await query

        if (error) throw error

        if (data && data.length > 0) {
          const transformed = data.map((item: Record<string, unknown>) => ({
            ...item,
            category_name: (item.categories as { name?: string })?.name || null,
            categories: undefined,
          }))
          return NextResponse.json(transformed)
        }
      } catch {
        // Supabase unavailable — fall through to seed data
      }
    }

    // Fallback to seed data
    let results = seedProducts.map((p, i) => mapProduct(p, i))

    if (slug) {
      const found = results.find((p) => p.slug === slug)
      return NextResponse.json(found || null, { status: found ? 200 : 404 })
    }

    if (featured === 'true') {
      results = results.filter((p) => p.is_featured)
    }

    if (limit) {
      results = results.slice(0, parseInt(limit))
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Products API error:', error)
    const fallback = seedProducts.map((p, i) => mapProduct(p, i))
    return NextResponse.json(fallback)
  }
}
