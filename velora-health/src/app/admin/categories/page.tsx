'use client'

import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import { cn } from '@/lib/utils'

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
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void; isDanger?: boolean }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  })

  const [form, setForm] = useState({ name: '' })

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
    setForm({ name: '' })
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
      
      // Auto-generate slug/id from name for new categories
      const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      const body = editingId 
        ? { id: editingId, name: form.name, slug } 
        : { id: slug, name: form.name, slug }

      const res = await fetch(url, { 
        method, 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(body) 
      })

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
    setConfirmModal({
      open: true,
      title: 'Delete Category',
      message: 'Are you sure you want to delete this category? This will affect all products assigned to it.',
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' })
          if (res.ok) {
            load()
            setConfirmModal(prev => ({ ...prev, open: false }))
          }
        } catch {
          setError('Failed to delete')
        }
      }
    })
  }

  function handleEdit(cat: Category) {
    setForm({ name: cat.name })
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
    <>
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
          <Input 
            label="Category Name" 
            value={form.name} 
            onChange={(e) => setForm({ name: e.target.value })} 
            required 
            placeholder="e.g. Wellness, Herbal, etc."
          />
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
              <p className="text-xs text-muted">ID: {cat.id}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(cat)} className="text-xs text-primary hover:underline">Edit</button>
              <button onClick={() => handleDelete(cat.id)} className="text-xs text-danger hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>

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
