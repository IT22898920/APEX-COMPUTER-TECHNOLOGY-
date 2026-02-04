'use client'

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
import { Badge } from '@/components/ui/badge'
import {
  ScrollFade,
  ScaleOnScroll,
  StaggerContainer,
  StaggerItem,
  TextReveal,
  Magnetic
} from '@/components/ui/scroll-animations'

// Icon mapping
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

interface Service {
  id: string
  title: string
  slug: string
  description: string
  icon: string
  image_url?: string | null
  images?: string[] | null
  is_featured: boolean
  features?: string[] | null
}

export function ServiceAnimationWrapper({ services }: { services: Service[] }) {
  return (
    <>
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
        <div>
          <ScrollFade>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-4">
              <Star className="w-4 h-4" />
              Professional Services
            </span>
          </ScrollFade>
          <ScaleOnScroll scaleStart={0.9}>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
              <TextReveal text="What We Offer" />
            </h2>
          </ScaleOnScroll>
          <ScrollFade delay={0.2}>
            <p className="mt-4 text-slate-400 text-lg max-w-xl">
              From hardware repairs to complete IT infrastructure setup, we provide end-to-end solutions
            </p>
          </ScrollFade>
        </div>
        <ScrollFade direction="left" delay={0.3}>
          <Magnetic strength={0.15}>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
            >
              View All Services
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Magnetic>
        </ScrollFade>
      </div>

      {/* Services Grid */}
      <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
        {services.map((service) => {
          const Icon = iconMap[service.icon] || Wrench
          const imageUrl = service.images?.[0] || service.image_url

          return (
            <StaggerItem key={service.id}>
              <Magnetic strength={0.08}>
                <Link href={`/services/${service.slug}`}>
                  <Card className="group h-full overflow-hidden bg-white/[0.03] border-white/10 hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 hover:-translate-y-2">
                    {/* Image Section */}
                    <div className="relative h-52 overflow-hidden">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={service.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                          <Icon className="h-20 w-20 text-purple-400/30" />
                        </div>
                      )}

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                      {/* Icon Badge */}
                      <div className="absolute top-4 left-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 group-hover:bg-purple-500 group-hover:border-purple-500 transition-all duration-300">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                      </div>

                      {/* Featured Badge */}
                      {service.is_featured && (
                        <Badge className="absolute top-4 right-4 bg-amber-500/90 text-white border-0 backdrop-blur-sm">
                          <Star className="mr-1 h-3 w-3 fill-white" />
                          Popular
                        </Badge>
                      )}

                      {/* Title on Image */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                          {service.title}
                        </h3>
                      </div>
                    </div>

                    {/* Content Section */}
                    <CardContent className="p-5">
                      <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2">
                        {service.description}
                      </p>

                      {/* Features Preview */}
                      {service.features && service.features.length > 0 && (
                        <div className="space-y-2 mb-4">
                          {service.features.slice(0, 2).map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                              <span className="text-slate-400 line-clamp-1">{feature}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Learn More Link */}
                      <div className="flex items-center text-purple-400 font-medium text-sm">
                        <span>Learn More</span>
                        <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </Magnetic>
            </StaggerItem>
          )
        })}
      </StaggerContainer>

      {/* CTA */}
      <ScrollFade delay={0.5}>
        <div className="mt-16 text-center">
          <Magnetic strength={0.2}>
            <Link
              href="/services"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all"
            >
              View All Services
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Magnetic>
        </div>
      </ScrollFade>
    </>
  )
}
