import Link from 'next/link'
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
  LucideIcon,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

// Gradient mapping for visual variety
const gradients = [
  'from-blue-500/20 to-cyan-500/20',
  'from-indigo-500/20 to-blue-500/20',
  'from-violet-500/20 to-indigo-500/20',
  'from-cyan-500/20 to-teal-500/20',
  'from-blue-500/20 to-violet-500/20',
  'from-sky-500/20 to-blue-500/20',
]

export async function ServicesSection() {
  const { services } = await getActiveServices()

  // Use featured services first, then fill with other active services
  const featuredServices = services.filter(s => s.is_featured)
  const otherServices = services.filter(s => !s.is_featured)
  const displayServices = [...featuredServices, ...otherServices].slice(0, 6)

  return (
    <section className="py-12 sm:py-20 md:py-28 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-1/4 top-1/2 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute -right-1/4 top-1/3 h-[350px] w-[350px] rounded-full bg-primary/5 blur-[80px]" />
      </div>

      <div className="container">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-10 sm:mb-16 px-4 sm:px-0">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-4">
            What We Offer
          </div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl mb-4">
            Our Services
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Comprehensive IT solutions to keep your business running smoothly
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 px-4 sm:px-0">
          {displayServices.map((service, index) => {
            const Icon = iconMap[service.icon] || Wrench
            const gradient = gradients[index % gradients.length]

            return (
              <Card key={service.id} className="group relative overflow-hidden border-primary/10 hover:border-primary/25 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                <CardHeader className="relative">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 group-hover:scale-110">
                    <Icon className="h-7 w-7" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <CardDescription className="text-base leading-relaxed">{service.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 sm:mt-16 text-center">
          <Button size="lg" className="shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 px-8" asChild>
            <Link href="/services">
              Learn More About Our Services
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
