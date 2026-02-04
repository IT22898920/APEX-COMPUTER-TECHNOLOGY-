import { HomeV2 } from '@/components/landing/home-v2'
import { ProductsSectionV2 } from '@/components/landing/products-section-v2'
import { ServicesSectionV2 } from '@/components/landing/services-section-v2'
import { Testimonials } from '@/components/landing/testimonials'
import { CTASectionV2 } from '@/components/landing/cta-section-v2'

export default function HomePage() {
  return (
    <>
      {/* Hero + Features from HomeV2 */}
      <HomeV2 />

      {/* Real Products from Database */}
      <ProductsSectionV2 />

      {/* Real Services from Database */}
      <ServicesSectionV2 />

      {/* Testimonials */}
      <Testimonials />

      {/* Final CTA */}
      <CTASectionV2 />
    </>
  )
}
