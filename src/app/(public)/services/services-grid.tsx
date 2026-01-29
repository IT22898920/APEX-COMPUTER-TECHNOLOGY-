import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  ArrowRight,
  CheckCircle2,
  Star,
  Cpu,
  ShoppingCart,
  Zap,
} from 'lucide-react'

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
  display_order: number
}

interface ServicesGridProps {
  search?: string
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

async function getServices(search?: string) {
  const supabase = await createClient()

  let query = (supabase as any)
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  // Search filter
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching services:', error)
    return []
  }

  return data as Service[]
}

export async function ServicesGrid({ search }: ServicesGridProps) {
  const services = await getServices(search)

  return (
    <div>
      {/* Results count */}
      <div className="mb-6">
        <p className="text-sm sm:text-base text-muted-foreground">
          {search ? (
            <>
              Found <span className="font-medium text-foreground">{services.length}</span> service{services.length !== 1 ? 's' : ''} for &quot;{search}&quot;
            </>
          ) : (
            <>
              Showing <span className="font-medium text-foreground">{services.length}</span> services
            </>
          )}
        </p>
      </div>

      {/* Services Grid */}
      {services.length === 0 ? (
        <div className="text-center py-16">
          <Wrench className="mx-auto h-16 w-16 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No services found</h3>
          <p className="text-muted-foreground mt-2">
            Try adjusting your search terms
          </p>
          <Button asChild className="mt-4">
            <Link href="/services">View All Services</Link>
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {services.map((service) => {
            const Icon = iconMap[service.icon] || Wrench
            const imageUrl = service.images?.[0] || service.image_url

            return (
              <Link key={service.id} href={`/services/${service.slug}`}>
                <Card className="group h-full overflow-hidden border-primary/10 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
                  {/* Service Image */}
                  {imageUrl && (
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt={service.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <div className="w-10 h-10 rounded-lg bg-white/90 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        {service.is_featured && (
                          <Badge variant="secondary" className="text-xs bg-white/90">
                            <Star className="h-3 w-3 mr-1 fill-primary text-primary" />
                            Popular
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <CardContent className={`p-5 sm:p-6 ${!imageUrl ? 'pt-6' : ''}`}>
                    {/* Header (only if no image) */}
                    {!imageUrl && (
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Icon className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
                        </div>
                        {service.is_featured && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1 fill-primary text-primary" />
                            Popular
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Content */}
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {service.description}
                    </p>

                    {/* Features */}
                    {service.features && service.features.length > 0 && (
                      <ul className="space-y-2 mb-6">
                        {service.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                            <span className="line-clamp-1">{feature}</span>
                          </li>
                        ))}
                        {service.features.length > 3 && (
                          <li className="text-xs text-muted-foreground pl-6">
                            +{service.features.length - 3} more features
                          </li>
                        )}
                      </ul>
                    )}

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      {service.price_from ? (
                        <div>
                          <p className="text-xs text-muted-foreground">Starting from</p>
                          <p className="text-lg font-bold text-primary">
                            LKR {service.price_from.toLocaleString()}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-medium text-primary">Contact for pricing</p>
                        </div>
                      )}
                      <Button variant="ghost" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
