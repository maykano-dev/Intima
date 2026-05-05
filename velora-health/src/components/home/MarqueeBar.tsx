export default function MarqueeBar() {
  const items = [
    'Discreet Delivery', 'Plain Packaging', 'Anonymous Checkout',
    'MTN MoMo Accepted', 'Same-Day Accra', 'Nationwide Delivery',
    'Quality Guaranteed', 'Your Privacy First',
  ]

  return (
    <div className="marquee-bar">
      <div className="marquee-track">
        {items.concat(items).map((item, i) => (
          <span key={i} className="marquee-item">
            {item}
            <svg width="8" height="8" viewBox="0 0 24 24" fill="var(--color-primary)"><circle cx="12" cy="12" r="6"/></svg>
          </span>
        ))}
      </div>
    </div>
  )
}
