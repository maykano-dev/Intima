import Hero from "@/components/home/Hero"
import TrustBadges from "@/components/home/TrustBadges"
import HowItWorks from "@/components/home/HowItWorks"
import FeaturedProducts from "@/components/home/FeaturedProducts"
import Testimonials from "@/components/home/Testimonials"
import ShippingSection from "@/components/home/ShippingSection"
import NewsletterSignup from "@/components/home/NewsletterSignup"
import Link from "next/link"
import Button from "@/components/ui/Button"

export default function Home() {
  return (
    <>
      <Hero />
      <TrustBadges />
      <HowItWorks />
      <FeaturedProducts />

      {/* Why Intima Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="bg-primary/5 rounded-3xl p-8 lg:p-12">
                <h2 className="text-2xl sm:text-3xl font-bold mb-6">
                  Why Intima?
                </h2>
                <div className="space-y-5">
                  {[
                    {
                      title: "Plain Packaging, Always",
                      desc: "Your order arrives in an unmarked box. No logos, no product names, no indication of contents. Every single time.",
                      icon: (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      ),
                    },
                    {
                      title: "Zero Account Required",
                      desc: "No profile. No login. No data trail. Just order and receive — that's it. Guest checkout is our default.",
                      icon: (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      ),
                    },
                    {
                      title: "Pay Your Way",
                      desc: "MTN Mobile Money, Vodafone Cash, AirtelTigo, or Visa/Mastercard. All payments are encrypted and processed securely by Paystack.",
                      icon: (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      ),
                    },
                    {
                      title: "Same-Day in Accra",
                      desc: "Order before 4pm and receive it the same day. We use trusted riders who understand the importance of discretion.",
                      icon: (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      ),
                    },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{item.title}</h3>
                        <p className="text-sm text-muted mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-secondary rounded-3xl p-8 lg:p-10">
                <h3 className="text-xl font-bold mb-1">Ghana-Based &amp; Ghana-Owned</h3>
                <p className="text-sm text-muted mb-6">
                  We&apos;re not an international store with slow shipping. We&apos;re based in Accra,
                  built for Ghanaian customers.
                </p>
                <ul className="space-y-3">
                  {[
                    "Local customer support on WhatsApp — reply in under 30 min",
                    "Products selected for the Ghanaian market",
                    "Prices in GHS — no hidden conversion fees",
                    "Quality-verified, body-safe products only",
                    "Trusted by hundreds of customers across Ghana",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm">
                      <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-accent rounded-3xl p-8 lg:p-10 text-white">
                <h3 className="text-xl font-bold mb-2">Not Sure Where to Start?</h3>
                <p className="text-white/70 text-sm mb-5">
                  Browse our curated starter bundles designed for first-time buyers.
                </p>
                <Link href="/shop">
                <Button className="bg-white text-accent hover:bg-white/90 dark:bg-primary dark:text-white dark:hover:bg-primary-dark">
                  View Starter Bundles
                </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Testimonials />

      {/* Stats Section */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '100%', label: 'Discreet Delivery' },
              { value: '2-4 hrs', label: 'Same-Day in Accra' },
              { value: '5+', label: 'Payment Methods' },
              { value: '50+', label: 'Products Available' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ShippingSection />
      <NewsletterSignup />

      {/* Final CTA */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Experience True Discretion
            </h2>
            <p className="text-muted mb-8 max-w-lg mx-auto">
              Join hundreds of Ghanaians who trust Intima for their wellness needs.
              Your privacy is not just a feature — it&apos;s our foundation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/shop">
                <Button variant="primary" size="lg">Start Shopping</Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg">Learn More</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
