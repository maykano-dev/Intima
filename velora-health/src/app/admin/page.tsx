'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface AdminStats {
  totalOrders: number
  pendingOrders: number
  totalProducts: number
  unreadMessages: number
  pendingReviews: number
  totalSubscribers: number
}

export default function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [ordersRes, productsRes, msgsRes, reviewsRes, subsRes] = await Promise.all([
          fetch('/api/admin/orders'),
          fetch('/api/admin/products'),
          fetch('/api/admin/messages?unread=true'),
          fetch('/api/admin/reviews?approved=false'),
          fetch('/api/admin/subscribers'),
        ])

        const orders = ordersRes.ok ? await ordersRes.json() : []
        const products = productsRes.ok ? await productsRes.json() : []
        const msgs = msgsRes.ok ? await msgsRes.json() : []
        const reviews = reviewsRes.ok ? await reviewsRes.json() : []
        const subs = subsRes.ok ? await subsRes.json() : []

        setStats({
          totalOrders: Array.isArray(orders) ? orders.length : 0,
          pendingOrders: Array.isArray(orders) ? orders.filter((o: { status: string }) => o.status === 'pending' || o.status === 'paid').length : 0,
          totalProducts: Array.isArray(products) ? products.length : 0,
          unreadMessages: Array.isArray(msgs) ? msgs.length : 0,
          pendingReviews: Array.isArray(reviews) ? reviews.length : 0,
          totalSubscribers: Array.isArray(subs) ? subs.length : 0,
        })
      } catch {
        // Silently fail
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-[#1A2E26] rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-[#1A2E26] rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const cards = [
    {
      label: 'Total Orders',
      value: stats?.totalOrders ?? 0,
      href: '/admin/orders',
      icon: (
        <svg className="w-5 h-5 text-[#BFA075]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      label: 'Pending Orders',
      value: stats?.pendingOrders ?? 0,
      href: '/admin/orders',
      icon: (
        <svg className="w-5 h-5 text-[#BFA075]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Products',
      value: stats?.totalProducts ?? 0,
      href: '/admin/products',
      icon: (
        <svg className="w-5 h-5 text-[#BFA075]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      label: 'Unread Messages',
      value: stats?.unreadMessages ?? 0,
      href: '/admin/messages',
      icon: (
        <svg className="w-5 h-5 text-[#BFA075]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: 'Pending Reviews',
      value: stats?.pendingReviews ?? 0,
      href: '/admin/reviews',
      icon: (
        <svg className="w-5 h-5 text-[#BFA075]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
    {
      label: 'Subscribers',
      value: stats?.totalSubscribers ?? 0,
      href: '/admin/subscribers',
      icon: (
        <svg className="w-5 h-5 text-[#BFA075]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
        </svg>
      ),
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#F2E8DF]">Admin Overview</h1>
        <p className="text-[#8A7F76] mt-1">Manage your store at a glance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-2xl border border-[rgba(242,232,223,0.08)] bg-[#0A1410] p-5 hover:bg-[rgba(191,160,117,0.03)] transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-[rgba(191,160,117,0.1)] flex items-center justify-center mb-3">
              {card.icon}
            </div>
            <p className="text-2xl font-bold text-[#F2E8DF] group-hover:text-[#BFA075] transition-colors">{card.value}</p>
            <p className="text-sm text-[#8A7F76] mt-1">{card.label}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
