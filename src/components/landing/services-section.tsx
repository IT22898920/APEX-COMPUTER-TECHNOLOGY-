import Link from 'next/link'
import Image from 'next/image'
import {
  Wrench,
  Network,
  Monitor,
  ShoppingCart,
  FileText,
  AlertCircle,
  ArrowRight,
  Shield,
  Server,
  Database,
  Cloud,
  Cpu,
  Wifi,
  Printer,
  Cable,
  Package,
  Laptop,
  HardDrive,
  Zap,
  CheckCircle2,
  Star,
  LucideIcon,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getActiveServices } from '@/app/(dashboard)/admin/services/actions'

// Icon mapping from string to component
const iconMap: Record<string, LucideIcon> = {
  Wrench,
  Network,
  Monitor,
  ShoppingCart,
  FileText,
  AlertCircle,
  Shield,
  Server,
  Database,
  Cloud,
  Cpu,
  Wifi,
  Printer,
  Cable,
  Package,
  Laptop,
  HardDrive,
  Zap,
}

export async function ServicesSection() {
  const { services } = await getActiveServices()

  // Use featured services first, then fill with other active services
  const featuredServices = services.filter(s => s.is_featured)
  const otherServices = services.filter(s => !s.is_featured)
  const displayServices = [...featuredServices, ...otherServices].slice(0, 6)

  if (displayServices.length === 0) return null

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-muted/30 via-background to-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-0 top-1/4 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute right-0 bottom-1/4 h-[350px] w-[350px] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      <div className="container">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-12 sm:mb-16 px-4 sm:px-0">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
            <Star className="mr-2 h-4 w-4 fill-primary" />
            Professional IT Services
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            Solutions That Drive Your
            <span className="text-transparent bg-gradient-to-r from-primary to-blue-500 bg-clip-text"> Business Forward</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From hardware repairs to complete IT infrastructure setup, we provide end-to-end solutions tailored to your needs
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 px-4 sm:px-0">
          {displayServices.map((service, index) => {
            const Icon = iconMap[service.icon] || Wrench
            const imageUrl = service.images?.[0] || service.image_url

            return (
              <Link key={service.id} href={`/services/${service.slug}`}>
                <Card className="group h-full overflow-hidden border-0 bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2">
                  {/* Image Section */}
                  <div className="relative h-48 overflow-hidden">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={service.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center">
                        <Icon className="h-16 w-16 text-primary/40" />
                      </div>
                    )}
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Icon Badge */}
                    <div className="absolute top-4 left-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/90 backdrop-blur-sm shadow-lg group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        <Icon className="h-6 w-6 text-primary group-hover:text-white" />
                      </div>
                    </div>

                    {/* Featured Badge */}
                    {service.is_featured && (
                      <Badge className="absolute top-4 right-4 bg-amber-500/90 hover:bg-amber-500 backdrop-blur-sm">
                        <Star className="mr-1 h-3 w-3 fill-white" />
                        Popular
                      </Badge>
                    )}

                    {/* Title on Image */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">
                        {service.title}
                      </h3>
                    </div>
                  </div>

                  {/* Content Section */}
                  <CardContent className="p-5">
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
                      {service.description}
                    </p>

                    {/* Features Preview */}
                    {service.features && service.features.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {service.features.slice(0, 2).map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                            <span className="text-muted-foreground line-clamp-1">{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Learn More Link */}
                    <div className="flex items-center text-primary font-medium text-sm group-hover:gap-2 transition-all">
                      <span>Learn More</span>
                      <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 sm:mt-16 text-center">
          <Button size="lg" className="shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 px-8 h-14 text-lg" asChild>
            <Link href="/services">
              View All Services
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
