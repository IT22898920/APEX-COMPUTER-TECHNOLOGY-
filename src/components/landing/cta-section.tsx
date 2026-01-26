import Link from 'next/link'
import { Phone, Mail, Wrench, ArrowRight, Headphones } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { COMPANY_INFO } from '@/lib/utils/constants'

export function CTASection() {
  return (
    <section className="py-12 sm:py-20 md:py-28 bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-0">
        <div className="absolute left-0 top-0 h-[400px] w-[400px] rounded-full bg-white/5 blur-[100px]" />
        <div className="absolute right-0 bottom-0 h-[350px] w-[350px] rounded-full bg-white/5 blur-[80px]" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[600px] rounded-full bg-white/5 blur-[120px]" />
      </div>

      <div className="container relative z-10">
        <div className="mx-auto max-w-3xl text-center px-4 sm:px-0">
          {/* Icon */}
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
            <Headphones className="h-8 w-8" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl mb-4">
            Need IT Support? We&apos;re Here to Help.
          </h2>
          <p className="text-base sm:text-lg text-primary-foreground/80 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
            Don&apos;t let IT issues slow down your business. Contact us now for fast, reliable support.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Button size="lg" variant="secondary" className="shadow-xl hover:shadow-2xl transition-all duration-300 px-6" asChild>
              <a href={`tel:${COMPANY_INFO.phone}`}>
                <Phone className="mr-2 h-5 w-5" />
                Call Now: {COMPANY_INFO.phone}
              </a>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 backdrop-blur-sm px-6" asChild>
              <a href={`mailto:${COMPANY_INFO.email}`}>
                <Mail className="mr-2 h-5 w-5" />
                Email Us
              </a>
            </Button>
          </div>

          <div className="pt-4">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-300 px-8"
              asChild
            >
              <Link href="/login">
                <Wrench className="mr-2 h-5 w-5" />
                Report an Issue - Get Help Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
