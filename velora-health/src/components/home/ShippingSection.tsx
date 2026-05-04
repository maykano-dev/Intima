export default function ShippingSection() {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-background to-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest text-primary font-semibold">Shipping</span>
          <h2 className="text-2xl sm:text-3xl font-bold mt-2">Delivery Options</h2>
          <p className="text-muted mt-3">
            We offer two shipping methods from our international partners. Choose what works best for you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          <div className="relative rounded-2xl border-2 border-primary bg-card p-6 lg:p-8 shadow-sm">
            <div className="absolute -top-3 right-6 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
              Recommended
            </div>
            <div className="text-3xl mb-3">&#9973;</div>
            <h3 className="text-xl font-bold mb-1">Standard Sea Shipping</h3>
            <p className="text-sm text-muted mb-4">6&ndash;8 weeks &middot; GHS 25</p>
            <ul className="space-y-2.5 text-sm">
              {[
                'Lower cost option &mdash; best value for money',
                'Bulk shipments available for larger orders',
                'Secure international transport',
                'Fully trackable in most cases',
                'Discreet packaging guaranteed',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span dangerouslySetInnerHTML={{ __html: item }} />
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted mt-4 pt-4 border-t border-border">
              Perfect for budget-conscious shoppers who can plan ahead.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 lg:p-8 opacity-80 hover:opacity-100 transition-opacity">
            <div className="text-3xl mb-3">&#9992;&#65039;</div>
            <h3 className="text-xl font-bold mb-1">Express Air Delivery</h3>
            <p className="text-sm text-muted mb-4">12&ndash;16 days &middot; GHS 65</p>
            <ul className="space-y-2.5 text-sm">
              {[
                'Fast international shipping with priority handling',
                'Best for urgent or smaller orders',
                'Fully trackable in most cases',
                'Faster customs clearance',
                'Discreet packaging guaranteed',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-muted flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted mt-4 pt-4 border-t border-border">
              Ideal if you want your products quickly.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
