'use client'

import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onUpload: (url: string) => void
  label?: string
  className?: string
  variant?: 'default' | 'compact'
  value?: string
}

export default function FileUpload({ onUpload, label, className, variant = 'default', value }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function compressImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX_WIDTH = 1200
          const MAX_HEIGHT = 1200
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height
              height = MAX_HEIGHT
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob)
              else reject(new Error('Canvas to Blob failed'))
            },
            'image/jpeg',
            0.7
          )
        }
      }
      reader.onerror = (error) => reject(error)
    })
  }

  async function handleUpload(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    setIsUploading(true)
    setError('')

    try {
      const compressedBlob = await compressImage(file)
      const formData = new FormData()
      formData.append('file', compressedBlob, file.name.replace(/\.[^/.]+$/, "") + ".jpg")

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const { url } = await res.json()
        onUpload(url)
      } else {
        const data = await res.json()
        setError(data.error || 'Upload failed')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError('Error during upload compression')
    } finally {
      setIsUploading(false)
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleUpload(file)
  }

  if (variant === 'compact') {
    return (
      <div className={cn('relative', className)}>
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'w-12 h-12 rounded-xl border border-dashed flex items-center justify-center cursor-pointer overflow-hidden transition-all bg-card',
            isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-surface/50',
            isUploading && 'opacity-50 pointer-events-none'
          )}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleUpload(file)
            }}
            className="hidden"
            accept="image/*"
          />

          {isUploading ? (
            <svg className="w-5 h-5 animate-spin text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : value ? (
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <svg className="w-6 h-6 text-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>
        {error && <p className="absolute -bottom-4 left-0 text-[10px] text-danger whitespace-nowrap">{error}</p>}
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && <label className="text-sm font-medium">{label}</label>}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300',
          isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-surface/50',
          isUploading && 'opacity-50 pointer-events-none'
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleUpload(file)
          }}
          className="hidden"
          accept="image/*"
        />

        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {isUploading ? (
            <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            {isUploading ? 'Uploading...' : 'Click or drag to upload'}
          </p>
          <p className="text-xs text-muted mt-1">PNG, JPG, WebP up to 5MB</p>
        </div>

        {error && <p className="text-xs text-danger mt-2">{error}</p>}
      </div>
    </div>
  )
}
