import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  Phone,
  MessageCircle,
  Clock,
  Shield,
  Headphones,
  Star,
  Wrench,
} from 'lucide-react'
import { COMPANY_INFO } from '@/lib/utils/constants'
import { ServicesHeader } from './services-header'
import { ServicesGrid } from './services-grid'

export const dynamic = 'force-dynamic'

interface SearchParams {
  search?: string
}

async function getServicesCount() {
  const supabase = await createClient()

  const { count, error } = await (supabase as any)
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  if (error) {
    console.error('Error fetching services count:', error)
    return 0
  }

  return count || 0
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const totalServices = await getServicesCount()

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      {/* Header Section */}
      <ServicesHeader totalServices={totalServices} />

      <div className="container py-6 sm:py-8 lg:py-12 px-4">
        {/* Services Grid */}
        <Suspense fallback={<ServicesGridSkeleton />}>
          <ServicesGrid search={params.search} />
        </Suspense>
      </div>

      {/* Why Choose Us Section */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
              Why Choose APEX?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We deliver reliable IT solutions with a commitment to excellence
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                icon: Clock,
                title: 'Fast Response',
                description: '2-3 hour response time for urgent requests',
              },
              {
                icon: Shield,
                title: 'Quality Guaranteed',
                description: 'All work comes with service warranty',
              },
              {
                icon: Headphones,
                title: '24/7 Support',
                description: 'Emergency support available anytime',
              },
              {
                icon: Star,
                title: 'Expert Team',
                description: 'Certified IT professionals',
              },
            ].map((item, idx) => (
              <Card key={idx} className="text-center border-primary/10 hover:border-primary/30 hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16">
        <div className="container px-4">
          <Card className="bg-primary text-primary-foreground border-0">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">
                    Ready to Get Started?
                  </h2>
                  <p className="text-primary-foreground/80 max-w-lg">
                    Contact us today for a free consultation and let us help you with your IT needs.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button size="lg" variant="secondary" asChild>
                    <Link href="/contact">
                      Contact Us
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                    <a href={`https://wa.me/${COMPANY_INFO.whatsapp}`} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      WhatsApp
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

function ServicesGridSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-6 bg-muted rounded w-48 animate-pulse" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-xl border bg-card animate-pulse">
            <div className="p-6 space-y-4">
              <div className="flex justify-between">
                <div className="h-12 w-12 bg-muted rounded-lg" />
                <div className="h-6 w-16 bg-muted rounded" />
              </div>
              <div className="h-6 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="space-y-2 pt-4">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-full" />
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="h-8 w-24 bg-muted rounded" />
                <div className="h-8 w-24 bg-muted rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
