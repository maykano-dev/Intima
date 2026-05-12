'use client'

import { useEffect, useState } from 'react'
import { formatPrice, cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import FileUpload from '@/components/ui/FileUpload'

import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'

interface Product {
  id: string
  name: string
  slug: string
  price_ghs: number
  price_cny: number
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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [exchangeRate, setExchangeRate] = useState(0.52)
  const [productReviews, setProductReviews] = useState<any[]>([])

  const [productType, setProductType] = useState<'imported' | 'available-in-gh'>('imported')
  const [shareOption, setShareOption] = useState(false)
  const [sharedOptionInput, setSharedOptionInput] = useState('')
  const [useSharedPrice, setUseSharedPrice] = useState(false)
  const [sharedPrice, setSharedPrice] = useState('')
  const [syncVariantPrice, setSyncVariantPrice] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void; isDanger?: boolean }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  })

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    benefits: '',
    usage_guide: '',
    price_cny: '',
    price_ghs: '',
    product_link: '',
    images: [] as string[],
    variants: [] as { option: string; value: string; price: string; image: string }[],
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

  async function loadRate() {
    try {
      const res = await fetch('/api/admin/rates')
      if (res.ok) {
        const data = await res.json()
        setExchangeRate(data.exchange_rate_cny_to_ghs)
      }
    } catch {
      // Use default
    }
  }

  useEffect(() => { 
    loadProducts()
    loadRate()
  }, [])

  function resetForm() {
    setForm({ 
      name: '', slug: '', description: '', benefits: '', usage_guide: '', 
      price_cny: '', price_ghs: '', product_link: '', images: [], variants: [], 
      category_id: 'vibrators', in_stock: true, is_featured: false 
    })
    setEditingId(null)
    setProductReviews([])
    setProductType('imported')
    setShareOption(false)
    setSharedOptionInput('')
    setUseSharedPrice(false)
    setSharedPrice('')
    setSyncVariantPrice(false)
    setShowForm(false)
  }

  // Handle CNY to GHS conversion
  function calculateGhs(val: string) {
    const cny = parseFloat(val) || 0
    if (cny <= 0) return { ghs: '0.00', fee: 0, total: 0 }
    const fee = Math.max(cny * 0.03, 2)
    const total = cny + fee
    const ghs = (total / 0.52).toFixed(2)
    return { ghs, fee, total }
  }

  function handleCnyChange(val: string) {
    const { ghs } = calculateGhs(val)
    const updated = { ...form, price_cny: val, price_ghs: ghs }
    if (syncVariantPrice) {
      updated.variants = updated.variants.map(v => ({ ...v, price: val }))
    }
    setForm(updated)
  }

  function handleGhsChange(val: string) {
    const updated = { ...form, price_ghs: val }
    if (syncVariantPrice) {
      updated.variants = updated.variants.map(v => ({ ...v, price: val }))
    }
    setForm(updated)
  }

  async function loadProductReviews(productId: string) {
    try {
      const res = await fetch(`/api/admin/reviews?product_id=${productId}`)
      if (res.ok) setProductReviews(await res.json())
    } catch {
      // Fail silently
    }
  }

  async function toggleReviewApproval(id: string) {
    try {
      await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approved: true }),
      })
      if (editingId) loadProductReviews(editingId)
    } catch {
      setError('Failed to update review')
    }
  }

  async function deleteReview(id: string) {
    setConfirmModal({
      open: true,
      title: 'Delete Review',
      message: 'Are you sure you want to delete this review? This action cannot be undone.',
      isDanger: true,
      onConfirm: async () => {
        try {
          await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' })
          if (editingId) loadProductReviews(editingId)
          setConfirmModal(prev => ({ ...prev, open: false }))
        } catch {
          setError('Failed to delete review')
        }
      }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/products', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          id: editingId,
          price_cny: parseFloat(form.price_cny),
          price_ghs: parseFloat(form.price_ghs),
          images: form.images.filter(Boolean),
          variants: form.variants.map(v => ({
            name: v.value,
            type: v.option || 'size',
            price_cny: productType === 'imported' ? parseFloat(v.price) || 0 : 0,
            price_ghs: productType === 'available-in-gh' ? parseFloat(v.price) || 0 : 0,
            in_stock: true,
            image: v.image || '',
          })),
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

  async function handleEdit(product: any) {
    setEditingId(product.id)
    const hasCny = product.price_cny && product.price_cny > 0
    setProductType(hasCny ? 'imported' : 'available-in-gh')
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      benefits: product.benefits || '',
      usage_guide: product.usage_guide || '',
      price_cny: product.price_cny?.toString() || '',
      price_ghs: product.price_ghs?.toString() || '',
      product_link: product.product_link || '',
      images: product.images || [],
      variants: (product.variants || []).map((v: any) => ({
        option: v.type || '',
        value: v.name || '',
        price: (v.price_ghs || v.price_cny || '').toString(),
        image: v.image || '',
      })),
      category_id: product.category_id || 'vibrators',
      in_stock: product.in_stock,
      is_featured: product.is_featured,
    })
    loadProductReviews(product.id)
    setShowForm(true)
  }

  async function deleteProduct(id: string) {
    setConfirmModal({
      open: true,
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' })
          if (res.ok) {
            loadProducts()
            setConfirmModal(prev => ({ ...prev, open: false }))
          }
        } catch {
          setError('Failed to delete')
        }
      }
    })
  }

  const filteredProducts = products.filter(p => {
    const q = searchQuery.toLowerCase()
    return (
      p.name.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      p.category_name?.toLowerCase().includes(q)
    )
  })

  function toggleSelect(id: string) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  function toggleSelectAll() {
    setSelectedIds(prev => prev.length === filteredProducts.length ? [] : filteredProducts.map(p => p.id))
  }

  async function bulkDelete() {
    if (selectedIds.length === 0) return
    setConfirmModal({
      open: true,
      title: 'Bulk Delete Products',
      message: `Are you sure you want to delete ${selectedIds.length} products?`,
      isDanger: true,
      onConfirm: async () => {
        setLoading(true)
        try {
          await Promise.all(selectedIds.map(id => fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' })))
          loadProducts()
          setSelectedIds([])
          setConfirmModal(prev => ({ ...prev, open: false }))
        } catch {
          setError('Bulk delete failed')
        } finally {
          setLoading(false)
        }
      }
    })
  }

  async function bulkToggleStock(inStock: boolean) {
    if (selectedIds.length === 0) return
    setLoading(true)
    try {
      await Promise.all(selectedIds.map(id => 
        fetch('/api/admin/products', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, in_stock: inStock }),
        })
      ))
      loadProducts()
      setSelectedIds([])
    } catch {
      setError('Bulk update failed')
    } finally {
      setLoading(false)
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
    <>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Products</h1>
          <p className="text-sm text-muted mt-1">Manage your storefront inventory and pricing</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input 
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <Button 
            variant="primary" 
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-6 py-2.5 shadow-lg shadow-primary/20"
          >
            + Add Product
          </Button>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="mb-8 p-4 rounded-3xl bg-primary/5 border border-primary/20 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold">{selectedIds.length} products selected</span>
            <div className="h-4 w-px bg-primary/20" />
            <div className="flex items-center gap-2">
              <button 
                onClick={() => bulkToggleStock(true)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                Set In Stock
              </button>
              <button 
                onClick={() => bulkToggleStock(false)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                Set Out of Stock
              </button>
            </div>
          </div>
          <button 
            onClick={bulkDelete}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
          >
            Delete Selected
          </button>
        </div>
      )}

      {error && <div className="p-4 rounded-xl bg-danger/10 text-danger text-sm mb-6">{error}</div>}

      <Modal open={showForm} onClose={resetForm} className="max-w-5xl">
        <div className="flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border bg-surface/5">
            <div>
              <h2 className="text-2xl font-serif tracking-tight">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
              <p className="text-xs text-muted mt-1 uppercase tracking-widest font-medium">Inventory Management</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-1 p-1 rounded-xl bg-secondary/10 border border-border/50">
                <button
                  type="button"
                  onClick={() => setProductType('imported')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    productType === 'imported'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  Imported
                </button>
                <button
                  type="button"
                  onClick={() => setProductType('available-in-gh')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    productType === 'available-in-gh'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  Available in GH
                </button>
              </div>
              <button onClick={resetForm} className="p-2 hover:bg-secondary rounded-full transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Left Column - Core Info */}
              <div className="lg:col-span-7 space-y-8">
                <section className="space-y-4">
                  <h3 className="text-xs font-bold text-primary uppercase tracking-widest border-b border-primary/20 pb-2">Basic Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    <Input label="Slug (URL)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {productType === 'imported' ? (
                      <div className="space-y-1.5">
                        <Input 
                          label="Price (Yuan - CNY)" 
                          type="number" 
                          step="0.01" 
                          value={form.price_cny} 
                          onChange={(e) => handleCnyChange(e.target.value)} 
                          required 
                        />
                        <div className="space-y-1 ml-1 bg-secondary/5 p-3 rounded-xl border border-border/40">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted">Base Amount:</span>
                            <span className="font-medium">¥{(parseFloat(form.price_cny) || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted">Service Fee (3%):</span>
                            <span className="font-medium text-warning">¥{calculateGhs(form.price_cny).fee.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between border-t border-border/40 pt-1 mt-1">
                            <span className="text-[10px] font-bold text-primary">Total GHS:</span>
                            <span className="text-sm font-bold text-primary">{formatPrice(parseFloat(form.price_ghs) || 0)}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Input 
                        label="Price (GHS)" 
                        type="number" 
                        step="0.01" 
                        value={form.price_ghs} 
                        onChange={(e) => handleGhsChange(e.target.value)} 
                        required 
                      />
                    )}
                    <div className="space-y-1">
                      <label className="text-sm font-medium ml-1">Category</label>
                      <select
                        value={form.category_id}
                        onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                      >
                        <option value="vibrators">Vibrators</option>
                        <option value="male-pleasure">Male Pleasure</option>
                        <option value="couples">Couples</option>
                        <option value="lubricants">Lubricants</option>
                        <option value="anal">Anal</option>
                        <option value="wellness">Wellness</option>
                        <option value="dildos">Dildos</option>
                        <option value="herbal">Herbal Products</option>
                        <option value="adult-games">Adult Games</option>
                      </select>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xs font-bold text-primary uppercase tracking-widest border-b border-primary/20 pb-2">Description & Benefits</h3>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium ml-1">Description</label>
                      <textarea
                        placeholder="Describe the product experience..."
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm min-h-[120px] focus:ring-2 focus:ring-primary outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium ml-1">Key Benefits (One per line)</label>
                      <textarea
                        placeholder="• Pure Silicone&#10;• USB Rechargeable&#10;• Waterproof"
                        value={form.benefits}
                        onChange={(e) => setForm({ ...form, benefits: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm min-h-[100px] focus:ring-2 focus:ring-primary outline-none transition-all"
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center justify-between border-b border-primary/20 pb-2">
                    <h3 className="text-xs font-bold text-primary uppercase tracking-widest">Variants</h3>
                    <button
                      type="button"
                      onClick={() => {
                        const opt = shareOption ? sharedOptionInput : ''
                        const prc = useSharedPrice ? sharedPrice : (syncVariantPrice ? (productType === 'imported' ? form.price_cny : form.price_ghs) : '')
                        setForm({ 
                          ...form, 
                          variants: [...form.variants, { 
                            option: opt, 
                            value: '', 
                            price: prc,
                            image: ''
                          }] 
                        })
                      }}
                      className="text-[10px] font-bold text-primary hover:underline underline-offset-4"
                    >
                      + ADD VARIANT
                    </button>
                  </div>

                  {/* Shared Controls */}
                  <div className="space-y-3 p-4 rounded-2xl bg-secondary/5 border border-border/40">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={shareOption} 
                          onChange={(e) => {
                            setShareOption(e.target.checked)
                            if (!e.target.checked) setSharedOptionInput('')
                          }}
                          className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary/20 bg-card" 
                        />
                        <span className="text-[10px] font-bold text-muted group-hover:text-primary transition-colors">SHARE SAME OPTION</span>
                      </label>
                      {shareOption && (
                        <Input
                          placeholder="e.g. Color"
                          value={sharedOptionInput}
                          onChange={(e) => {
                            const val = e.target.value
                            setSharedOptionInput(val)
                            const next = form.variants.map(v => ({ ...v, option: val }))
                            setForm({ ...form, variants: next })
                          }}
                          className="max-w-xs"
                        />
                      )}
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={useSharedPrice} 
                          onChange={(e) => {
                            setUseSharedPrice(e.target.checked)
                            if (!e.target.checked) setSharedPrice('')
                          }}
                          className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary/20 bg-card" 
                        />
                        <span className="text-[10px] font-bold text-muted group-hover:text-primary transition-colors">SHARED PRICE</span>
                      </label>
                      {useSharedPrice && !syncVariantPrice && (
                        <Input
                          type="number"
                          step="0.01"
                          placeholder={productType === 'imported' ? 'Price (¥)' : 'Price (GHS)'}
                          value={sharedPrice}
                          onChange={(e) => {
                            const val = e.target.value
                            setSharedPrice(val)
                            const next = form.variants.map(v => ({ ...v, price: val }))
                            setForm({ ...form, variants: next })
                          }}
                          className="max-w-[160px]"
                        />
                      )}
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={syncVariantPrice} 
                          onChange={(e) => {
                            setSyncVariantPrice(e.target.checked)
                            if (e.target.checked) {
                              const mainPrice = productType === 'imported' ? form.price_cny : form.price_ghs
                              const next = form.variants.map(v => ({ ...v, price: mainPrice }))
                              setForm({ ...form, variants: next })
                            }
                          }}
                          className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary/20 bg-card" 
                        />
                        <span className="text-[10px] font-bold text-muted group-hover:text-primary transition-colors">SAME AS MAIN PRICE</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {form.variants.map((v, i) => (
                      <div key={i} className="group relative grid grid-cols-1 sm:grid-cols-12 gap-4 items-center p-4 rounded-2xl bg-secondary/5 border border-border/40 hover:border-primary/30 transition-all">
                        <div className="sm:col-span-3">
                          <Input
                            placeholder="Option (e.g. Color)"
                            value={v.option}
                            disabled={shareOption}
                            onChange={(e) => {
                              const next = [...form.variants]
                              next[i] = { ...next[i], option: e.target.value }
                              setForm({ ...form, variants: next })
                            }}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Input
                            placeholder="Value (e.g. Red)"
                            value={v.value}
                            onChange={(e) => {
                              const next = [...form.variants]
                              next[i] = { ...next[i], value: e.target.value }
                              setForm({ ...form, variants: next })
                            }}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Input
                            type="number"
                            step="0.01"
                            disabled={useSharedPrice || syncVariantPrice}
                            placeholder={productType === 'imported' ? 'Price (¥)' : 'Price (GHS)'}
                            value={v.price}
                            onChange={(e) => {
                              const next = [...form.variants]
                              next[i] = { ...next[i], price: e.target.value }
                              setForm({ ...form, variants: next })
                            }}
                          />
                        </div>
                        <div className="sm:col-span-3 flex justify-center">
                          <FileUpload 
                            variant="compact"
                            value={v.image}
                            onUpload={(url) => {
                              const next = [...form.variants]
                              next[i] = { ...next[i], image: url }
                              setForm({ ...form, variants: next })
                            }}
                          />
                        </div>
                        <div className="sm:col-span-2 flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, variants: form.variants.filter((_, j) => j !== i) })}
                            className="p-2 text-danger hover:bg-danger/10 rounded-xl transition-all"
                            title="Remove Variant"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Right Column - Media & Settings */}
              <div className="lg:col-span-5 space-y-8">
                <section className="space-y-4">
                  <h3 className="text-xs font-bold text-primary uppercase tracking-widest border-b border-primary/20 pb-2">Product Media</h3>
                  <div className="space-y-4">
                    <FileUpload 
                      onUpload={(url) => setForm({ ...form, images: [...form.images, url] })}
                      className="aspect-video"
                    />
                    <div className="grid grid-cols-3 gap-3">
                      {form.images.map((img, i) => (
                        <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-border bg-card">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })}
                            className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xs font-bold text-primary uppercase tracking-widest border-b border-primary/20 pb-2">Additional Links</h3>
                  <Input label="External Supplier Link" type="url" value={form.product_link} onChange={(e) => setForm({ ...form, product_link: e.target.value })} placeholder="https://..." />
                </section>

                <section className="p-6 rounded-2xl bg-secondary/5 border border-border/50 space-y-4">
                  <h3 className="text-xs font-bold text-primary uppercase tracking-widest">Visibility</h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">Available in Stock</span>
                      <input type="checkbox" checked={form.in_stock} onChange={(e) => setForm({ ...form, in_stock: e.target.checked })} className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20 bg-card" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">Featured on Homepage</span>
                      <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20 bg-card" />
                    </label>
                  </div>
                </section>

                {editingId && (
                  <section className="space-y-4">
                    <h3 className="text-xs font-bold text-primary uppercase tracking-widest border-b border-primary/20 pb-2">Customer Reviews</h3>
                    {productReviews.length === 0 ? (
                      <p className="text-xs text-muted italic p-4 text-center border border-dashed border-border rounded-xl">No reviews for this product.</p>
                    ) : (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
                        {productReviews.map((rev) => (
                          <div key={rev.id} className="p-4 rounded-xl border border-border bg-card space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-xs font-bold">{rev.customer_name}</p>
                                <div className="text-[10px] text-primary">{'★'.repeat(rev.rating)}</div>
                              </div>
                              <Badge variant={rev.approved ? 'success' : 'warning'}>{rev.approved ? 'Live' : 'Pending'}</Badge>
                            </div>
                            <p className="text-xs text-muted italic line-clamp-3">{rev.content}</p>
                            <div className="flex gap-2 pt-2 border-t border-border/50">
                              {!rev.approved && (
                                <button onClick={() => toggleReviewApproval(rev.id)} className="text-[10px] font-bold text-primary hover:underline">Approve</button>
                              )}
                              <button onClick={() => deleteReview(rev.id)} className="text-[10px] font-bold text-danger hover:underline">Delete Review</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )}
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="p-6 border-t border-border bg-surface/5 flex items-center justify-end gap-3">
            <button onClick={resetForm} className="px-6 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-all">Discard</button>
            <Button type="submit" variant="primary" loading={saving} onClick={(e) => handleSubmit(e as any)} className="px-10 py-2.5 shadow-lg shadow-primary/20">
              {editingId ? 'Update Product' : 'Save Product'}
            </Button>
          </div>
        </div>
      </Modal>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 text-muted bg-card rounded-[2rem] border border-border/50 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
             <svg className="w-10 h-10 text-muted/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-sm font-medium">No products found matching your search.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[2rem] border border-border bg-card/30 backdrop-blur-sm shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/5 border-b border-border">
                <th className="p-5 text-left">
                  <input 
                    type="checkbox"
                    checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-border text-primary focus:ring-primary bg-card"
                  />
                </th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-muted">Product</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-muted text-center">In Stock</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-muted text-center">Featured</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-muted text-right">Price</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id} className={cn(
                  "group hover:bg-secondary/5 transition-colors border-b border-border last:border-0",
                  selectedIds.includes(p.id) && "bg-primary/[0.02]"
                )}>
                  <td className="p-5">
                    <input 
                      type="checkbox"
                      checked={selectedIds.includes(p.id)}
                      onChange={() => toggleSelect(p.id)}
                      className="rounded border-border text-primary focus:ring-primary bg-card"
                    />
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-secondary/10 border border-border overflow-hidden shadow-sm">
                        {(p as any).images?.[0] ? (
                          <img src={(p as any).images[0]} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground tracking-tight">{p.name}</p>
                        <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-0.5">{p.category_name || 'Uncategorized'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <button onClick={() => toggleStock(p.id, p.in_stock)}>
                      <Badge variant={p.in_stock ? 'success' : 'danger'} className="cursor-pointer font-bold px-3 py-1 rounded-full uppercase text-[9px]">
                        {p.in_stock ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                    </button>
                  </td>
                  <td className="p-5 text-center">
                    <button onClick={() => toggleFeatured(p.id, p.is_featured)}>
                      <Badge variant={p.is_featured ? 'info' : 'default'} className="cursor-pointer font-bold px-3 py-1 rounded-full uppercase text-[9px]">
                        {p.is_featured ? 'Featured' : 'Standard'}
                      </Badge>
                    </button>
                  </td>
                  <td className="p-5 text-right">
                    <p className="text-sm font-black text-foreground tracking-tighter">{formatPrice(p.price_ghs)}</p>
                    <p className="text-[10px] text-muted font-mono font-bold">¥{p.price_cny}</p>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(p)}
                        className="p-2 rounded-xl hover:bg-primary/10 text-primary transition-all hover:scale-110"
                        title="Edit Product"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => deleteProduct(p.id)}
                        className="p-2 rounded-xl hover:bg-danger/10 text-danger transition-all hover:scale-110"
                        title="Delete Product"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal 
        open={confirmModal.open} 
        onClose={() => setConfirmModal(prev => ({ ...prev, open: false }))}
        className="max-w-md"
      >
        <div className="text-center p-2">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
            confirmModal.isDanger ? "bg-danger/10 text-danger" : "bg-primary/10 text-primary"
          )}>
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2 tracking-tight">{confirmModal.title}</h3>
          <p className="text-sm text-muted mb-8 leading-relaxed">{confirmModal.message}</p>
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))}>Cancel</Button>
            <Button 
              variant={confirmModal.isDanger ? "danger" : "primary"} 
              fullWidth 
              onClick={confirmModal.onConfirm}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
