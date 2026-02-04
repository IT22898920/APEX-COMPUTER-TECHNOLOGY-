'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, MessageCircle, Phone, Mail } from 'lucide-react'
import { COMPANY_INFO } from '@/lib/utils/constants'
import {
  ScrollFade,
  ScaleOnScroll,
  CharReveal,
  Magnetic
} from '@/components/ui/scroll-animations'

export function CTASectionV2() {
  return (
    <section className="py-32 bg-[#0f0f1a] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-[150px]"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="container relative z-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <ScaleOnScroll>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-8">
              <CharReveal text="Ready to Get Started?" />
            </h2>
          </ScaleOnScroll>

          <ScrollFade delay={0.3}>
            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
              Contact us today for a free consultation. Let us help you find the perfect IT solutions for your needs.
            </p>
          </ScrollFade>

          <ScrollFade delay={0.5}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Magnetic strength={0.2}>
                <Link
                  href="/contact"
                  className="group relative px-10 py-5 rounded-2xl font-bold text-lg overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] animate-gradient-flow" />
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 blur-xl opacity-50 group-hover:opacity-80 transition-opacity" />
                  <span className="relative z-10 flex items-center gap-2 text-white">
                    Contact Us
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </Magnetic>

              <Magnetic strength={0.2}>
                <a
                  href={`https://wa.me/${COMPANY_INFO.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-10 py-5 rounded-2xl font-bold text-lg border-2 border-[#25D366]/50 text-[#25D366] hover:bg-[#25D366]/10 transition-all flex items-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </a>
              </Magnetic>
            </div>
          </ScrollFade>

          {/* Contact Info */}
          <ScrollFade delay={0.7}>
            <div className="flex flex-wrap items-center justify-center gap-8 text-slate-400">
              <a
                href={`tel:${COMPANY_INFO.phone}`}
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Phone className="w-5 h-5 text-blue-400" />
                {COMPANY_INFO.phone}
              </a>
              <a
                href={`mailto:${COMPANY_INFO.email}`}
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Mail className="w-5 h-5 text-blue-400" />
                {COMPANY_INFO.email}
              </a>
            </div>
          </ScrollFade>
        </div>
      </div>
    </section>
  )
}
