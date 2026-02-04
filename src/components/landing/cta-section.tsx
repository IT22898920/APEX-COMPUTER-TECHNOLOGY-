'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { Phone, Mail, Wrench, ArrowRight, Headphones, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { COMPANY_INFO } from '@/lib/utils/constants'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { ShimmerButton, NeonButton, LiquidButton } from '@/components/ui/animated-button'
import { MorphingBlob, FloatingDots, GradientOrb } from '@/components/ui/floating-elements'
import { Particles } from '@/components/ui/particles'

export function CTASection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section
      ref={ref}
      className="py-16 sm:py-24 md:py-32 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 -z-0">
        {/* Particles */}
        <Particles
          className="absolute inset-0"
          quantity={50}
          color="#3b82f6"
          size={0.4}
          staticity={40}
        />

        {/* Morphing Blobs */}
        <MorphingBlob
          className="left-[-10%] top-[-20%]"
          color="rgba(59, 130, 246, 0.2)"
          size={500}
          duration={10}
        />
        <MorphingBlob
          className="right-[-10%] bottom-[-20%]"
          color="rgba(139, 92, 246, 0.2)"
          size={400}
          duration={12}
        />

        {/* Gradient Orbs */}
        <GradientOrb
          className="left-1/4 top-1/4"
          colors={['#3b82f6', '#8b5cf6']}
          size={300}
          blur={120}
          duration={15}
        />
        <GradientOrb
          className="right-1/4 bottom-1/4"
          colors={['#06b6d4', '#3b82f6']}
          size={250}
          blur={100}
          duration={12}
        />

        {/* Floating Dots */}
        <FloatingDots count={30} color="rgba(59, 130, 246, 0.3)" />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl text-center px-4 sm:px-0">
          {/* Animated Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="mb-8 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 backdrop-blur-xl px-5 py-2.5 text-sm font-medium text-primary shadow-lg shadow-primary/20"
          >
            <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
            <span>24/7 Support Available</span>
          </motion.div>

          {/* Icon with Glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8 relative inline-block"
          >
            <div className="absolute inset-0 bg-primary/30 rounded-3xl blur-2xl animate-pulse" />
            <div className="relative h-20 w-20 rounded-3xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-2xl shadow-primary/50">
              <Headphones className="h-10 w-10" />
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl mb-6"
          >
            Need IT Support?{' '}
            <span className="text-transparent bg-gradient-to-r from-primary via-blue-400 to-cyan-400 bg-clip-text">
              We&apos;re Here to Help.
            </span>
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg sm:text-xl text-slate-300 mb-10 sm:mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Don&apos;t let IT issues slow down your business. Contact us now for fast, reliable support.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-10"
          >
            {/* Call Now - Shimmer Button */}
            <MagneticButton strength={25}>
              <ShimmerButton
                className="text-lg"
                shimmerColor="#ffffff"
                background="linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                onClick={() => window.open(`tel:${COMPANY_INFO.phone}`, '_self')}
              >
                <Phone className="mr-2 h-5 w-5" />
                Call Now: {COMPANY_INFO.phone}
              </ShimmerButton>
            </MagneticButton>

            {/* Email - Neon Button */}
            <MagneticButton strength={25}>
              <NeonButton
                color="#3b82f6"
                onClick={() => window.open(`mailto:${COMPANY_INFO.email}`, '_self')}
              >
                <Mail className="mr-2 h-5 w-5 inline" />
                Email Us
              </NeonButton>
            </MagneticButton>
          </motion.div>

          {/* Main CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="pt-4"
          >
            <MagneticButton strength={20}>
              <Link href="/login" className="group inline-block">
                <motion.div
                  className="relative px-10 py-5 rounded-2xl bg-white text-slate-900 font-bold text-lg overflow-hidden shadow-2xl shadow-white/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                  <span className="relative z-10 flex items-center justify-center">
                    <Wrench className="mr-2 h-5 w-5" />
                    Report an Issue - Get Help Now
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.div>
              </Link>
            </MagneticButton>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-slate-400"
          >
            {[
              { label: '2-3hr Response', value: 'Guaranteed' },
              { label: '500+ Clients', value: 'Satisfied' },
              { label: '15+ Years', value: 'Experience' },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
              >
                <span className="text-2xl font-bold text-white">{item.label}</span>
                <span className="text-slate-500">{item.value}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
