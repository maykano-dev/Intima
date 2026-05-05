'use client'

import { useState } from 'react'

export default function NewsletterSection() {
  const [subscribed, setSubscribed] = useState(false)

  async function handleSubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const input = form.querySelector('input') as HTMLInputElement
    if (!input?.value) return
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: input.value }),
      })
      if (res.ok) {
        setSubscribed(true)
        input.value = ''
      }
    } catch {
      // silently fail
    }
  }

  return (
    <section id="newsletter" className="py-24 px-6 sm:px-12 lg:px-24 bg-forest-lt flex flex-col items-center text-center">
      <h2 className="font-serif text-[clamp(2rem,3vw,3rem)] font-light text-cream mb-3 reveal">
        Wellness tips, delivered privately.
      </h2>
      <p className="text-[0.88rem] text-primary-light mb-10 leading-[1.7] reveal">
        Join our discreet newsletter for exclusive offers, sexual health education,<br />
        and new arrivals. Unsubscribe any time.
      </p>
      {subscribed ? (
        <p className="text-primary-light font-medium">Thanks for subscribing!</p>
      ) : (
        <form className="flex max-w-[480px] w-full reveal" onSubmit={handleSubscribe}>
          <input
            type="email"
            placeholder="Your email address"
            required
            className="flex-1 px-6 py-4 bg-white/5 border border-primary-light/30 border-r-0 text-cream text-[0.88rem] outline-none font-sans placeholder:text-primary-light/50"
          />
          <button className="px-8 py-4 bg-primary text-background border-none font-sans text-[0.78rem] tracking-[0.1em] uppercase cursor-pointer transition-colors duration-300 hover:bg-primary-light">
            Subscribe
          </button>
        </form>
      )}
      <p className="text-[0.7rem] text-primary-light/50 mt-4 tracking-[0.05em] reveal">We never share your email. Ever.</p>
    </section>
  )
}
