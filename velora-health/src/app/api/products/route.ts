import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { categories, products as seedProducts, type SeedProduct } from '@/lib/products-data'

const productImages: Record<string, string[]> = {
  'whisper-bullet-vibrator': ['https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&h=600&fit=crop'],
  'pulse-wand-massager': ['https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&h=600&fit=crop'],
  'aria-air-pulse-stimulator': ['https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&h=600&fit=crop'],
  'sensual-stroker': ['https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&h=600&fit=crop'],
  'duo-vibrating-cock-ring': ['https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&h=600&fit=crop'],
  'premium-delay-spray': ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop'],
  'water-based-lubricant-200ml': ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop'],
  'toy-cleaner-spray-100ml': ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=600&fit=crop'],
  'essence-arousal-gel': ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop'],
  'starter-butt-plug-kit': ['https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&h=600&fit=crop'],
  'couples-starter-bundle': ['https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&h=600&fit=crop'],
  'herbal-vitality-supplement': ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=600&fit=crop'],
}

async function getExchangeRate(): Promise<number | null> {
  if (!isSupabaseConfigured()) return null
  try {
    const { data, error } = await getSupabaseAdmin()!
      .from('platform_settings')
      .select('exchange_rate_cny_to_ghs')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    if (error || !data?.exchange_rate_cny_to_ghs) return null
    return Number(data.exchange_rate_cny_to_ghs)
  } catch {
    return null
  }
}

function mapProduct(p: SeedProduct, index: number, exchangeRate?: number | null) {
  const cat = categories.find((c) => c.id === p.category_id)
  const computedPriceGhs = exchangeRate ? Math.round((p.price_cny / exchangeRate) * 100) / 100 : p.price_ghs
  return {
    id: `prod_${index + 1}`,
    name: p.name,
    slug: p.slug,
    description: p.description,
    benefits: p.benefits,
    usage_guide: p.usage_guide,
    material: p.material,
    price_cny: p.price_cny,
    price_ghs: computedPriceGhs,
    compare_price_ghs: p.compare_price_ghs,
    availability_status: p.availability_status || (p.in_stock ? 'in_ghana' : 'pre_order'),
    delivery_profile: p.delivery_profile || 'standard',
    lead_time: p.lead_time || '7-14 Days',
    images: productImages[p.slug] || [],
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
  let exchangeRate: number | null = null
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const featured = searchParams.get('featured')
    const getCategories = searchParams.get('categories')
    const limit = searchParams.get('limit')

    if (getCategories) {
      return NextResponse.json(categories)
    }

    // Fetch exchange rate from platform_settings
    if (isSupabaseConfigured()) {
      exchangeRate = await getExchangeRate()
    }

    // Try Supabase only if configured
    if (isSupabaseConfigured()) {
      try {
        if (slug) {
          const { data, error } = await getSupabaseAdmin()!
            .from('products')
            .select('*, categories(name)')
            .eq('slug', slug)
            .single()

          if (error && error.code !== 'PGRST116') throw error

          if (data) {
            const { product_link, ...productData } = data
            let variants: unknown[] = []
            try {
              const { data: vData } = await getSupabaseAdmin()!
                .from('product_variants')
                .select('*')
                .eq('product_id', data.id)
                .order('sort_order', { ascending: true })
              if (vData) variants = vData
            } catch {}
            return NextResponse.json({
              ...productData,
              category_name: data.categories?.name || null,
              categories: undefined,
              price_cny: data.price_cny || null,
              availability_status: data.availability_status || (data.in_stock ? 'in_ghana' : 'pre_order'),
              delivery_profile: data.delivery_profile || 'standard',
              lead_time: data.lead_time || '7-14 Days',
              variants,
            });
          }

          const seedIndex = seedProducts.findIndex((p) => p.slug === slug);
          if (seedIndex >= 0) {
            return NextResponse.json(mapProduct(seedProducts[seedIndex], seedIndex, exchangeRate));
          }
          return NextResponse.json(null, { status: 404 })
        }

        let query = getSupabaseAdmin()!
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
          const productIds = data.map((item: Record<string, unknown>) => item.id).filter(Boolean)
          const variantsMap: Record<string, unknown[]> = {}
          try {
            const { data: vData } = await getSupabaseAdmin()!
              .from('product_variants')
              .select('*')
              .in('product_id', productIds)
              .order('sort_order', { ascending: true })
            if (vData) {
              for (const v of vData) {
                const pid = v.product_id as string
                if (!variantsMap[pid]) variantsMap[pid] = []
                variantsMap[pid].push(v)
              }
            }
          } catch {}
          const transformed = data.map((item: Record<string, unknown>) => {
            const { product_link, ...rest } = item
            return {
              ...rest,
              category_name: (item.categories as { name?: string })?.name || null,
              categories: undefined,
              price_cny: item.price_cny || null,
              availability_status: item.availability_status || ((item.in_stock as boolean) ? 'in_ghana' : 'pre_order'),
              delivery_profile: item.delivery_profile || 'standard',
              lead_time: item.lead_time || '7-14 Days',
              variants: variantsMap[item.id as string] || [],
            }
          })
          return NextResponse.json(transformed)
        }
      } catch {
        // Supabase unavailable — fall through to seed data
      }
    }

    // Fallback to seed data
    let results = seedProducts.map((p, i) => mapProduct(p, i, exchangeRate))

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
    const fallback = seedProducts.map((p, i) => mapProduct(p, i, exchangeRate))
    return NextResponse.json(fallback)
  }
}
