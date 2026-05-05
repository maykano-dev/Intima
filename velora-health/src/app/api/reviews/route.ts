import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { sanitizeInput } from '@/lib/utils'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const mockReviews = [
  { id: 'r1', product_id: 'prod_1', customer_name: 'Sarah M.', rating: 5, content: 'Perfect for beginners! So discreet and quiet. Exactly what I needed.', approved: true, created_at: '2025-03-15' },
  { id: 'r2', product_id: 'prod_1', customer_name: 'Ama D.', rating: 4, content: 'Great quality for the price. Fast delivery too.', approved: true, created_at: '2025-03-20' },
  { id: 'r3', product_id: 'prod_2', customer_name: 'Kofi A.', rating: 5, content: 'The wand is incredibly powerful. Worth every pesewa.', approved: true, created_at: '2025-03-10' },
  { id: 'r4', product_id: 'prod_2', customer_name: 'Nana K.', rating: 5, content: 'Bought this for my wife and she loves it. Discreet delivery as promised.', approved: true, created_at: '2025-03-05' },
  { id: 'r5', product_id: 'prod_5', customer_name: 'Kwame B.', rating: 4, content: 'Great for couples. The vibration adds a lot to the experience.', approved: true, created_at: '2025-03-18' },
  { id: 'r6', product_id: 'prod_6', customer_name: 'Michael T.', rating: 5, content: 'This spray genuinely works. Extended my time significantly. Game changer.', approved: true, created_at: '2025-03-22' },
  { id: 'r7', product_id: 'prod_7', customer_name: 'Esi A.', rating: 5, content: 'Best lubricant I have ever used. Non-sticky and lasts long.', approved: true, created_at: '2025-03-12' },
  { id: 'r8', product_id: 'prod_4', customer_name: 'John D.', rating: 4, content: 'Good quality stroker. Easy to clean and feels realistic.', approved: true, created_at: '2025-03-08' },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productSlug = searchParams.get('product_slug')

    if (!productSlug) {
      return NextResponse.json([])
    }

    // Try Supabase first
    try {
      const { data: product } = await getSupabaseAdmin()
        .from('products')
        .select('id')
        .eq('slug', productSlug)
        .single()

      if (product) {
        const { data, error } = await getSupabaseAdmin()
          .from('reviews')
          .select('*')
          .eq('product_id', product.id)
          .eq('approved', true)
          .order('created_at', { ascending: false })

        if (!error && data && data.length > 0) {
          return NextResponse.json(data)
        }
      }
    } catch {
      // Fall through to mock data
    }

    // Map slug to product ID for mock data
    const slugToId: Record<string, string> = {
      'whisper-bullet-vibrator': 'prod_1',
      'pulse-wand-massager': 'prod_2',
      'aria-air-pulse-stimulator': 'prod_3',
      'sensual-stroker': 'prod_4',
      'duo-vibrating-cock-ring': 'prod_5',
      'premium-delay-spray': 'prod_6',
      'water-based-lubricant-200ml': 'prod_7',
      'toy-cleaner-spray-100ml': 'prod_8',
      'essence-arousal-gel': 'prod_9',
      'starter-butt-plug-kit': 'prod_10',
      'couples-starter-bundle': 'prod_11',
      'herbal-vitality-supplement': 'prod_12',
    }

    const pid = slugToId[productSlug]
    const filtered = pid ? mockReviews.filter((r) => r.product_id === pid) : []

    return NextResponse.json(filtered)
  } catch (error) {
    console.error('Reviews API error:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const { allowed } = checkRateLimit(`review:${ip}`, 5, 60000)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { product_id, name, rating, content } = body

    if (!product_id || !name || !rating || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Try Supabase first
    try {
      const { error } = await getSupabaseAdmin().from('reviews').insert({
        product_id,
        customer_name: sanitizeInput(name),
        rating: Math.min(5, Math.max(1, parseInt(rating))),
        content: sanitizeInput(content),
        approved: false,
      })

      if (!error) {
        return NextResponse.json({ success: true }, { status: 201 })
      }
    } catch {
      // Fall through — accept review without saving (mock mode)
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Review creation error:', error)
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    )
  }
}
