'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Shield, Truck, Clock, Award, Headphones, BadgeCheck, CreditCard, RotateCcw } from 'lucide-react'
import { TiltCard } from '@/components/ui/tilt-card'
import { SpotlightCard } from '@/components/ui/spotlight'
import { BorderBeam } from '@/components/ui/border-beam'

const features = [
  {
    icon: Shield,
    title: 'Genuine Products',
    description: 'All products are 100% genuine with manufacturer warranty',
    color: 'from-blue-500 to-cyan-500',
    glowColor: 'rgba(59, 130, 246, 0.3)',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Quick delivery across Sri Lanka within 2-3 business days',
    color: 'from-green-500 to-emerald-500',
    glowColor: 'rgba(34, 197, 94, 0.3)',
  },
  {
    icon: Clock,
    title: '2-3hr Response',
    description: 'Guaranteed response time for all support requests',
    color: 'from-orange-500 to-amber-500',
    glowColor: 'rgba(249, 115, 22, 0.3)',
  },
  {
    icon: Headphones,
    title: 'Expert Support',
    description: 'Dedicated technical support from certified professionals',
    color: 'from-purple-500 to-violet-500',
    glowColor: 'rgba(168, 85, 247, 0.3)',
  },
  {
    icon: BadgeCheck,
    title: '15+ Years Experience',
    description: 'Trusted IT partner for businesses across Sri Lanka',
    color: 'from-pink-500 to-rose-500',
    glowColor: 'rgba(236, 72, 153, 0.3)',
  },
  {
    icon: CreditCard,
    title: 'Flexible Payment',
    description: 'Multiple payment options including installment plans',
    color: 'from-indigo-500 to-blue-500',
    glowColor: 'rgba(99, 102, 241, 0.3)',
  },
]

const brands = [
  'HP', 'Dell', 'Lenovo', 'ASUS', 'Acer', 'Canon', 'Epson', 'Brother',
  'TP-Link', 'D-Link', 'Logitech', 'Samsung', 'LG', 'Kingston', 'WD'
]

export function WhyChooseUs() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="py-20 sm:py-32 relative overflow-hidden bg-gradient-to-b from-background via-background to-slate-950/50">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[800px] w-[1400px] rounded-full bg-gradient-to-b from-primary/5 via-primary/10 to-transparent blur-[100px]" />
        <motion.div
          className="absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-[80px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute left-0 bottom-1/4 h-[300px] w-[300px] rounded-full bg-gradient-to-r from-cyan-500/10 to-green-500/10 blur-[60px]"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="container">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16 sm:mb-20 px-4 sm:px-0"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 backdrop-blur-xl px-5 py-2 text-sm font-medium text-primary mb-6 shadow-lg shadow-primary/10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Award className="mr-2 h-4 w-4" />
            Why Choose Us
          </motion.div>
          <motion.h2
            className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Your Trusted{' '}
            <span className="text-transparent bg-gradient-to-r from-primary via-blue-400 to-cyan-400 bg-clip-text">
              IT Partner
            </span>
          </motion.h2>
          <motion.p
            className="text-muted-foreground max-w-2xl mx-auto text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            We&apos;ve been serving businesses with quality IT products and exceptional service for over a decade
          </motion.p>
        </motion.div>

        {/* Features Grid with TiltCards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-4 sm:px-0 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <TiltCard className="h-full" tiltMaxAngleX={8} tiltMaxAngleY={8} glareEnable={true}>
                <SpotlightCard
                  className="h-full"
                  spotlightColor={feature.glowColor}
                >
                  <div className="relative h-full p-8 rounded-2xl bg-card/80 backdrop-blur-xl border border-primary/10 hover:border-primary/30 transition-all duration-500 group overflow-hidden">
                    {/* Border Beam on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <BorderBeam size={200} duration={8} colorFrom={feature.color.split(' ')[0].replace('from-', '#').replace('blue-500', '3b82f6').replace('green-500', '22c55e').replace('orange-500', 'f97316').replace('purple-500', 'a855f7').replace('pink-500', 'ec4899').replace('indigo-500', '6366f1')} colorTo={feature.color.split(' ')[1].replace('to-', '#').replace('cyan-500', '06b6d4').replace('emerald-500', '10b981').replace('amber-500', 'f59e0b').replace('violet-500', '8b5cf6').replace('rose-500', 'f43f5e').replace('blue-500', '3b82f6')} />
                    </div>

                    {/* Gradient accent line */}
                    <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                    {/* Glow effect */}
                    <div className={`absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-20 blur-[60px] transition-opacity duration-500`} />

                    {/* Icon */}
                    <motion.div
                      className={`relative mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} text-white shadow-xl`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <feature.icon className="h-8 w-8" />
                    </motion.div>

                    {/* Content */}
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </SpotlightCard>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        {/* Trusted Brands */}
        <motion.div
          className="px-4 sm:px-0"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-[0.2em]">
              Authorized Dealer For
            </p>
          </div>

          {/* Brand logos marquee */}
          <div className="relative overflow-hidden py-6 mask-gradient">
            <motion.div
              className="flex space-x-8"
              animate={{ x: ['0%', '-50%'] }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              {[...brands, ...brands, ...brands].map((brand, index) => (
                <motion.div
                  key={`${brand}-${index}`}
                  className="flex-shrink-0 px-8 py-4 rounded-xl bg-card/50 backdrop-blur-sm border border-primary/5 hover:border-primary/20 hover:bg-card transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <span className="text-xl font-bold text-muted-foreground/60 hover:text-foreground transition-colors whitespace-nowrap">
                    {brand}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          className="mt-16 flex flex-wrap justify-center gap-8 sm:gap-12 px-4"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {[
            { icon: Shield, label: 'SSL Secure', color: 'text-green-500' },
            { icon: BadgeCheck, label: 'Verified Seller', color: 'text-blue-500' },
            { icon: RotateCcw, label: 'Easy Returns', color: 'text-orange-500' },
            { icon: Truck, label: 'Island-wide Delivery', color: 'text-purple-500' },
          ].map((badge, index) => (
            <motion.div
              key={badge.label}
              className="flex items-center gap-3 px-5 py-3 rounded-full bg-card/50 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
            >
              <badge.icon className={`h-5 w-5 ${badge.color}`} />
              <span className="text-sm font-medium text-muted-foreground">{badge.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Add gradient mask for marquee */}
      <style jsx>{`
        .mask-gradient {
          mask-image: linear-gradient(
            to right,
            transparent,
            black 10%,
            black 90%,
            transparent
          );
          -webkit-mask-image: linear-gradient(
            to right,
            transparent,
            black 10%,
            black 90%,
            transparent
          );
        }
      `}</style>
    </section>
  )
}
