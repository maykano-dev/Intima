const testimonials = [
  { quote: "I was nervous to order but the packaging was so discreet, even I didn't know what was inside until I opened it. Will definitely order again.", initial: 'A', name: 'Ama K.', location: 'Accra, Ghana' },
  { quote: "Ordered at 10am and it arrived by 2pm. No weird packaging, no calls asking what's inside. Just fast, private service. Exactly what I needed.", initial: 'K', name: 'Kwame D.', location: 'East Legon, Accra' },
  { quote: 'Finally a Ghanaian store that takes privacy seriously. The product quality is great and the WhatsApp support team answered my questions immediately.', initial: 'E', name: 'Efua M.', location: 'Kumasi, Ghana' },
]

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-28 px-6 sm:px-12 lg:px-24">
      <div className="section-header mb-16 reveal">
        <p className="section-eyebrow">Customer Stories</p>
        <h2 className="section-title">What our customers<br /><em>are saying</em></h2>
      </div>
      <div className="test-grid reveal">
        {testimonials.map((t) => (
          <div key={t.name} className="test-card">
            <div className="test-quote">&ldquo;{t.quote}&rdquo;</div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-serif text-[1.1rem] text-background shrink-0">
                {t.initial}
              </div>
              <div>
                <div className="text-[0.8rem] font-medium text-accent">{t.name}</div>
                <div className="text-[0.72rem] text-muted tracking-[0.05em]">{t.location}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
