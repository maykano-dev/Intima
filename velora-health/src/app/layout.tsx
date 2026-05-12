import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import RevealObserver from '@/components/layout/RevealObserver'
import BackToTop from '@/components/layout/BackToTop'
import '@/app/globals.css'
import ConditionalLayout from '@/components/layout/ConditionalLayout'
import CartDrawer from '@/components/layout/CartDrawer'
import { CartProvider } from '@/components/cart/CartProvider'
import { Toaster } from 'sonner'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
}

export const metadata: Metadata = {
  title: 'Intima - Premium Adult Store',
  description: 'Shop the most exclusive adult toys and accessories in Ghana.',
  keywords: ['adult store', 'ghana', 'toys', 'wellness', 'intima'],
  authors: [{ name: 'Intima' }],
  openGraph: {
    title: 'Intima - Premium Adult Store',
    description: 'Exclusive adult toys and wellness accessories in Ghana.',
    url: 'https://intima.love',
    siteName: 'Intima',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_GH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Intima - Premium Adult Store',
    description: 'Exclusive adult toys and wellness accessories in Ghana.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-background text-foreground overflow-x-hidden selection:bg-primary/30 min-h-full flex flex-col">
        <ThemeProvider>
          <CartProvider>
            <RevealObserver />
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
            <CartDrawer />
            <Toaster position="bottom-right" theme="dark" richColors />
            <BackToTop />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
