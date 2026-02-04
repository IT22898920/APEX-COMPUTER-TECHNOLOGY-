'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  MessageCircle,
  Cpu,
  Wifi,
  HardDrive,
  Monitor,
  Shield,
  Clock,
  Headphones,
  Truck,
  Star,
  Zap,
  Award,
  Users
} from 'lucide-react'
import { COMPANY_INFO } from '@/lib/utils/constants'
import { GlitchText, FlipText } from '@/components/ui/glitch-text'
import {
  ScrollFade,
  Parallax,
  TextReveal,
  ScaleOnScroll,
  StaggerContainer,
  StaggerItem,
  Marquee,
  ScrollProgress,
  Magnetic
} from '@/components/ui/scroll-animations'
import dynamic from 'next/dynamic'

// Dynamic imports for heavy 3D components
const LightPillar3D = dynamic(() => import('@/components/ui/light-pillar-3d'), {
  ssr: false,
  loading: () => null
})

const Antigravity = dynamic(() => import('@/components/ui/antigravity'), {
  ssr: false,
  loading: () => null
})

// Stats data
const stats = [
  { value: '500+', label: 'Happy Clients', icon: Users },
  { value: '2-3hr', label: 'Response Time', icon: Clock },
  { value: '15+', label: 'Years Experience', icon: Award },
  { value: '24/7', label: 'Support Available', icon: Headphones },
]

// Features data
const features = [
  {
    icon: Shield,
    title: 'Genuine Products',
    description: 'All products are 100% authentic with manufacturer warranty',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Zap,
    title: 'Expert Support',
    description: 'Professional technicians with years of experience',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Quick delivery across Sri Lanka with tracking',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    icon: Clock,
    title: '24/7 Support',
    description: 'Round-the-clock emergency support available',
    gradient: 'from-green-500 to-emerald-500'
  }
]

// Brands for marquee
const brands = ['ASUS', 'Dell', 'HP', 'Lenovo', 'MSI', 'Acer', 'Intel', 'AMD', 'NVIDIA', 'Samsung', 'Kingston', 'Seagate']

export function HomeV2() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  return (
    <div ref={containerRef} className="relative">
      {/* Scroll Progress Bar */}
      <ScrollProgress />

      {/* ============ HERO SECTION ============ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#030308]">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Gradient Orbs */}
          <motion.div
            className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-r from-blue-600/40 to-purple-600/40 blur-[120px]"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-gradient-to-r from-cyan-500/30 to-blue-600/30 blur-[150px]"
            animate={{
              scale: [1.2, 1, 1.2],
              x: [0, -50, 0],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Grid */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
              backgroundSize: '100px 100px',
            }}
          />

          {/* Light Pillar */}
          <div className="absolute inset-0" style={{ height: '100%' }}>
            <LightPillar3D
              topColor="#3b82f6"
              bottomColor="#8b5cf6"
              intensity={0.3}
              rotationSpeed={0.2}
              glowAmount={0.002}
              pillarWidth={4}
              pillarHeight={0.3}
              noiseIntensity={0.2}
              pillarRotation={20}
              quality="high"
            />
          </div>

          {/* Antigravity Particles */}
          <div className="absolute inset-0 opacity-50">
            <Antigravity
              count={150}
              magnetRadius={15}
              ringRadius={12}
              waveSpeed={0.3}
              waveAmplitude={1}
              particleSize={1}
              lerpSpeed={0.05}
              color="#60a5fa"
              autoAnimate={false}
              particleShape="sphere"
              fieldStrength={8}
            />
          </div>
        </div>

        {/* Hero Content */}
        <div className="container relative z-10 px-4 pt-20">
          <div className="max-w-6xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-400 text-sm font-medium backdrop-blur-sm mb-8">
                <Sparkles className="w-4 h-4 animate-pulse" />
                2-3 Hour Guaranteed Response Time
                <Sparkles className="w-4 h-4 animate-pulse" />
              </span>
            </motion.div>

            {/* Main Title */}
            <div className="mb-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: [0.25, 0.4, 0.25, 1] }}
              >
                <h1 className="text-7xl sm:text-8xl md:text-9xl lg:text-[12rem] font-black tracking-tighter leading-none">
                  <GlitchText
                    text="APEX"
                    className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent"
                  />
                </h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white -mt-4">
                  <FlipText text="COMPUTER" delay={0.5} />
                </h2>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1 }}
                className="text-2xl sm:text-3xl md:text-4xl font-extralight text-transparent bg-gradient-to-r from-slate-500 to-slate-400 bg-clip-text tracking-[0.4em] mt-2"
              >
                TECHNOLOGY
              </motion.p>
            </div>

            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <p className="text-xl sm:text-2xl text-slate-300 mb-4 font-light">
                Your Trusted <span className="font-bold text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text">IT Partner</span> in Sri Lanka
              </p>
              <p className="text-slate-500 max-w-xl mx-auto mb-8">
                Premium IT products, expert repairs, and dedicated support. Everything your business needs to stay connected.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            >
              <Magnetic strength={0.2}>
                <Link
                  href="/products"
                  className="group relative px-8 py-4 rounded-2xl font-bold text-lg overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] animate-gradient-flow" />
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 blur-xl opacity-50 group-hover:opacity-80 transition-opacity" />
                  <span className="relative z-10 flex items-center gap-2 text-white">
                    Shop Products
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </Magnetic>

              <Magnetic strength={0.2}>
                <Link
                  href="/services"
                  className="px-8 py-4 rounded-2xl font-bold text-lg border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all backdrop-blur-sm"
                >
                  Our Services
                </Link>
              </Magnetic>
            </motion.div>

            {/* WhatsApp */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.8 }}
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
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2 }}
            className="mt-20 max-w-5xl mx-auto"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 2.2 + index * 0.1 }}
                >
                  <Magnetic strength={0.15}>
                    <div className="relative group p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-center hover:border-white/20 transition-all">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      <stat.icon className="w-6 h-6 text-blue-400 mx-auto mb-3" />
                      <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{stat.value}</div>
                      <div className="text-sm text-slate-400">{stat.label}</div>
                    </div>
                  </Magnetic>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
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

      {/* ============ BRANDS MARQUEE ============ */}
      <section className="py-4 bg-gradient-to-b from-[#030308] to-[#0a0a15] overflow-hidden">
        <Marquee speed={40} className="py-2">
          {brands.map((brand, i) => (
            <div
              key={i}
              className="px-10 py-2 text-2xl font-bold text-white/15 hover:text-white/40 transition-colors cursor-default"
            >
              {brand}
            </div>
          ))}
        </Marquee>
      </section>
    </div>
  )
}
