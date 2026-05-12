'use client'

import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import FileUpload from '@/components/ui/FileUpload'
import { cn } from '@/lib/utils'

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
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void; isDanger?: boolean }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  })

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
    setConfirmModal({
      open: true,
      title: 'Delete Post',
      message: 'Are you sure you want to delete this blog post?',
      isDanger: true,
      onConfirm: async () => {
        try {
          await fetch(`/api/admin/blog?id=${id}`, { method: 'DELETE' })
          load()
          setConfirmModal(prev => ({ ...prev, open: false }))
        } catch {
          setError('Failed to delete')
        }
      }
    })
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
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Blog</h1>
        {!showForm && <button onClick={() => setShowForm(true)} className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary-dark transition-colors">New Post</button>}
      </div>

      {error && <div className="p-4 rounded-xl bg-danger/10 text-danger text-sm mb-6">{error}</div>}

      <Modal open={showForm} onClose={resetForm} className="max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[85vh] overflow-y-auto no-scrollbar pr-2">
          <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
            <h2 className="font-serif text-2xl tracking-wide">{editingId ? 'Edit Post' : 'New Post'}</h2>
            <button type="button" onClick={resetForm} className="text-muted hover:text-foreground transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Auto-generated if empty" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
                <Input label="Date" type="date" value={form.published_at} onChange={(e) => setForm({ ...form, published_at: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium ml-1">Featured Image</label>
                <div className="flex gap-4 items-start">
                  {form.image && <img src={form.image} className="w-24 h-24 rounded-xl object-cover border border-border" />}
                  <FileUpload 
                    onUpload={(url) => setForm({ ...form, image: url })}
                    className="flex-1"
                    label="Upload Image"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium ml-1">Excerpt</label>
              <textarea 
                placeholder="A short summary of the post..." 
                value={form.excerpt} 
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })} 
                className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm min-h-[100px] outline-none focus:ring-2 focus:ring-primary" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">Content</label>
            <textarea 
              placeholder="Write your story here (supports HTML/Markdown)..." 
              value={form.content} 
              onChange={(e) => setForm({ ...form, content: e.target.value })} 
              className="w-full px-4 py-4 rounded-xl border border-border bg-card text-sm min-h-[400px] outline-none focus:ring-2 focus:ring-primary font-mono" 
              required 
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
            <button type="button" onClick={resetForm} className="px-6 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-all">Cancel</button>
            <Button type="submit" variant="primary" loading={saving} className="px-8 py-2.5">{editingId ? 'Update Post' : 'Publish Post'}</Button>
          </div>
        </form>
      </Modal>

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
