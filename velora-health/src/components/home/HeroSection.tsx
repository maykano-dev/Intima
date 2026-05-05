'use client'

import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-left">
        <p className="text-[0.72rem] tracking-[0.2em] uppercase text-primary mb-6 opacity-0 animate-[fadeUp_0.8s_0.3s_forwards]">
          Ghana&apos;s Discreet Wellness Store
        </p>
        <h1 className="font-serif text-[clamp(3rem,5vw,5.5rem)] font-light leading-[1.1] text-accent mb-6 opacity-0 animate-[fadeUp_0.8s_0.5s_forwards]">
          Your wellness,<br />
          your <em className="italic text-primary">privacy,</em><br />
          delivered.
        </h1>
        <p className="text-base leading-[1.8] text-muted max-w-[380px] mb-12 opacity-0 animate-[fadeUp_0.8s_0.7s_forwards]">
          Premium intimate wellness products, delivered discreetly to your door across Ghana.
          Plain packaging. Anonymous checkout. No questions asked.
        </p>
        <div className="flex gap-4 items-center opacity-0 animate-[fadeUp_0.8s_0.9s_forwards]">
          <Link href="/shop" className="px-10 py-4 bg-accent text-cream text-[0.8rem] tracking-[0.12em] uppercase no-underline transition-all duration-300 hover:bg-primary hover:-translate-y-0.5">
            Shop Now
          </Link>
          <Link href="/about" className="px-10 py-4 border border-forest-lt text-accent text-[0.8rem] tracking-[0.12em] uppercase no-underline transition-all duration-300 hover:bg-warm">
            Our Promise
          </Link>
        </div>
        <div className="flex gap-10 mt-16 opacity-0 animate-[fadeUp_0.8s_1.1s_forwards]">
          {[
            { label: 'Delivery', val: 'Same Day' },
            { label: 'Packaging', val: '100% Discreet' },
            { label: 'Payment', val: 'MoMo & Card' },
          ].map((item) => (
            <div key={item.label}>
              <div className="text-[0.65rem] tracking-[0.15em] uppercase text-muted mb-1">{item.label}</div>
              <div className="font-serif text-[1.4rem] font-semibold text-accent">{item.val}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="hero-right opacity-0 animate-[fadeIn_1.2s_0.2s_forwards]">
        <div className="hero-right-inner">
          <div className="hero-visual" />
          <div className="floating-tag tag1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Discreet Packaging
          </div>
          <div className="floating-tag tag2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Same-Day Accra
          </div>
          <div className="floating-tag tag3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            100% Private
          </div>
        </div>
      </div>
    </section>
  )
}
