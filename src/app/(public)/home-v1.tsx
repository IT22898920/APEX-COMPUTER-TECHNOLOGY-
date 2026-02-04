import { Hero } from '@/components/landing/hero'
import { FeaturedProducts } from '@/components/landing/featured-products'
import { CategoriesShowcase } from '@/components/landing/categories-showcase'
import { WhyChooseUs } from '@/components/landing/why-choose-us'
import { ServicesSection } from '@/components/landing/services-section'
import { Testimonials } from '@/components/landing/testimonials'
import { CTASection } from '@/components/landing/cta-section'

export default function HomePage() {
  return (
    <>
      {/* Hero - First impression with animated visuals */}
      <Hero />

      {/* Featured Products - Show products immediately to drive sales */}
      <FeaturedProducts />

      {/* Categories - Easy navigation to find products */}
      <CategoriesShowcase />

      {/* Why Choose Us - Build trust and credibility */}
      <WhyChooseUs />

      {/* Services - Show service offerings */}
      <ServicesSection />

      {/* Testimonials - Social proof */}
      <Testimonials />

      {/* CTA - Final call to action */}
      <CTASection />
    </>
  )
}
