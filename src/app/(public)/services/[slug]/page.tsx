import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Wrench,
  Monitor,
  Printer,
  HardDrive,
  Cable,
  Package,
  Network,
  Laptop,
  FileText,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Phone,
  MessageCircle,
  Star,
  Clock,
  Shield,
  Headphones,
  Cpu,
  ShoppingCart,
  Zap,
} from 'lucide-react'
import { COMPANY_INFO } from '@/lib/utils/constants'

export const dynamic = 'force-dynamic'

interface Service {
  id: string
  title: string
  slug: string
  description: string
  icon: string
  image_url: string | null
  images: string[]
  features: string[]
  price_from: number | null
  price_to: number | null
  is_featured: boolean
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Wrench,
  Monitor,
  Printer,
  HardDrive,
  Cable,
  Package,
  Network,
  Laptop,
  FileText,
  Cpu,
  ShoppingCart,
  Zap,
}

async function getService(slug: string) {
  const supabase = await createClient()

  const { data, error } = await (supabase as any)
    .from('services')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) {
    return null
  }

  return data as Service
}

async function getRelatedServices(currentSlug: string) {
  const supabase = await createClient()

  const { data } = await (supabase as any)
    .from('services')
    .select('id, title, slug, description, icon, is_featured')
    .eq('is_active', true)
    .neq('slug', currentSlug)
    .limit(3)

  return data || []
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [service, relatedServices] = await Promise.all([
    getService(slug),
    getRelatedServices(slug),
  ])

  if (!service) {
    notFound()
  }

  const Icon = iconMap[service.icon] || Wrench

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground overflow-hidden">
        {/* Background image if available */}
        {(service.images?.[0] || service.image_url) && (
          <div className="absolute inset-0">
            <Image
              src={service.images?.[0] || service.image_url!}
              alt={service.title}
              fill
              className="object-cover opacity-20"
              unoptimized
            />
          </div>
        )}
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="container relative py-16 md:py-24">
          <Button variant="ghost" size="sm" className="mb-6 text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10" asChild>
            <Link href="/services">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Services
            </Link>
          </Button>

          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Icon className="h-10 w-10" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                {service.is_featured && (
                  <Badge variant="secondary">
                    <Star className="h-3 w-3 mr-1 fill-primary text-primary" />
                    Featured Service
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                {service.title}
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl">
                {service.description}
              </p>
            </div>
          </div>
        </div>
        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 30L80 35C160 40 320 50 480 50C640 50 800 40 960 35C1120 30 1280 30 1360 30L1440 30V60H1360C1280 60 1120 60 960 60C800 60 640 60 480 60C320 60 160 60 80 60H0V30Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Gallery */}
              {service.images && service.images.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Service Gallery</CardTitle>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {service.images.map((img, idx) => (
                        <div key={idx} className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                          <Image
                            src={img}
                            alt={`${service.title} - Image ${idx + 1}`}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-300"
                            unoptimized
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Features */}
              {service.features && service.features.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      What&apos;s Included
                    </CardTitle>
                    <CardDescription>
                      Key features and benefits of this service
                    </CardDescription>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                          <div className="p-1 rounded-full bg-green-500/10">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          </div>
                          <span className="font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Why Choose Us */}
              <Card>
                <CardHeader>
                  <CardTitle>Why Choose APEX?</CardTitle>
                  <CardDescription>
                    What sets us apart from the competition
                  </CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Clock className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Fast Response</h4>
                        <p className="text-sm text-muted-foreground">
                          2-3 hour response time for urgent issues
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Quality Guaranteed</h4>
                        <p className="text-sm text-muted-foreground">
                          All work comes with service warranty
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Headphones className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">24/7 Support</h4>
                        <p className="text-sm text-muted-foreground">
                          Emergency support available round the clock
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Star className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Expert Team</h4>
                        <p className="text-sm text-muted-foreground">
                          Certified professionals with years of experience
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Card */}
              <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0">
                <CardHeader>
                  <CardTitle>Get Started Today</CardTitle>
                  <CardDescription className="text-primary-foreground/80">
                    Contact us for a free consultation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="secondary" className="w-full" size="lg" asChild>
                    <Link href="/contact">
                      Request a Quote
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent border-white text-white hover:bg-white/10" size="lg" asChild>
                    <a href={`tel:${COMPANY_INFO.phone}`}>
                      <Phone className="mr-2 h-5 w-5" />
                      {COMPANY_INFO.phone}
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full bg-[#25D366]/20 border-[#25D366] text-white hover:bg-[#25D366]/30" size="lg" asChild>
                    <a
                      href={`https://wa.me/${COMPANY_INFO.whatsapp}?text=${encodeURIComponent(`Hi, I'm interested in your "${service.title}" service. Can you please provide more information?`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      WhatsApp Us
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* Service Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Service Information</CardTitle>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Response Time</span>
                    <span className="font-semibold">2-3 Hours</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Availability</span>
                    <span className="font-semibold">24/7</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Service Area</span>
                    <span className="font-semibold">Island-wide</span>
                  </div>
                  {service.price_from && (
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="text-muted-foreground">Starting From</span>
                      <span className="font-semibold text-primary">LKR {service.price_from.toLocaleString()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Related Services */}
      {relatedServices.length > 0 && (
        <section className="py-12 md:py-16 bg-muted/50">
          <div className="container">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                Related Services
              </h2>
              <p className="text-muted-foreground">
                Explore other services that might interest you
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {relatedServices.map((related: any) => {
                const RelatedIcon = iconMap[related.icon] || Wrench
                return (
                  <Card key={related.id} className="group hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <RelatedIcon className="h-6 w-6 text-primary" />
                        </div>
                        {related.is_featured && (
                          <Badge variant="secondary">
                            <Star className="h-3 w-3 mr-1 fill-primary text-primary" />
                            Popular
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg mt-4">{related.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {related.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/services/${related.slug}`}>
                          Learn More
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="text-center mt-10">
              <Button asChild size="lg" variant="outline">
                <Link href="/services">
                  View All Services
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
