export interface Product {
  id: string
  name: string
  slug: string
  description: string
  benefits: string
  usage_guide: string
  material: string
  price_ghs: number
  compare_price_ghs: number | null
  images: string[]
  category_id: string
  category_name?: string
  in_stock: boolean
  is_featured: boolean
  rating: number
  review_count: number
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  image: string
}

export interface CartItem {
  id: string
  product_id: string
  name: string
  price_ghs: number
  quantity: number
  image: string
  slug: string
}

export interface CustomerInfo {
  name: string
  email: string
  phone: string
  address: string
  city: string
  notes: string
  discreet_packaging: boolean
}

export interface Order {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_address: string
  city: string
  notes: string
  total: number
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  payment_reference: string
  payment_status: string
  discreet_packaging: boolean
  items: OrderItem[]
  created_at: string
}

export interface OrderItem {
  id?: string
  order_id?: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  image: string
  author: string
  published_at: string
}

export interface Review {
  id: string
  product_id: string
  customer_name: string
  rating: number
  content: string
  created_at: string
}

export interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}
