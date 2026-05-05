'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCart } from '@/components/cart/CartProvider'
import { cn } from '@/lib/utils'
import ThemeToggle from '@/components/layout/ThemeToggle'
import intimaLogo from '@/assets/intimalogo.png'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Blog' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { itemCount, openDrawer } = useCart()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
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
    <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <div className="overflow-hidden rounded-lg flex items-center">
              <Image
                src={intimaLogo}
                alt="Intima"
                className="h-10 w-auto object-contain dark:brightness-0 dark:invert"
                priority
              />
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors duration-200 relative py-1',
                  pathname === link.href
                    ? 'text-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary after:rounded-full'
                    : 'text-muted hover:text-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle />

            {user && (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                  aria-label="Account menu"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-2xl shadow-lg z-50 py-2 overflow-hidden">
                      <div className="px-4 py-2 border-b border-border">
                        <p className="text-xs text-muted truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        My Dashboard
                      </Link>
                      <Link
                        href="/dashboard/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        My Orders
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </Link>
                      <div className="border-t border-border mt-1 pt-1">
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Admin Panel
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-secondary transition-colors w-full text-left"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {!user && (
              <Link
                href="/login"
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
                aria-label="Sign in"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </Link>
            )}

            <button
              onClick={openDrawer}
              className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label="Open cart"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" onClick={closeMobile} />
      )}

      {/* Slide-out sidebar */}
      <div
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-72 bg-card shadow-2xl md:hidden transform transition-transform duration-300 ease-in-out',
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <Link href="/" onClick={closeMobile} className="flex items-center">
              <div className="overflow-hidden rounded-lg flex items-center">
                <Image
                  src={intimaLogo}
                  alt="Intima"
                  className="h-10 w-auto object-contain dark:brightness-0 dark:invert"
                />
              </div>
            </Link>
            <button
              onClick={closeMobile}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobile}
                  className={cn(
                    'px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                    pathname === link.href
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted hover:bg-secondary hover:text-foreground'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="border-t border-border my-4 pt-4">
              {user ? (
                <>
                  <p className="px-4 text-xs text-muted mb-2 truncate">{user.email}</p>
                  <Link href="/dashboard" onClick={closeMobile} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted hover:bg-secondary hover:text-foreground transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    Dashboard
                  </Link>
                  <Link href="/dashboard/orders" onClick={closeMobile} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted hover:bg-secondary hover:text-foreground transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    Orders
                  </Link>
                  <Link href="/admin" onClick={closeMobile} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted hover:bg-secondary hover:text-foreground transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    Admin
                  </Link>
                  <button onClick={() => { handleLogout(); closeMobile() }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-danger hover:bg-secondary transition-colors w-full text-left">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={closeMobile} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted hover:bg-secondary hover:text-foreground transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                    Sign In
                  </Link>
                  <Link href="/register" onClick={closeMobile} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted hover:bg-secondary hover:text-foreground transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="border-t border-border p-5">
            <Link
              href="/shop"
              onClick={closeMobile}
              className="flex items-center justify-center w-full rounded-lg bg-primary text-white px-5 py-3 text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
