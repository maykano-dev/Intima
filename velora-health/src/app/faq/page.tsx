'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'

const faqData = [
  {
    id: '1',
    question: 'How discreet is the packaging?',
    answer: '100% discreet. Your order arrives in a plain brown or white box with no brand markings, logos, or product names visible. The sender name on the waybill shows "VH Logistics" — nothing that reveals the contents.',
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
    answer: 'You can cancel or modify your order within 1 hour of placement, provided it has not been dispatched. Contact us on WhatsApp immediately with your order number.',
    category: 'orders',
  },
  {
    id: '10',
    question: 'How do I contact customer support?',
    answer: 'Message us on WhatsApp and we respond within 30 minutes. You can also use the contact form on our website for non-urgent inquiries.',
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
          <p className="text-sm text-muted mb-4">We&apos;re here to help. Reach out on WhatsApp.</p>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '233XXXXXXXXX'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
