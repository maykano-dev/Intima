'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const faqData = [
  {
    id: '1',
    question: 'How discreet is the packaging?',
    answer: '100% discreet. Your order arrives in a plain brown or white box with no brand markings, logos, or product names visible. The sender name on the waybill shows "VH Logistics" and nothing reveals the contents.',
    category: 'delivery',
  },
  {
    id: '2',
    question: 'What payment methods do you accept?',
    answer: 'We accept MTN Mobile Money, Vodafone Cash, AirtelTigo Money, and all major Visa/Mastercard debit and credit cards. Mobile money is the fastest option for Ghanaian customers.',
    category: 'payment',
  },
  {
    id: '3',
    question: 'How long does delivery take?',
    answer: 'Within Greater Accra, we offer same-day delivery (2-4 hour window) for orders placed before 4pm. Orders after 4pm are delivered the next morning. National delivery takes 2-5 days depending on location.',
    category: 'delivery',
  },
  {
    id: '4',
    question: 'Is there a minimum age requirement?',
    answer: 'Yes. You must be 18 years or older to purchase from Intima. We display an age verification popup on site entry and may verify age for certain orders.',
    category: 'legal',
  },
  {
    id: '5',
    question: 'What is your return policy?',
    answer: 'Due to hygiene reasons, we cannot accept returns on opened products. If your item arrives damaged or defective, contact us within 48 hours and we will replace it free of charge.',
    category: 'orders',
  },
  {
    id: '6',
    question: 'Will my billing statement show Intima?',
    answer: 'No. Your mobile money or bank statement will show a neutral billing descriptor. We work with our payment processor to ensure complete privacy in your transaction records.',
    category: 'privacy',
  },
  {
    id: '7',
    question: 'Do you offer free delivery?',
    answer: 'Yes! Orders over GHS 200 within Greater Accra qualify for free delivery. National delivery fees vary by location and order value.',
    category: 'delivery',
  },
  {
    id: '8',
    question: 'Are your products safe?',
    answer: 'Absolutely. All products are made from body-safe materials: medical-grade silicone, ABS plastic, borosilicate glass, or stainless steel. We never sell products containing phthalates or harmful chemicals.',
    category: 'products',
  },
  {
    id: '9',
    question: 'Can I cancel or change my order?',
    answer: 'You can cancel or modify your order within 1 hour of placement, provided it has not been dispatched. Contact our support team via email immediately with your order number.',
    category: 'orders',
  },
  {
    id: '10',
    question: 'How do I contact customer support?',
    answer: 'The best way to reach us is via email at support@intima-gh.com. We typically respond within 2-4 hours during business hours. You can also use the contact form on our website.',
    category: 'support',
  },
]

const categories = [
  { id: 'all', label: 'All' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'payment', label: 'Payment' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'products', label: 'Products' },
  { id: 'orders', label: 'Orders' },
  { id: 'support', label: 'Support' },
  { id: 'legal', label: 'Legal' },
]

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [openId, setOpenId] = useState<string | null>(null)

  const filtered = useMemo(
    () =>
      activeCategory === 'all'
        ? faqData
        : faqData.filter((faq) => faq.category === activeCategory),
    [activeCategory]
  )

  function toggle(id: string) {
    setOpenId(openId === id ? null : id)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Frequently Asked Questions</h1>
        <p className="text-muted mb-8">Everything you need to know about shopping with Intima.</p>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                activeCategory === cat.id
                  ? 'bg-primary text-white'
                  : 'bg-secondary hover:bg-secondary/80 text-muted'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((faq) => (
            <div
              key={faq.id}
              className="rounded-2xl border border-border overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => toggle(faq.id)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-secondary/50 transition-colors"
              >
                <span className="font-medium text-sm pr-4">{faq.question}</span>
                <svg
                  className={cn(
                    'w-5 h-5 text-muted flex-shrink-0 transition-transform duration-200',
                    openId === faq.id && 'rotate-180'
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openId === faq.id && (
                <div className="px-5 pb-5 animate-fade-in">
                  <p className="text-sm text-muted leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted py-8">No FAQs found for this category.</p>
        )}

        <div className="mt-12 p-6 rounded-2xl bg-secondary text-center">
          <h2 className="font-semibold mb-2">Still have questions?</h2>
          <p className="text-sm text-muted mb-4">We&apos;re here to help. Reach out to our dedicated support team.</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  )
}
