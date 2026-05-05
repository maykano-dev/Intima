const promises = [
  {
    icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.89 1.45l8 4A2 2 0 0122 7.24v9.53a2 2 0 01-1.11 1.79l-8 4a2 2 0 01-1.79 0l-8-4a2 2 0 01-1.1-1.8V7.24a2 2 0 011.11-1.79l8-4a2 2 0 011.78 0z"/><polyline points="2.32 6.16 12 11 21.68 6.16"/><line x1="12" y1="22.76" x2="12" y2="11"/></svg>,
    title: 'Plain Packaging',
    desc: 'No brand names, no logos. Just a plain, unmarked box at your door.',
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    title: 'Anonymous Checkout',
    desc: 'No account required. Your personal data stays yours.',
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    title: 'Same-Day Delivery',
    desc: 'Order by 3pm in Accra and receive your package today.',
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    title: 'Mobile Money',
    desc: 'Pay with MTN MoMo, Vodafone Cash, AirtelTigo, Visa or Mastercard.',
  },
]

export default function PromiseStrip() {
  return (
    <div className="promise-strip reveal">
      {promises.map((p) => (
        <div key={p.title} className="promise-item">
          <div className="promise-icon">{p.icon}</div>
          <div className="promise-title">{p.title}</div>
          <div className="promise-desc">{p.desc}</div>
        </div>
      ))}
    </div>
  )
}
