'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './landing.css';

export default function LandingPage() {
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(true); // Default to true to avoid flicker if already confirmed

  useEffect(() => {
    // Check Age Confirmation
    const confirmed = localStorage.getItem('ageConfirmed') === 'true';
    setIsAgeConfirmed(confirmed);
    if (!confirmed) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const confirmAge = () => {
    setIsAgeConfirmed(true);
    document.body.style.overflow = 'auto';
    localStorage.setItem('ageConfirmed', 'true');
  };

  return (
    <div className="landing-body">
      {/* Age Gate */}
      {!isAgeConfirmed && (
        <div id="age-gate">
          <div className="age-gate-content">
            <div className="age-gate-logo">INTIMA</div>
            <div className="age-gate-text">Private Wellness. For Adults.</div>
            <div className="age-gate-btns">
              <button className="btn-age btn-age-yes" onClick={confirmAge}>I am 18+ Enter</button>
              <button className="btn-age btn-age-no" onClick={() => window.location.href = 'https://google.com'}>I am under 18</button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section id="hero">
        <div className="hero-content">
          <span className="hero-eyebrow reveal">Ghana's Most Discreet Wellness Boutique</span>
          <h1 className="hero-title reveal">Your wellness, <br /><span>absolute</span> privacy.</h1>
          <p className="hero-desc reveal">Premium intimate wellness products delivered in unmarked packaging. No questions. No labels. Just you.</p>
          <div className="hero-btns reveal">
            <Link href="/shop" className="btn-hero btn-hero-primary">Explore Collection</Link>
            <Link href="#why" className="btn-hero btn-hero-secondary">Our Promise</Link>
          </div>
        </div>
        <div className="hero-image-container">
          <Image 
            src="/assets/hero.png" 
            alt="Wellness" 
            fill
            priority
            className="hero-image"
            sizes="50vw"
          />
          <div className="hero-image-overlay"></div>
        </div>
      </section>

      {/* Marquee */}
      <div className="marquee">
        <div className="marquee-content">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="marquee-item">
              <span>●</span> {['Discreet Packaging', 'Discreet Checkout', 'Same-Day Delivery', 'Secure Payments'][i % 4]}
            </div>
          ))}
        </div>
        <div className="marquee-content">
          {[...Array(8)].map((_, i) => (
            <div key={i + 8} className="marquee-item">
              <span>●</span> {['Discreet Packaging', 'Discreet Checkout', 'Same-Day Delivery', 'Secure Payments'][i % 4]}
            </div>
          ))}
        </div>
      </div>

      {/* Promise Section */}
      <section className="promise">
        <div className="promise-item reveal">
          <div className="promise-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h3 className="promise-title">Private</h3>
          <p className="promise-desc">Your data is encrypted. We never share or sell your information.</p>
        </div>
        <div className="promise-item reveal">
          <div className="promise-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
            </svg>
          </div>
          <h3 className="promise-title">Unmarked</h3>
          <p className="promise-desc">Plain brown boxes. No branding. No invoices on the outside.</p>
        </div>
        <div className="promise-item reveal">
          <div className="promise-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h3 className="promise-title">Global to Local</h3>
          <p className="promise-desc">Curated imports from top global brands, plus select items stocked locally in Ghana.</p>
        </div>
        <div className="promise-item reveal">
          <div className="promise-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h3 className="promise-title">Curated</h3>
          <p className="promise-desc">Only body-safe, premium grade wellness essentials.</p>
        </div>
      </section>

      {/* Collections */}
      <section id="collections" className="collections">
        <div className="section-header reveal">
          <span className="section-eyebrow">The Collection</span>
          <h2 className="section-title">Elevate your <span>wellness</span> rituals</h2>
        </div>
        <div className="collection-grid">
          <Link href="/shop" className="collection-card reveal">
            <Image 
              src="/assets/cat1.png" 
              alt="Wellness" 
              fill
              className="collection-img"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="collection-overlay"></div>
            <div className="collection-info">
              <span className="collection-num">01.</span>
              <h3 className="collection-name">Personal Care</h3>
              <span className="btn-collection">Discover More</span>
            </div>
          </Link>
          <Link href="/shop" className="collection-card reveal">
            <Image 
              src="/assets/cat2.png" 
              alt="Couples" 
              fill
              className="collection-img"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="collection-overlay"></div>
            <div className="collection-info">
              <span className="collection-num">02.</span>
              <h3 className="collection-name">Connection</h3>
              <span className="btn-collection">Discover More</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Why Section */}
      <section id="why" className="why">
        <div className="why-image-container reveal">
          <Image 
            src="/assets/cat1.png" 
            alt="Privacy" 
            fill
            className="why-image"
            sizes="(max-width: 1024px) 100vw, 40vw"
          />
        </div>
        <div className="why-content">
          <span className="section-eyebrow reveal">The Intima Standard</span>
          <h2 className="why-title reveal">Designed for <span>your</span> comfort.</h2>
          <div className="why-list">
            <div className="why-item reveal">
              <h3 className="why-item-title">Total Privacy</h3>
              <p className="why-item-desc">We never share your data. Your privacy is built into every step.</p>
            </div>
            <div className="why-item reveal">
              <h3 className="why-item-title">Neutral Billing</h3>
              <p className="why-item-desc">"Intima" will never appear on your bank or MoMo statement.</p>
            </div>
            <div className="why-item reveal">
              <h3 className="why-item-title">Body-Safe Materials</h3>
              <p className="why-item-desc">Medical grade silicone and pH-balanced formulas only.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Delivery Steps */}
      <section id="delivery" className="delivery">
        <div className="section-header reveal">
          <span className="section-eyebrow">The Process</span>
          <h2 className="section-title">How <span>privacy</span> works</h2>
        </div>
        <div className="delivery-steps">
          <div className="step-card reveal">
            <span className="step-num">01</span>
            <h3 className="step-title">Select</h3>
            <p className="promise-desc">Sign in to browse, order, and track your deliveries all in one place.</p>
          </div>
          <div className="step-card reveal">
            <span className="step-num">02</span>
            <h3 className="step-title">Secure</h3>
            <p className="promise-desc">Pay with your preferred method. Your data is encrypted and immediately purged.</p>
          </div>
          <div className="step-card reveal">
            <span className="step-num">03</span>
            <h3 className="step-title">Receive</h3>
            <p className="promise-desc">A plain, unmarked package arrives at your door. No logos. No branding.</p>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter reveal">
        <div className="newsletter-content">
          <h2 className="nl-title">Stay <span>discreetly</span> informed</h2>
          <p className="nl-desc">Join our private circle for wellness tips and early access to new collections. No spam, ever.</p>
          <form className="nl-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Your email address" className="nl-input" />
            <button type="submit" className="nl-btn">Join Us</button>
          </form>
        </div>
      </section>
    </div>
  );
}
