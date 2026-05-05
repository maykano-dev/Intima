import Link from 'next/link'

const features = [
  { title: 'Body-Safe Quality Only', desc: 'Every product is tested for body-safe materials. We only stock what we would use ourselves.' },
  { title: 'Honest, No-Hype Descriptions', desc: 'No miracle claims. No fake promises. Just clear, accurate product information.' },
  { title: 'Discreet From Click to Door', desc: 'Plain outer box. Neutral sender name. Discreet billing. Your neighbours will never know.' },
  { title: 'Real Customer Support', desc: 'WhatsApp us any time. We reply within 30 minutes, Monday to Saturday.' },
  { title: 'Easy Returns', desc: 'Not what you expected? We offer hassle-free returns on unopened products within 7 days.' },
]

export default function WhySection() {
  return (
    <section className="why-section">
      <div className="why-left">
        <p className="section-eyebrow text-primary-light">Why Intima</p>
        <h2 className="font-serif text-[clamp(2.5rem,4vw,4rem)] font-light text-cream leading-[1.15] mb-6">
          Built for<br /><em className="italic text-primary-light">your comfort,</em><br />not ours.
        </h2>
        <p className="text-[0.92rem] leading-[1.9] mb-10 opacity-80" style={{ color: 'rgba(168,184,160,0.8)' }}>
          We built Intima because we know how uncomfortable it can be to walk into a store and ask for
          what you actually need. You deserve access to quality wellness products without the stares,
          the questions, or the embarrassment. That&apos;s why everything we do — from checkout to delivery —
          is designed around your privacy first.
        </p>
        <Link href="/shop" className="inline-block px-10 py-4 bg-primary text-background text-[0.8rem] tracking-[0.12em] uppercase no-underline transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5">
          Shop the Collection
        </Link>
      </div>
      <div className="flex flex-col gap-[1.5px] reveal">
        {features.map((f) => (
          <div key={f.title} className="why-item">
            <div className="why-item-title">{f.title}</div>
            <div className="why-item-desc">{f.desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
