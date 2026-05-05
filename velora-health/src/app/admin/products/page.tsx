'use client'

import { useEffect, useState } from 'react'
import { formatPrice, cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface Product {
  id: string
  name: string
  slug: string
  price_ghs: number
  compare_price_ghs: number | null
  category_name: string | null
  in_stock: boolean
  is_featured: boolean
  created_at: string
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    benefits: '',
    usage_guide: '',
    material: '',
    price_ghs: '',
    compare_price_ghs: '',
    category_id: 'vibrators',
    in_stock: true,
    is_featured: false,
  })

  async function loadProducts() {
    try {
      const res = await fetch('/api/admin/products')
      if (res.ok) setProducts(await res.json())
    } catch {
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProducts() }, [])

  function resetForm() {
    setForm({ name: '', slug: '', description: '', benefits: '', usage_guide: '', material: '', price_ghs: '', compare_price_ghs: '', category_id: 'vibrators', in_stock: true, is_featured: false })
    setShowForm(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price_ghs: parseFloat(form.price_ghs),
          compare_price_ghs: form.compare_price_ghs ? parseFloat(form.compare_price_ghs) : null,
        }),
      })
      if (res.ok) {
        resetForm()
        loadProducts()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to create')
      }
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  async function toggleFeatured(id: string, current: boolean) {
    try {
      await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_featured: !current }),
      })
      loadProducts()
    } catch {
      setError('Failed to update')
    }
  }

  async function toggleStock(id: string, current: boolean) {
    try {
      await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, in_stock: !current }),
      })
      loadProducts()
    } catch {
      setError('Failed to update')
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product?')) return
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' })
      if (res.ok) loadProducts()
    } catch {
      setError('Failed to delete')
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-8 bg-surface rounded w-48 animate-pulse" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-surface rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary-dark transition-colors">
            Add Product
          </button>
        )}
      </div>

      {error && <div className="p-4 rounded-xl bg-danger/10 text-danger text-sm mb-6">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-border p-6 mb-6 space-y-4">
          <h2 className="font-semibold">New Product</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Leave empty to auto-generate" />
            <Input label="Price (GHS)" type="number" step="0.01" value={form.price_ghs} onChange={(e) => setForm({ ...form, price_ghs: e.target.value })} required />
            <Input label="Compare Price (GHS)" type="number" step="0.01" value={form.compare_price_ghs} onChange={(e) => setForm({ ...form, compare_price_ghs: e.target.value })} />
            <Input label="Material" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} />
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="px-3 py-2.5 rounded-xl border border-border bg-transparent text-sm"
            >
              <option value="vibrators">Vibrators</option>
              <option value="male-pleasure">Male Pleasure</option>
              <option value="couples">Couples</option>
              <option value="lubricants">Lubricants</option>
              <option value="anal">Anal</option>
              <option value="wellness">Wellness</option>
              <option value="dildos">Dildos</option>
            </select>
          </div>
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-transparent text-sm min-h-[80px]"
          />
          <textarea
            placeholder="Benefits (one per line)"
            value={form.benefits}
            onChange={(e) => setForm({ ...form, benefits: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-transparent text-sm min-h-[80px]"
          />
          <textarea
            placeholder="Usage Guide"
            value={form.usage_guide}
            onChange={(e) => setForm({ ...form, usage_guide: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-transparent text-sm min-h-[80px]"
          />
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.in_stock} onChange={(e) => setForm({ ...form, in_stock: e.target.checked })} className="w-4 h-4 rounded border-border text-primary" />
              <span className="text-sm">In Stock</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="w-4 h-4 rounded border-border text-primary" />
              <span className="text-sm">Featured</span>
            </label>
          </div>
          <div className="flex gap-3">
            <Button type="submit" variant="primary" loading={saving}>Create</Button>
            <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
          </div>
        </form>
      )}

      {products.length === 0 ? (
        <div className="text-center py-16 text-muted">No products found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-muted">Name</th>
                <th className="text-left py-3 px-2 font-medium text-muted">Category</th>
                <th className="text-left py-3 px-2 font-medium text-muted">Price</th>
                <th className="text-left py-3 px-2 font-medium text-muted">Stock</th>
                <th className="text-left py-3 px-2 font-medium text-muted">Featured</th>
                <th className="text-left py-3 px-2 font-medium text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                  <td className="py-3 px-2 font-medium">{p.name}</td>
                  <td className="py-3 px-2 text-muted">{p.category_name || '-'}</td>
                  <td className="py-3 px-2">{formatPrice(p.price_ghs)}</td>
                  <td className="py-3 px-2">
                    <button onClick={() => toggleStock(p.id, p.in_stock)} className={cn('px-2 py-0.5 rounded-full text-xs font-medium', p.in_stock ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300')}>
                      {p.in_stock ? 'In Stock' : 'Out'}
                    </button>
                  </td>
                  <td className="py-3 px-2">
                    <button onClick={() => toggleFeatured(p.id, p.is_featured)} className={cn('px-2 py-0.5 rounded-full text-xs font-medium', p.is_featured ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted')}>
                      {p.is_featured ? 'Featured' : 'No'}
                    </button>
                  </td>
                  <td className="py-3 px-2">
                    <button onClick={() => deleteProduct(p.id)} className="text-xs text-danger hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
