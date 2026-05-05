import Link from 'next/link'

const footerLinks = {
  shop: {
    title: 'Shop',
    links: [
      { href: '/shop', label: 'All Products' },
      { href: '/shop?category=vibrators', label: 'Vibrators' },
      { href: '/shop?category=male-pleasure', label: 'Male Pleasure' },
      { href: '/shop?category=couples', label: 'Couples' },
      { href: '/shop?category=lubricants', label: 'Lubricants' },
    ],
  },
  support: {
    title: 'Support',
    links: [
      { href: '/faq', label: 'FAQ' },
      { href: '/track', label: 'Track Order' },
      { href: '/contact', label: 'Contact Us' },
      { href: '/privacy-policy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
    ],
  },
  company: {
    title: 'Company',
    links: [
      { href: '/about', label: 'About Us' },
      { href: '/blog', label: 'Blog' },
    ],
  },
}

export default function Footer() {
  return (
    <footer className="bg-accent text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="lg:col-span-2">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white text-sm font-bold">I</span>
            </div>
            <span className="text-lg font-bold">
              Intima
            </span>
          </Link>
          <p className="text-white/70 text-sm leading-relaxed max-w-sm">
            Ghana&apos;s most discreet sexual wellness platform. Quality-verified products,
            anonymous checkout, and fast doorstep delivery. Your privacy is our promise.
          </p>
            <div className="flex items-center gap-3 mt-6">
              <div className="flex items-center gap-1.5 text-sm text-white/70">
                <svg className="w-4 h-4 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>100% Discreet</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-white/70">
                <svg className="w-4 h-4 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>support@intima.com</span>
              </div>
            </div>
          </div>

          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-semibold text-sm uppercase tracking-wider text-primary-light mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/50">
            &copy; {new Date().getFullYear()} Intima. All rights reserved.
          </p>
          <p className="text-xs text-white/40 text-center sm:text-right">
            All products are for adult use only. Must be 18+ to purchase.
            <br />
            Made with care in Ghana.
          </p>
        </div>
      </div>
    </footer>
  )
}
