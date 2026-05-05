'use client'

import { useEffect } from 'react'

export default function CustomCursor() {
  useEffect(() => {
    const dot = document.getElementById('cursorDot')
    const ring = document.getElementById('cursorRing')
    if (!dot || !ring) return

    const onMouse = (e: MouseEvent) => {
      dot.style.left = e.clientX + 'px'
      dot.style.top = e.clientY + 'px'
      ring.style.left = e.clientX + 'px'
      ring.style.top = e.clientY + 'px'
    }
    document.addEventListener('mousemove', onMouse)

    document.querySelectorAll('a, button').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        ring.style.width = '56px'
        ring.style.height = '56px'
        ring.style.borderColor = 'var(--color-primary)'
      })
      el.addEventListener('mouseleave', () => {
        ring.style.width = '36px'
        ring.style.height = '36px'
        ring.style.borderColor = 'var(--color-primary-light)'
      })
    })

    return () => {
      document.removeEventListener('mousemove', onMouse)
    }
  }, [])

  return (
    <div className="cursor" id="cursor">
      <div className="cursor-dot" id="cursorDot" />
      <div className="cursor-ring" id="cursorRing" />
    </div>
  )
}
