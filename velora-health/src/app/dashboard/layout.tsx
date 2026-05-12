'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const sidebarLinks = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/dashboard/orders',
    label: 'Orders',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    href: '/dashboard/addresses',
    label: 'Addresses',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authChecked, setAuthChecked] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [profile, setProfile] = useState<{ full_name?: string; email?: string } | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/session')
        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            setAuthenticated(true)
            const profileRes = await fetch('/api/user/settings')
            if (profileRes.ok) {
              const profileData = await profileRes.json()
              setProfile(profileData)
            }
          }
        }
      } catch {
        setAuthenticated(false)
      } finally {
        setAuthChecked(true)
      }
    }
    checkAuth()
  }, [])

  useEffect(() => {
    if (authChecked && !authenticated) {
      router.push('/login')
    }
  }, [authChecked, authenticated, router])

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!authenticated) return null

  return (
    <div className="min-h-screen bg-[#050A08] flex">
      {/* Mobile Header - Now top-0 because navbar is hidden */}
      <header className="lg:hidden fixed top-0 left-0 w-full z-[90] flex items-center justify-between px-6 py-4 bg-[#0A1410] border-b border-[rgba(242,232,223,0.05)]">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-[#F2E8DF] hover:text-[#BFA075] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-serif text-lg tracking-[0.2em] text-[#BFA075]">INTIMA</span>
        </div>
      </header>

      {/* Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Fixed Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-[280px] bg-[#0A1410] border-r border-[rgba(242,232,223,0.05)] z-[101] transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col pt-8 lg:pt-10">
          {/* Logo Branding */}
          <div className="px-10 mb-12 hidden lg:block">
            <Link href="/" className="font-serif text-2xl tracking-[0.3em] text-[#BFA075] no-underline">
              INTIMA
            </Link>
          </div>

          {/* User Profile Section */}
          <div className="px-6 mb-8">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[rgba(191,160,117,0.03)] border border-[rgba(191,160,117,0.08)]">
              <div className="w-11 h-11 rounded-full bg-[#BFA075] flex items-center justify-center text-[#0A1410] font-bold text-base uppercase flex-shrink-0">
                {profile?.full_name?.[0] || 'U'}
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-[#F2E8DF] truncate">{profile?.full_name || 'User'}</h2>
                <p className="text-[10px] text-[#8A7F76] truncate tracking-wider uppercase">{profile?.email || 'Account'}</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300',
                    isActive
                      ? 'bg-[#BFA075] text-[#0A1410] shadow-[0_4px_12px_rgba(191,160,117,0.2)]'
                      : 'text-[#8A7F76] hover:text-[#F2E8DF] hover:bg-[rgba(242,232,223,0.03)]'
                  )}
                >
                  <span className={isActive ? "text-[#0A1410]" : "text-inherit"}>
                    {link.icon}
                  </span>
                  {link.label}
                </Link>
              )
            })}

            {/* Shop Button */}
            <div className="pt-4 px-2">
              <Link 
                href="/shop"
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-[rgba(191,160,117,0.1)] text-[#BFA075] border border-[rgba(191,160,117,0.2)] rounded-xl text-xs font-bold uppercase tracking-[0.1em] hover:bg-[#BFA075] hover:text-[#0A1410] transition-all no-underline"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Browse Shop
              </Link>
            </div>
          </nav>

          {/* Logout/Bottom Area */}
          <div className="p-4 border-t border-[rgba(242,232,223,0.05)]">
            <button 
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' })
                router.replace('/login')
                router.refresh()
              }}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-[#EF4444] hover:bg-red-500/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area - Scrollable */}
      <main className="flex-1 lg:ml-[280px] pt-20 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-12">
          <div className="max-w-6xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
