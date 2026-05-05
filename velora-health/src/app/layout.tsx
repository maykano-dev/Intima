import type { Metadata } from "next"
import Script from "next/script"
import "./globals.css"
import { CartProvider } from "@/components/cart/CartProvider"
import { ThemeProvider } from "@/components/layout/ThemeProvider"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import CartDrawer from "@/components/layout/CartDrawer"

import RevealObserver from "@/components/layout/RevealObserver"

export const metadata: Metadata = {
  title: {
    default: "Intima — Discreet Sexual Wellness, Ghana",
    template: "%s | Intima",
  },
  description:
    "Ghana's most discreet sexual wellness platform. Quality-verified products, anonymous checkout, and fast doorstep delivery. Your privacy is our promise.",
  keywords: [
    "sexual wellness Ghana",
    "discreet delivery Accra",
    "sexual health products Ghana",
    "intimacy products",
    "MTN MoMo payment",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    title: "Intima — Discreet Sexual Wellness",
    description:
      "Ghana's most discreet sexual wellness platform. Quality-verified products, anonymous checkout.",
    type: "website",
    locale: "en_GH",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased dark"
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                document.documentElement.classList.add('dark');
                var t = localStorage.getItem('intima-theme');
                if (t === 'light') document.documentElement.classList.remove('dark');
              } catch(e) {}
            `,
          }}
        />
        <Script
          src="https://js.paystack.co/v1/inline.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <CartProvider>
            <RevealObserver />
            <Navbar />
            <main className="flex-1 pt-28">{children}</main>
            <Footer />
            <CartDrawer />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
