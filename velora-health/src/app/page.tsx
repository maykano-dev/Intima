import HeroSection from "@/components/home/HeroSection"
import MarqueeBar from "@/components/home/MarqueeBar"
import PromiseStrip from "@/components/home/PromiseStrip"
import CategoriesSection from "@/components/home/CategoriesSection"
import WhySection from "@/components/home/WhySection"
import DeliverySteps from "@/components/home/DeliverySteps"
import TestimonialsSection from "@/components/home/TestimonialsSection"
import NewsletterSection from "@/components/home/NewsletterSection"

export default function Home() {
  return (
    <>
      <HeroSection />
      <MarqueeBar />
      <PromiseStrip />
      <CategoriesSection />
      <WhySection />
      <DeliverySteps />
      <TestimonialsSection />
      <NewsletterSection />
    </>
  )
}
