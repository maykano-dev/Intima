import Link from 'next/link'

const categories = [
  { num: '01', slug: 'vibrators', name: 'Personal Wellness Devices', desc: 'Premium body-safe wellness massagers and personal care devices for relaxation and self-care.' },
  { num: '02', slug: 'couples', name: 'Couples Wellness', desc: 'Tools designed to enhance connection, intimacy, and communication between partners.' },
  { num: '03', slug: 'male-pleasure', name: "Men's Vitality", desc: "Performance support products and herbal vitality supplements for men's health and confidence." },
  { num: '04', slug: 'lubricants', name: 'Lubricants & Enhancers', desc: 'Water-based, warming, and specialty formulas for comfort, sensitivity, and enhanced experience.' },
  { num: '05', slug: 'wellness', name: 'Herbal Wellness', desc: 'Locally inspired vitality tonics and libido support supplements. Energy and drive, naturally.' },
  { num: '06', slug: 'wellness', name: 'Accessories & Care', desc: 'Toy cleaners, storage solutions, intimate hygiene products, and protection essentials.' },
  { num: '07', slug: 'herbal', name: 'Herbal Products', desc: 'Natural herbal supplements for vitality, libido support, and overall wellness.' },
  { num: '08', slug: 'adult-games', name: 'Adult Games', desc: 'Fun and provocative games designed to spice things up for couples and parties.' },
]

export default function CategoriesSection() {
  return (
    <section id="categories" className="py-28 px-6 sm:px-12 lg:px-24">
      <div className="section-header mb-16 reveal">
        <p className="section-eyebrow">Our Collections</p>
        <h2 className="section-title">Everything you need,<br /><em>nothing you don&apos;t</em></h2>
      </div>
      <div className="cat-grid reveal">
        {categories.map((cat) => (
          <Link key={cat.num} href={`/shop?category=${cat.slug}`} className="cat-card no-underline">
            <div className="cat-num">{cat.num}</div>
            <div className="cat-name">{cat.name}</div>
            <div className="cat-desc">{cat.desc}</div>
            <div className="cat-arrow">Explore →</div>
          </Link>
        ))}
      </div>
    </section>
  )
}
