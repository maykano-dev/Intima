'use client'

export default function NewsletterSection() {
  return (
    <section id="newsletter" className="py-24 px-6 sm:px-12 lg:px-24 bg-forest-lt flex flex-col items-center text-center">
      <h2 className="font-serif text-[clamp(2rem,3vw,3rem)] font-light text-cream mb-3 reveal">
        Wellness tips, delivered privately.
      </h2>
      <p className="text-[0.88rem] text-primary-light mb-10 leading-[1.7] reveal">
        Join our discreet newsletter for exclusive offers, sexual health education,<br />
        and new arrivals. Unsubscribe any time.
      </p>
      <form className="flex max-w-[480px] w-full reveal" onSubmit={(e) => e.preventDefault()}>
        <input
          type="email"
          placeholder="Your email address"
          className="flex-1 px-6 py-4 bg-white/5 border border-primary-light/30 border-r-0 text-cream text-[0.88rem] outline-none font-sans placeholder:text-primary-light/50"
        />
        <button className="px-8 py-4 bg-primary text-background border-none font-sans text-[0.78rem] tracking-[0.1em] uppercase cursor-pointer transition-colors duration-300 hover:bg-primary-light">
          Subscribe
        </button>
      </form>
      <p className="text-[0.7rem] text-primary-light/50 mt-4 tracking-[0.05em] reveal">We never share your email. Ever.</p>
    </section>
  )
}
