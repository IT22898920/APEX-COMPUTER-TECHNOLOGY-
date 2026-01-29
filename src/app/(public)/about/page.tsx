import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  CheckCircle,
  Users,
  Award,
  Clock,
  Shield,
  Target,
  Lightbulb,
  Heart,
  ArrowRight,
  Phone,
  MessageCircle,
  Building2,
  Wrench,
  Monitor,
  Network,
  Headphones,
} from 'lucide-react'
import { COMPANY_INFO } from '@/lib/utils/constants'

export const metadata: Metadata = {
  title: 'About Us | APEX Computer Technology',
  description: 'Learn about APEX Computer Technology - your trusted partner for IT solutions in Sri Lanka since establishment.',
}

const stats = [
  { value: '15+', label: 'Years Experience', icon: Clock },
  { value: '500+', label: 'Happy Clients', icon: Users },
  { value: '24/7', label: 'Support Available', icon: Headphones },
  { value: '2-3hrs', label: 'Response Time', icon: Shield },
]

const values = [
  {
    icon: Target,
    title: 'Quality First',
    description: 'We never compromise on the quality of our products and services. Every solution we deliver meets the highest standards.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description: 'We stay updated with the latest technologies to provide cutting-edge solutions that keep your business ahead.',
  },
  {
    icon: Heart,
    title: 'Customer Focus',
    description: 'Your success is our priority. We build lasting relationships by truly understanding and meeting your needs.',
  },
  {
    icon: Shield,
    title: 'Reliability',
    description: 'Count on us to be there when you need us. Our 24/7 support ensures your business never stops.',
  },
]

const services = [
  {
    icon: Monitor,
    title: 'Computer Sales & Repairs',
    description: 'Quality computers and expert repair services',
  },
  {
    icon: Network,
    title: 'Network Solutions',
    description: 'Professional network setup and maintenance',
  },
  {
    icon: Wrench,
    title: 'Hardware Maintenance',
    description: 'Comprehensive maintenance contracts',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Round-the-clock technical assistance',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              About APEX Computer Technology
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80">
              Your trusted partner for comprehensive IT solutions in Sri Lanka. We deliver excellence in technology services since our establishment.
            </p>
          </div>
        </div>
        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 30L80 35C160 40 320 50 480 50C640 50 800 40 960 35C1120 30 1280 30 1360 30L1440 30V60H1360C1280 60 1120 60 960 60C800 60 640 60 480 60C320 60 160 60 80 60H0V30Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 -mt-8">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, idx) => (
              <Card key={idx} className="text-center border-primary/10 hover:border-primary/30 hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong className="text-foreground">APEX Computer Technology</strong> was founded with a simple mission: to provide reliable, high-quality IT solutions to businesses in Sri Lanka. What started as a small computer repair shop has grown into a comprehensive IT services company serving hundreds of clients across the island.
                </p>
                <p>
                  Located in the heart of Colombo, we have built our reputation on trust, quality, and exceptional customer service. Our team of certified professionals brings years of experience in hardware repairs, network solutions, software support, and IT consulting.
                </p>
                <p>
                  Today, we proudly serve businesses of all sizes - from small startups to large enterprises. Our commitment to excellence and customer satisfaction remains at the core of everything we do.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild>
                  <Link href="/services">
                    Our Services
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="relative h-48 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400"
                      alt="Computer Technology"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="relative h-32 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400"
                      alt="Network Solutions"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="relative h-32 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src="https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400"
                      alt="Hardware Repairs"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="relative h-48 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400"
                      alt="IT Support Team"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
              Our Core Values
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These principles guide everything we do and define who we are as a company.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, idx) => (
              <Card key={idx} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <value.icon className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
              What We Offer
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive IT solutions tailored to meet your business needs.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, idx) => (
              <Card key={idx} className="group hover:shadow-lg hover:border-primary/30 transition-all">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary transition-colors">
                    <service.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild size="lg">
              <Link href="/services">
                View All Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
                Why Choose APEX?
              </h2>
              <div className="space-y-4">
                {[
                  'Experienced team of certified IT professionals',
                  'Fast response times - 2-3 hours for emergencies',
                  '24/7 support availability for critical issues',
                  'Comprehensive service warranty on all work',
                  'Competitive pricing with transparent quotes',
                  'Island-wide service coverage',
                  'Genuine products from authorized dealers',
                  'Long-term maintenance contracts available',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <Card className="bg-primary text-primary-foreground border-0">
              <CardContent className="p-8">
                <Building2 className="h-12 w-12 mb-6 opacity-80" />
                <h3 className="text-xl font-bold mb-4">Ready to Get Started?</h3>
                <p className="text-primary-foreground/80 mb-6">
                  Contact us today for a free consultation. Let us help you find the right IT solutions for your business.
                </p>
                <div className="space-y-3">
                  <Button variant="secondary" className="w-full" size="lg" asChild>
                    <a href={`tel:${COMPANY_INFO.phone}`}>
                      <Phone className="mr-2 h-5 w-5" />
                      {COMPANY_INFO.phone}
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent border-white text-white hover:bg-white/10" size="lg" asChild>
                    <a
                      href={`https://wa.me/${COMPANY_INFO.whatsapp}?text=${encodeURIComponent("Hi, I'd like to learn more about your services.")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      WhatsApp Us
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
              Let&apos;s Work Together
            </h2>
            <p className="text-muted-foreground mb-8">
              Whether you need computer repairs, network setup, or ongoing IT support, we&apos;re here to help your business succeed.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/contact">
                  Contact Us
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
