'use client'

import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface Category {
  id: string
  name: string
  slug: string
  description: string
  image: string | null
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [form, setForm] = useState({ id: '', name: '', slug: '', description: '', image: '' })

  async function load() {
    try {
      const res = await fetch('/api/admin/categories')
      if (res.ok) setCategories(await res.json())
    } catch {
      setError('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function resetForm() {
    setForm({ id: '', name: '', slug: '', description: '', image: '' })
    setEditingId(null)
    setShowForm(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const url = '/api/admin/categories'
      const method = editingId ? 'PATCH' : 'POST'
      const body = editingId ? { id: editingId, name: form.name, slug: form.slug, description: form.description, image: form.image } : form
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) {
        resetForm()
        load()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to save')
      }
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category?')) return
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' })
      if (res.ok) load()
    } catch {
      setError('Failed to delete')
    }
  }

  function handleEdit(cat: Category) {
    setForm({ id: cat.id, name: cat.name, slug: cat.slug, description: cat.description || '', image: cat.image || '' })
    setEditingId(cat.id)
    setShowForm(true)
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-8 bg-surface rounded w-48 animate-pulse" />
        {[...Array(5)].map((_, i) => (<div key={i} className="h-16 bg-surface rounded-xl animate-pulse" />))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary-dark transition-colors">Add Category</button>
        )}
      </div>

      {error && <div className="p-4 rounded-xl bg-danger/10 text-danger text-sm mb-6">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-border p-6 mb-6 space-y-4">
          <h2 className="font-semibold">{editingId ? 'Edit Category' : 'New Category'}</h2>
          {!editingId && <Input label="ID (slug-style, e.g. 'new-cat')" value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} required />}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
          </div>
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input label="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          <div className="flex gap-3">
            <Button type="submit" variant="primary" loading={saving}>{editingId ? 'Update' : 'Create'}</Button>
            <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-secondary/50 transition-colors">
            <div>
              <p className="font-medium text-sm">{cat.name}</p>
              <p className="text-xs text-muted">{cat.slug} {cat.description && `- ${cat.description}`}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(cat)} className="text-xs text-primary hover:underline">Edit</button>
              <button onClick={() => handleDelete(cat.id)} className="text-xs text-danger hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
