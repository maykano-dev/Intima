import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Intima terms of service: conditions for using our platform.',
}

export default function TermsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <p className="text-muted mb-8">Last updated: April 2025</p>

        <div className="prose prose-sm max-w-none text-muted space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By using the Intima website and purchasing our products, you agree to these
              terms of service. If you do not agree, please do not use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Age Restriction</h2>
            <p>
              You must be 18 years or older to use this website and purchase products. By placing
              an order, you confirm that you are at least 18 years of age.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. Product Information</h2>
            <p>
              Product descriptions and images are provided for informational purposes. We make
              every effort to ensure accuracy, but minor variations may occur. All products are
              intended for personal use only and not for resale unless explicitly agreed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Medical Disclaimer</h2>
            <p>
              Our products are not intended to diagnose, treat, cure, or prevent any medical
              condition. If you have a medical condition or concern, consult a qualified healthcare
              professional before using any product.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Ordering & Payment</h2>
            <ul>
              <li>All prices are in Ghanaian Cedis (GHS) and include applicable taxes</li>
              <li>Payment is required in full before order processing</li>
              <li>We accept MTN MoMo, Vodafone Cash, AirtelTigo Money, and Visa/Mastercard</li>
              <li>Orders are confirmed via email and WhatsApp after payment verification</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. Shipping & Delivery</h2>
            <ul>
              <li>Same-day delivery available in Greater Accra for orders before 4pm</li>
              <li>National delivery: 2-5 business days depending on location</li>
              <li>Delivery times are estimates and not guaranteed</li>
              <li>Risk of loss passes to you upon delivery</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">7. Returns & Refunds</h2>
            <p>
              Due to hygiene regulations, we cannot accept returns on opened products. Damaged
              or defective items must be reported within 48 hours of delivery for replacement.
              Refunds are processed within 5-7 business days once approved.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">8. Limitation of Liability</h2>
            <p>
              Intima is not liable for any indirect, incidental, or consequential damages
              arising from the use of our products or website. Our total liability is limited to
              the purchase price of the product in question.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">9. Changes to Terms</h2>
            <p>
              We reserve the right to update these terms at any time. Changes are effective
              immediately upon posting. Continued use of the platform after changes constitutes
              acceptance of the new terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
