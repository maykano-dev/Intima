'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

interface OrderSummary {
  id: string
  total: number
  status: string
  created_at: string
}

interface Profile {
  full_name?: string
  email?: string
  phone?: string
  email_notifications?: boolean
  whatsapp_notifications?: boolean
}

interface Address {
  id: string
  label: string
  address_line1: string
  city: string
}

export default function DashboardOverview() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [recentOrders, setRecentOrders] = useState<OrderSummary[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, ordersRes, addrRes] = await Promise.all([
          fetch('/api/user/settings'),
          fetch('/api/user/orders'),
          fetch('/api/user/addresses'),
        ])

        if (profileRes.ok) {
          const data = await profileRes.json()
          setProfile(data)
        }
        if (ordersRes.ok) {
          const data = await ordersRes.json()
          setRecentOrders(data.slice(0, 3))
        }
        if (addrRes.ok) {
          const data = await addrRes.json()
          setAddresses(data)
        }
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
        <div className="h-8 bg-surface rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-surface rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const orderCount = recentOrders.length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}</h1>
        <p className="text-muted mt-1">Here&apos;s your account overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border p-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-2xl font-bold">{orderCount}</p>
          <p className="text-sm text-muted">Total Orders</p>
        </div>

        <div className="rounded-2xl border border-border p-5">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-2xl font-bold">{addresses.length}</p>
          <p className="text-sm text-muted">Saved Addresses</p>
        </div>

        <div className="rounded-2xl border border-border p-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p className="text-sm text-muted">{profile?.email || 'Signed in'}</p>
          <p className="text-sm text-muted">Account Active</p>
        </div>
      </div>

      {recentOrders.length > 0 && (
        <div className="rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Orders</h2>
            <Link href="/dashboard/orders" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/dashboard/orders/${order.id}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">{order.id}</p>
                  <p className="text-xs text-muted">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatPrice(order.total)}</p>
                  <span className="text-xs capitalize text-muted">{order.status}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {recentOrders.length === 0 && (
        <div className="rounded-2xl border border-border p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="font-semibold mb-1">No orders yet</h2>
          <p className="text-sm text-muted mb-4">Browse our shop and place your first order.</p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-lg bg-primary text-white px-5 py-2.5 text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            Browse Shop
          </Link>
        </div>
      )}
    </div>
  )
}
