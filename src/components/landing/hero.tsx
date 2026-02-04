'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, CheckCircle2, MessageCircle, Cpu, Wifi, HardDrive, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { COMPANY_INFO } from '@/lib/utils/constants'
import { GlitchText, FlipText } from '@/components/ui/glitch-text'
import dynamic from 'next/dynamic'

// Dynamic import for Three.js Light Pillar (client-only)
const LightPillar3D = dynamic(() => import('@/components/ui/light-pillar-3d'), {
  ssr: false,
  loading: () => null
})

// Dynamic import for Antigravity particles
const Antigravity = dynamic(() => import('@/components/ui/antigravity'), {
  ssr: false,
  loading: () => null
})

const stats = [
  { value: '500+', label: 'Happy Clients' },
  { value: '2-3hr', label: 'Response Time' },
  { value: '15+', label: 'Years Experience' },
  { value: '24/7', label: 'Support' },
]

const floatingIcons = [
  { Icon: Cpu, x: '10%', y: '20%', delay: 0, size: 40 },
  { Icon: Monitor, x: '85%', y: '15%', delay: 0.5, size: 48 },
  { Icon: Wifi, x: '5%', y: '70%', delay: 1, size: 36 },
  { Icon: HardDrive, x: '90%', y: '75%', delay: 1.5, size: 42 },
]

export function Hero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0f]">
      {/* Dramatic Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Large Gradient Orbs */}
        <motion.div
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-r from-blue-600/50 to-purple-600/50 blur-[100px]"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-r from-cyan-500/40 to-blue-600/40 blur-[120px]"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30 blur-[80px]"
          animate={{
            scale: [1, 1.4, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />

        {/* Scan Line Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"
            animate={{ y: ['-100%', '100vh'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />

        {/* Noise Overlay */}
        <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]" />

        {/* Three.js Light Pillar Effect */}
        <div className="absolute inset-0 pointer-events-none" style={{ height: '100%' }}>
          <LightPillar3D
            topColor="#3b82f6"
            bottomColor="#8b5cf6"
            intensity={0.4}
            rotationSpeed={0.3}
            glowAmount={0.003}
            pillarWidth={3}
            pillarHeight={0.4}
            noiseIntensity={0.3}
            pillarRotation={15}
            interactive={false}
            mixBlendMode="screen"
            quality="high"
          />
        </div>

        {/* Antigravity Particles Effect - Follows Mouse */}
        <div className="absolute inset-0 opacity-70">
          <Antigravity
            count={250}
            magnetRadius={12}
            ringRadius={10}
            waveSpeed={0.5}
            waveAmplitude={1.5}
            particleSize={1.5}
            lerpSpeed={0.08}
            color="#3b82f6"
            autoAnimate={false}
            particleVariance={1.2}
            rotationSpeed={0.3}
            depthFactor={1.2}
            pulseSpeed={2.5}
            particleShape="capsule"
            fieldStrength={10}
          />
        </div>
      </div>

      {/* Floating Tech Icons */}
      {mounted && floatingIcons.map(({ Icon, x, y, delay, size }, index) => (
        <motion.div
          key={index}
          className="absolute hidden lg:block"
          style={{ left: x, top: y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.1, 1],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 4,
            delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <Icon size={size} className="text-blue-400/60" />
          </div>
        </motion.div>
      ))}

      {/* Main Content */}
      <div className="container relative z-10 px-4">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-400 text-sm font-medium backdrop-blur-sm">
              <Sparkles className="w-4 h-4 animate-pulse" />
              2-3 Hour Guaranteed Response Time
              <Sparkles className="w-4 h-4 animate-pulse" />
            </span>
          </motion.div>

          {/* Main Title - DRAMATIC */}
          <div className="mb-6">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-2">
                <GlitchText
                  text="APEX"
                  className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent animate-gradient-flow"
                />
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white">
                <FlipText text="COMPUTER" delay={0.8} />
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.5 }}
              className="text-2xl sm:text-3xl md:text-4xl font-light text-transparent bg-gradient-to-r from-slate-400 to-slate-600 bg-clip-text tracking-[0.3em] mt-4"
            >
              TECHNOLOGY
            </motion.p>
          </div>

          {/* Animated Line */}
          <motion.div
            className="w-32 h-1 mx-auto mb-8 rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 1.8 }}
          />

          {/* Tagline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2 }}
            className="text-xl sm:text-2xl md:text-3xl text-slate-300 mb-6 font-light"
          >
            Your Trusted{' '}
            <span className="font-bold text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text">
              IT Partner
            </span>{' '}
            in Sri Lanka
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 2.2 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto mb-8"
          >
            Premium IT products, expert repairs, and dedicated support.
            Everything your business needs to stay connected.
          </motion.p>

          {/* Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.4 }}
            className="flex flex-wrap justify-center gap-6 mb-10"
          >
            {['Genuine Products', 'Expert Support', 'Fast Delivery'].map((item, index) => (
              <motion.div
                key={item}
                className="flex items-center gap-2 text-slate-300"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.5 + index * 0.1 }}
              >
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>{item}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
          >
            <Link href="/products">
              <motion.button
                className="group relative px-10 py-5 rounded-2xl font-bold text-lg overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] animate-gradient-flow" />

                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 blur-xl opacity-50 group-hover:opacity-80 transition-opacity" />

                <span className="relative z-10 flex items-center gap-2 text-white">
                  Shop Products
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
            </Link>

            <Link href="/services">
              <motion.button
                className="px-10 py-5 rounded-2xl font-bold text-lg border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Our Services
              </motion.button>
            </Link>
          </motion.div>

          {/* WhatsApp */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.8 }}
          >
            <a
              href={`https://wa.me/${COMPANY_INFO.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/30 transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp Us
            </a>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 3 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3.2 + index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-center hover:border-white/20 transition-colors">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.5 }}
      >
        <motion.div
          className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2"
          animate={{ borderColor: ['rgba(255,255,255,0.3)', 'rgba(59,130,246,0.5)', 'rgba(255,255,255,0.3)'] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="w-1.5 h-3 rounded-full bg-blue-400"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
