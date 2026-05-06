'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin')
  const isAuth = pathname === '/login' || pathname === '/register'

  return (
    <>
      {!isDashboard && !isAuth && <Navbar />}
      <main className={isDashboard || isAuth ? '' : 'flex-1 pt-28'}>{children}</main>
      {!isDashboard && !isAuth && <Footer />}
    </>
  )
}
