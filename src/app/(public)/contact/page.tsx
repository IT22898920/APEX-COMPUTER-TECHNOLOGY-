import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  ArrowRight,
  Building2,
  Headphones,
} from 'lucide-react'
import { COMPANY_INFO } from '@/lib/utils/constants'

export const metadata: Metadata = {
  title: 'Contact Us | APEX Computer Technology',
  description: 'Get in touch with APEX Computer Technology for all your IT needs. We offer 24/7 support and fast response times.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground py-16 md:py-24">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Get In Touch
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80">
              We&apos;re here to help with all your IT needs. Reach out to us through any of the channels below.
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

      {/* Contact Cards */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Phone */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <Phone className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-lg">Call Us</CardTitle>
                <CardDescription>Mon-Fri 8AM-6PM</CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  href={`tel:${COMPANY_INFO.phone}`}
                  className="text-lg font-semibold text-primary hover:underline"
                >
                  {COMPANY_INFO.phone}
                </a>
              </CardContent>
            </Card>

            {/* WhatsApp */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-[#25D366]/10 flex items-center justify-center mx-auto mb-2">
                  <MessageCircle className="h-7 w-7 text-[#25D366]" />
                </div>
                <CardTitle className="text-lg">WhatsApp</CardTitle>
                <CardDescription>Quick Response</CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  href={`https://wa.me/${COMPANY_INFO.whatsapp}?text=${encodeURIComponent("Hi, I'd like to inquire about your services.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-[#25D366] hover:underline"
                >
                  {COMPANY_INFO.whatsappDisplay}
                </a>
              </CardContent>
            </Card>

            {/* Email */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-2">
                  <Mail className="h-7 w-7 text-blue-500" />
                </div>
                <CardTitle className="text-lg">Email Us</CardTitle>
                <CardDescription>We reply within 24hrs</CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  href={`mailto:${COMPANY_INFO.email}`}
                  className="text-lg font-semibold text-blue-500 hover:underline"
                >
                  {COMPANY_INFO.email}
                </a>
              </CardContent>
            </Card>

            {/* Emergency */}
            <Card className="text-center hover:shadow-lg transition-shadow border-red-200 bg-red-50/50">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-2">
                  <Headphones className="h-7 w-7 text-red-500" />
                </div>
                <CardTitle className="text-lg">Emergency</CardTitle>
                <CardDescription>24/7 Available</CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  href={`tel:${COMPANY_INFO.phone}`}
                  className="text-lg font-semibold text-red-500 hover:underline"
                >
                  {COMPANY_INFO.phone}
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Location & Hours */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Office Location */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Our Office</CardTitle>
                    <CardDescription>Visit us at our location</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-medium">{COMPANY_INFO.name}</p>
                  <p className="text-muted-foreground">
                    #236/15, Wijayakumarathunga Mawatha<br />
                    Colombo 05<br />
                    Sri Lanka
                  </p>
                </div>
                <Button asChild className="w-full">
                  <a
                    href="https://maps.google.com/?q=236/15+Wijayakumarathunga+Mawatha+Colombo+05"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Get Directions
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Working Hours */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Working Hours</CardTitle>
                    <CardDescription>When we&apos;re available</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">Monday - Friday</span>
                    <span className="text-muted-foreground">8:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">Saturday</span>
                    <span className="text-muted-foreground">9:00 AM - 2:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">Sunday</span>
                    <span className="text-muted-foreground">Closed</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="font-medium text-green-700">Emergency Support</span>
                    <span className="text-green-600 font-semibold">24/7</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16">
        <div className="container">
          <Card className="bg-primary text-primary-foreground border-0">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">
                    Need IT Support?
                  </h2>
                  <p className="text-primary-foreground/80 max-w-lg">
                    Browse our products or explore our services to find the right solution for your business.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button size="lg" variant="secondary" asChild>
                    <Link href="/services">
                      Our Services
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                    <Link href="/products">
                      Browse Products
                    </Link>
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
