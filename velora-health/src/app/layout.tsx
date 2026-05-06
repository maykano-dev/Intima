import type { Metadata, Viewport } from 'next'
import './globals.css'
import './landing.css'
import { CartProvider } from '@/components/cart/CartProvider'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BackToTop from '@/components/layout/BackToTop'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import RevealObserver from '@/components/layout/RevealObserver'
import ConditionalLayout from '@/components/layout/ConditionalLayout'
import CartDrawer from '@/components/layout/CartDrawer'
import { Toaster } from 'sonner'



export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: {
    default: 'Intima Wellness | Discreet Delivery & Absolute Privacy Ghana',
    template: '%s | Intima Wellness'
  },
  description: 'Ghana\'s premium discreet wellness shop. Fast, anonymous doorstep delivery of health, lifestyle, and intimacy essentials. Absolute privacy guaranteed with plain packaging and secure MoMo payments.',
  keywords: [
    'wellness Ghana', 'discreet delivery Accra', 'privacy-focused shopping', 'lifestyle essentials Ghana', 
    'anonymous delivery', 'plain packaging shop', 'health products Accra', 'wellness products Kumasi', 
    'secure intimacy shopping', 'discreet fulfillment', 'MoMo payment shop', 'anonymous wellness', 
    'Intima wellness', 'Ghana health and wellness', 'fast delivery Accra', 'doorstep delivery Ghana'
  ],
  authors: [{ name: 'Intima' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_GH',
    url: '/',
    siteName: 'Intima Wellness',
    title: 'Intima Wellness | Absolute Privacy',
    description: 'Premium wellness and lifestyle essentials. Discreetly delivered.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Intima Wellness',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Intima Wellness | Absolute Privacy',
    description: 'Premium wellness essentials. Discreetly delivered.',
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
