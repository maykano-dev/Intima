'use client'

import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/utils'

interface SalesDay {
  sale_date: string
  order_count: number
  revenue_ghs: number
  cumulative_revenue: number
}

interface MonthlyStat {
  month: string
  total_orders: number
  revenue_ghs: number
  cancelled_orders: number
  delivered_orders: number
  avg_delivery_days: number
}

export default function AdminSales() {
  const [dailySales, setDailySales] = useState<SalesDay[]>([])
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState<'7' | '30' | '90'>('30')

  useEffect(() => {
    async function load() {
      try {
        const [dailyRes, monthlyRes] = await Promise.all([
          fetch(`/api/admin/sales?period=${period}`),
          fetch('/api/admin/sales?monthly=true'),
        ])
        if (dailyRes.ok) setDailySales(await dailyRes.json())
        if (monthlyRes.ok) setMonthlyStats(await monthlyRes.json())
      } catch {
        setError('Failed to load sales data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [period])

  const totalRevenue = dailySales.reduce((sum, d) => sum + d.revenue_ghs, 0)
  const totalOrders = dailySales.reduce((sum, d) => sum + d.order_count, 0)
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-surface rounded w-48 animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (<div key={i} className="h-24 bg-surface rounded-2xl animate-pulse" />))}
        </div>
        <div className="h-64 bg-surface rounded-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sales Analytics</h1>
        <div className="flex gap-2">
          {(['7', '30', '90'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                period === p ? 'bg-primary text-white' : 'bg-secondary text-muted hover:bg-secondary/80'
              }`}
            >
              {p}d
            </button>
          ))}
        </div>
      </div>

      {error && <div className="p-4 rounded-xl bg-danger/10 text-danger text-sm">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border p-5">
          <p className="text-sm text-muted mb-1">Revenue ({period}d)</p>
          <p className="text-3xl font-bold">{formatPrice(totalRevenue)}</p>
        </div>
        <div className="rounded-2xl border border-border p-5">
          <p className="text-sm text-muted mb-1">Orders ({period}d)</p>
          <p className="text-3xl font-bold">{totalOrders}</p>
        </div>
        <div className="rounded-2xl border border-border p-5">
          <p className="text-sm text-muted mb-1">Avg Order Value</p>
          <p className="text-3xl font-bold">{formatPrice(avgOrderValue)}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border p-6">
        <h2 className="font-semibold mb-4">Daily Sales</h2>
        {dailySales.length === 0 ? (
          <p className="text-sm text-muted text-center py-8">No sales data yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 font-medium text-muted">Date</th>
                  <th className="text-right py-2 px-2 font-medium text-muted">Orders</th>
                  <th className="text-right py-2 px-2 font-medium text-muted">Revenue</th>
                  <th className="text-right py-2 px-2 font-medium text-muted">Cumulative</th>
                </tr>
              </thead>
              <tbody>
                {dailySales.map((d) => (
                  <tr key={d.sale_date} className="border-b border-border/50">
                    <td className="py-2 px-2">{new Date(d.sale_date).toLocaleDateString()}</td>
                    <td className="py-2 px-2 text-right">{d.order_count}</td>
                    <td className="py-2 px-2 text-right">{formatPrice(d.revenue_ghs)}</td>
                    <td className="py-2 px-2 text-right text-muted">{formatPrice(d.cumulative_revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border p-6">
        <h2 className="font-semibold mb-4">Monthly Stats</h2>
        {monthlyStats.length === 0 ? (
          <p className="text-sm text-muted text-center py-8">No monthly data yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 font-medium text-muted">Month</th>
                  <th className="text-right py-2 px-2 font-medium text-muted">Orders</th>
                  <th className="text-right py-2 px-2 font-medium text-muted">Revenue</th>
                  <th className="text-right py-2 px-2 font-medium text-muted">Delivered</th>
                  <th className="text-right py-2 px-2 font-medium text-muted">Cancelled</th>
                  <th className="text-right py-2 px-2 font-medium text-muted">Avg Days</th>
                </tr>
              </thead>
              <tbody>
                {monthlyStats.map((m) => (
                  <tr key={m.month} className="border-b border-border/50">
                    <td className="py-2 px-2">{new Date(m.month).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</td>
                    <td className="py-2 px-2 text-right">{m.total_orders}</td>
                    <td className="py-2 px-2 text-right">{formatPrice(m.revenue_ghs)}</td>
                    <td className="py-2 px-2 text-right">{m.delivered_orders}</td>
                    <td className="py-2 px-2 text-right">{m.cancelled_orders}</td>
                    <td className="py-2 px-2 text-right">{m.avg_delivery_days}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
