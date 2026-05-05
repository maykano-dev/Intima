export default function DeliverySteps() {
  const steps = [
    { num: '1', title: 'Browse & Choose', desc: 'Shop our curated catalogue. No account required. Guest checkout always available.' },
    { num: '2', title: 'Pay Securely', desc: 'Pay with MTN MoMo, Vodafone Cash, AirtelTigo, card, or cash on delivery in Accra.' },
    { num: '3', title: 'Discreet Delivery', desc: 'Plain, unmarked box delivered to your door. Same-day in Accra. 2–4 days nationwide.' },
  ]

  return (
    <section id="delivery" className="py-28 px-6 sm:px-12 lg:px-24 bg-cream text-center">
      <div className="section-header mb-16 reveal">
        <p className="section-eyebrow">How It Works</p>
        <h2 className="section-title">From browse to door<br /><em>in three steps</em></h2>
      </div>
      <div className="delivery-grid reveal">
        {steps.map((s, i) => (
          <div key={s.num} className={`delivery-step${i < steps.length - 1 ? ' connector' : ''}`}>
            <div className="step-num">{s.num}</div>
            <div className="step-title">{s.title}</div>
            <div className="step-desc">{s.desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
