'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCart } from '@/components/cart/CartProvider'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Blog' },
  { href: '/faq', label: 'FAQ' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { itemCount, openDrawer } = useCart()
  const pathname = usePathname()
  const router = useRouter()

  // Check auth via cookie instead of API call
  useEffect(() => {
    const hasSession = document.cookie.includes('sb-')
    if (!hasSession) return
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
  }, [])

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    setUserMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  function closeMobile() { setMobileOpen(false) }

  return (
    <>
      <nav className={cn(
        'fixed top-0 left-0 w-full z-50 flex items-center justify-between px-[5%] bg-[rgba(10,20,16,0.8)] backdrop-blur-[20px] border-b border-[rgba(242,232,223,0.1)]',
        scrolled ? 'py-[1.2rem]' : 'py-[2rem]'
      )}>
        <Link href="/" className="font-serif text-[2rem] tracking-[0.1em] text-[#BFA075] no-underline">
          INTIMA
        </Link>

        <ul className="hidden md:flex items-center gap-12">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  'text-[0.72rem] tracking-[0.2em] uppercase no-underline',
                  pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                    ? 'text-[#BFA075]'
                    : 'text-[#5A7263] hover:text-[#BFA075]'
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="p-2 text-[#F2E8DF] hover:text-[#BFA075] transition-colors"
                aria-label="Account menu"
              >
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#1A2E26] border border-[rgba(242,232,223,0.1)] shadow-lg z-50 py-2">
                    <div className="px-4 py-2 border-b border-[rgba(242,232,223,0.1)]">
                      <p className="text-xs text-[#8A7F76] truncate">{user.email}</p>
                    </div>
                    <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#F2E8DF] hover:text-[#BFA075] hover:bg-[rgba(242,232,223,0.05)] transition-colors no-underline">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                      Dashboard
                    </Link>
                    <Link href="/dashboard/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#F2E8DF] hover:text-[#BFA075] hover:bg-[rgba(242,232,223,0.05)] transition-colors no-underline">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                      Orders
                    </Link>
                    <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#F2E8DF] hover:text-[#BFA075] hover:bg-[rgba(242,232,223,0.05)] transition-colors no-underline">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      Admin
                    </Link>
                    <div className="border-t border-[rgba(242,232,223,0.1)] mt-1 pt-1">
                      <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#EF4444] hover:bg-[rgba(242,232,223,0.05)] transition-colors w-full text-left">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="hidden sm:inline-block text-[0.7rem] tracking-[0.1em] uppercase text-[#F2E8DF] hover:text-[#BFA075] transition-colors no-underline px-2">
                Sign In
              </Link>
              <Link href="/register" className="hidden sm:inline-block text-[0.7rem] tracking-[0.15em] uppercase font-medium px-5 py-2.5 bg-[#BFA075] text-[#0A1410] hover:bg-[#F2E8DF] hover:-translate-y-[2px] no-underline">
                Create Account
              </Link>
            </>
          )}

          <button
            onClick={openDrawer}
            className="relative p-2 text-[#F2E8DF] hover:text-[#BFA075] transition-colors"
            aria-label="Open cart"
          >
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] rounded-full bg-[#BFA075] text-[#0A1410] text-[10px] flex items-center justify-center font-medium">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-[#F2E8DF]"
            aria-label="Toggle menu"
          >
            <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" onClick={closeMobile} />
      )}

      <div className={cn(
        'fixed top-0 right-0 z-50 h-full w-[280px] bg-[#1A2E26] shadow-2xl md:hidden transform transition-all duration-300 ease-in-out flex flex-col',
        mobileOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        <div className="flex items-center justify-between p-6 border-b border-[rgba(242,232,223,0.1)]">
          <span className="font-serif text-xl tracking-[0.3em] text-[#F2E8DF]">INTIMA</span>
          <button onClick={closeMobile} className="text-[#F2E8DF] text-2xl leading-none p-1">
            &times;
          </button>
        </div>

        <ul className="flex-1 p-6 space-y-1">
          {[...navLinks, { href: '/contact', label: 'Contact' }].map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={closeMobile}
                className="block py-3 text-[#F2E8DF] text-sm tracking-[0.08em] border-b border-[rgba(242,232,223,0.05)] hover:text-[#BFA075] hover:pl-2 transition-all no-underline"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="p-6 border-t border-[rgba(242,232,223,0.1)] space-y-3">
          {user ? (
            <>
              <Link href="/dashboard" onClick={closeMobile} className="block text-center py-3 text-sm tracking-[0.12em] uppercase text-[#F2E8DF] border border-[rgba(242,232,223,0.1)] hover:bg-[rgba(242,232,223,0.05)] transition-all no-underline">
                Dashboard
              </Link>
              <button onClick={() => { handleLogout(); closeMobile() }} className="w-full py-3 text-sm tracking-[0.12em] uppercase text-[#EF4444] border border-[#EF4444]/30 hover:bg-[#EF4444]/10 transition-all">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={closeMobile} className="block text-center py-3 text-sm tracking-[0.12em] uppercase text-[#F2E8DF] border border-[rgba(242,232,223,0.1)] hover:bg-[rgba(242,232,223,0.05)] transition-all no-underline">
                Sign In
              </Link>
              <Link href="/register" onClick={closeMobile} className="block text-center py-3 text-sm tracking-[0.12em] uppercase font-medium bg-[#BFA075] text-[#0A1410] hover:bg-[#F2E8DF] transition-all no-underline">
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}
