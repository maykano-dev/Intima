'use client'

import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  image: string | null
  author: string
  published_at: string
}

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', content: '', image: '', author: 'Intima Wellness Team', published_at: '' })

  async function load() {
    try {
      const res = await fetch('/api/admin/blog')
      if (res.ok) setPosts(await res.json())
    } catch {
      setError('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function resetForm() {
    setForm({ title: '', slug: '', excerpt: '', content: '', image: '', author: 'Intima Wellness Team', published_at: '' })
    setEditingId(null)
    setShowForm(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const method = editingId ? 'PATCH' : 'POST'
      const body = editingId ? { ...form, id: editingId } : form
      const res = await fetch('/api/admin/blog', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) { resetForm(); load() }
      else { const d = await res.json(); setError(d.error || 'Failed to save') }
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this post?')) return
    try {
      await fetch(`/api/admin/blog?id=${id}`, { method: 'DELETE' })
      load()
    } catch {
      setError('Failed to delete')
    }
  }

  function handleEdit(post: BlogPost) {
    setForm({ title: post.title, slug: post.slug, excerpt: post.excerpt || '', content: post.content || '', image: post.image || '', author: post.author, published_at: post.published_at.split('T')[0] })
    setEditingId(post.id)
    setShowForm(true)
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-8 bg-surface rounded w-48 animate-pulse" />
        {[...Array(3)].map((_, i) => (<div key={i} className="h-20 bg-surface rounded-2xl animate-pulse" />))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Blog</h1>
        {!showForm && <button onClick={() => setShowForm(true)} className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary-dark transition-colors">New Post</button>}
      </div>

      {error && <div className="p-4 rounded-xl bg-danger/10 text-danger text-sm mb-6">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-border p-6 mb-6 space-y-4">
          <h2 className="font-semibold">{editingId ? 'Edit Post' : 'New Post'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Auto-generated if empty" />
            <Input label="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
            <Input label="Published Date" type="date" value={form.published_at} onChange={(e) => setForm({ ...form, published_at: e.target.value })} />
          </div>
          <Input label="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          <textarea placeholder="Excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-border bg-transparent text-sm min-h-[60px]" />
          <textarea placeholder="Content (full HTML or markdown)" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-border bg-transparent text-sm min-h-[200px]" required />
          <div className="flex gap-3">
            <Button type="submit" variant="primary" loading={saving}>{editingId ? 'Update' : 'Create'}</Button>
            <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
          </div>
        </form>
      )}

      {posts.length === 0 ? (
        <div className="text-center py-16 text-muted">No blog posts yet.</div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="rounded-2xl border border-border p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{post.title}</p>
                  <p className="text-xs text-muted mt-1">{post.slug} · {post.author} · {new Date(post.published_at).toLocaleDateString()}</p>
                  {post.excerpt && <p className="text-sm text-muted mt-2 line-clamp-2">{post.excerpt}</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleEdit(post)} className="text-xs text-primary hover:underline">Edit</button>
                  <button onClick={() => handleDelete(post.id)} className="text-xs text-danger hover:underline">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
