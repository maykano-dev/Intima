import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/components/cart/CartProvider"
import { ThemeProvider } from "@/components/layout/ThemeProvider"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import CartDrawer from "@/components/layout/CartDrawer"
import AgeGate from "@/components/layout/AgeGate"
import WhatsAppButton from "@/components/layout/WhatsAppButton"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <CartProvider>
            <AgeGate />
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
            <WhatsAppButton />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
