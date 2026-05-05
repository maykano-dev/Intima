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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-28 bg-surface rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  const cards = [
    {
      label: 'Total Orders',
      value: stats?.totalOrders ?? 0,
      href: '/admin/orders',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    },
    {
      label: 'Pending Orders',
      value: stats?.pendingOrders ?? 0,
      href: '/admin/orders',
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    },
    {
      label: 'Products',
      value: stats?.totalProducts ?? 0,
      href: '/admin/products',
      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    },
    {
      label: 'Unread Messages',
      value: stats?.unreadMessages ?? 0,
      href: '/admin/messages',
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    },
    {
      label: 'Pending Reviews',
      value: stats?.pendingReviews ?? 0,
      href: '/admin/reviews',
      color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    },
    {
      label: 'Subscribers',
      value: stats?.totalSubscribers ?? 0,
      href: '/admin/subscribers',
      color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-2xl border border-border p-5 hover:bg-secondary/50 transition-colors"
          >
            <p className="text-3xl font-bold mb-1">{card.value}</p>
            <p className="text-sm text-muted">{card.label}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
