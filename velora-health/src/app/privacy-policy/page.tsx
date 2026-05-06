import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Intima privacy policy: how we collect, use, and protect your data.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-muted mb-8">Last updated: April 2025</p>

        <div className="prose prose-sm max-w-none text-muted space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Our Commitment to Privacy</h2>
            <p>
              Intima is built on trust. Your privacy is not just a policy, it is our core
              value. We collect the minimum data necessary to process your order and deliver it.
              We never share your personal information with third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. What We Collect</h2>
            <p>When you place an order, we collect:</p>
            <ul>
              <li>Your name (for delivery and order confirmation)</li>
              <li>Your email address (for order confirmation and updates)</li>
              <li>Your phone number (for delivery coordination and WhatsApp updates)</li>
              <li>Your delivery address</li>
              <li>Order details (products purchased, quantity, total)</li>
            </ul>
            <p>We do <strong>not</strong> require you to create an account or store a profile.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. How We Protect Your Data</h2>
            <ul>
              <li>All site traffic is encrypted via HTTPS SSL</li>
              <li>Payment processing is handled entirely by Paystack. We never see your card or MoMo PIN</li>
              <li>Your data is stored securely in access-controlled databases</li>
              <li>We retain order data only as long as necessary for legal and accounting purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Discreet Packaging & Billing</h2>
            <p>
              All orders are shipped in plain, unbranded packaging. No product names, logos, or
              brand markings are visible on the outside. Your billing statement shows a neutral
              descriptor. We never send unsolicited mail to your address.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Data Sharing</h2>
            <p>
              We do not sell, rent, or share your personal information with third parties for their
              marketing purposes. We may share data with:
            </p>
            <ul>
              <li>Paystack (payment processing, required for transaction completion)</li>
              <li>Delivery partners (name, phone, address, required for delivery)</li>
              <li>Legal authorities (only if required by law)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. Your Rights</h2>
            <p>
              You have the right to request access to your data, request correction or deletion,
              and withdraw consent at any time. Contact us on WhatsApp or email to exercise
              these rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">7. Contact</h2>
            <p>
              For privacy-related inquiries, contact us at privacy@intima.com or via
              WhatsApp at +233 XXX XXX XXX.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
