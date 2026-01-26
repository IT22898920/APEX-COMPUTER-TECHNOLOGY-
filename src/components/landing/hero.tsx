'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Clock, Shield, Users, Zap, Sparkles, CheckCircle2, Laptop, Monitor, Printer, Server } from 'lucide-react'
import { Button } from '@/components/ui/button'

const stats = [
  { icon: Users, value: '500+', label: 'Happy Clients' },
  { icon: Clock, value: '2-3hr', label: 'Response Time' },
  { icon: Shield, value: '10+', label: 'Years Experience' },
  { icon: Zap, value: '98%', label: 'Uptime Guarantee' },
]

const floatingItems = [
  { icon: Laptop, delay: '0s', position: 'top-1/4 left-[15%]' },
  { icon: Monitor, delay: '1s', position: 'top-1/3 right-[10%]' },
  { icon: Printer, delay: '2s', position: 'bottom-1/3 left-[10%]' },
  { icon: Server, delay: '0.5s', position: 'bottom-1/4 right-[15%]' },
]

const highlights = [
  'Genuine Products with Warranty',
  'Expert Technical Support',
  'Fast Island-wide Delivery',
]

export function Hero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-[80vh] md:min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-primary/30 blur-[120px] animate-pulse" />
        <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-blue-500/20 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[300px] w-[800px] rounded-full bg-cyan-500/10 blur-[100px]" />
      </div>

      {/* Floating tech icons */}
      {mounted && floatingItems.map((item, index) => (
        <div
          key={index}
          className={`absolute ${item.position} hidden lg:block opacity-20`}
          style={{
            animation: `float 6s ease-in-out infinite`,
            animationDelay: item.delay,
          }}
        >
          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <item.icon className="h-8 w-8 text-white" />
          </div>
        </div>
      ))}

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 -z-10 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="container py-16 sm:py-20 md:py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Content */}
          <div className={`text-center lg:text-left transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Badge */}
            <div className="mb-6 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm px-4 py-2 text-sm font-medium text-primary shadow-lg shadow-primary/10">
              <Sparkles className="mr-2 h-4 w-4" />
              <span>2-3 Hour Guaranteed Response Time</span>
            </div>

            {/* Headline */}
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-white">
              Your Trusted{' '}
              <span className="relative">
                <span className="text-transparent bg-gradient-to-r from-primary via-blue-400 to-cyan-400 bg-clip-text">
                  IT Partner
                </span>
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary via-blue-400 to-cyan-400 rounded-full" />
              </span>
              {' '}in Sri Lanka
            </h1>

            {/* Subheadline */}
            <p className="mb-8 text-lg text-slate-300 sm:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Premium IT products, expert repairs, and dedicated support.
              Everything your business needs to stay connected and productive.
            </p>

            {/* Highlights */}
            <div className="mb-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              {highlights.map((highlight) => (
                <div key={highlight} className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
                  <span className="text-sm">{highlight}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 px-8 text-lg h-14"
                asChild
              >
                <Link href="/products">
                  Shop Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-slate-500 text-white hover:bg-white/10 backdrop-blur-sm px-8 text-lg h-14"
                asChild
              >
                <Link href="/services">Our Services</Link>
              </Button>
            </div>
          </div>

          {/* Right Content - Featured Image/Visual */}
          <div className={`relative hidden lg:block transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="relative">
              {/* Main visual container */}
              <div className="relative z-10 rounded-3xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 p-8">
                {/* Decorative elements */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>

                {/* Content grid */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  {[
                    { label: 'Laptops', count: '50+', color: 'from-blue-500 to-cyan-500' },
                    { label: 'Printers', count: '30+', color: 'from-purple-500 to-pink-500' },
                    { label: 'Networking', count: '40+', color: 'from-orange-500 to-red-500' },
                    { label: 'Accessories', count: '100+', color: 'from-green-500 to-emerald-500' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group cursor-pointer"
                    >
                      <div className={`text-2xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                        {item.count}
                      </div>
                      <div className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom banner */}
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary/20 to-blue-500/20 border border-primary/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-semibold">Free Consultation</div>
                      <div className="text-sm text-slate-400">Get expert advice today</div>
                    </div>
                    <Button size="sm" variant="secondary" className="shrink-0">
                      Contact Us
                    </Button>
                  </div>
                </div>
              </div>

              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary/20 blur-2xl" />
              <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-blue-500/20 blur-2xl" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className={`mt-16 sm:mt-20 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4 max-w-4xl mx-auto transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {stats.map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="group flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-6 text-center hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="mb-2 sm:mb-3 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-primary/20 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white">{value}</div>
              <div className="text-xs sm:text-sm text-slate-400 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-slate-400">
        <span className="text-xs uppercase tracking-wider">Scroll to explore</span>
        <div className="h-10 w-6 rounded-full border-2 border-slate-500 flex items-start justify-center p-1">
          <div className="h-2 w-1 rounded-full bg-slate-400 animate-bounce" />
        </div>
      </div>

      {/* Add custom CSS for floating animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </section>
  )
}
