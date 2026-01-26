'use client'

import { MessageCircle } from 'lucide-react'
import { COMPANY_INFO } from '@/lib/utils/constants'

export function WhatsAppButton() {
  const message = encodeURIComponent(
    "Hi! I'm interested in your products and services. Please provide more information."
  )

  return (
    <a
      href={`https://wa.me/${COMPANY_INFO.whatsapp}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="hidden sm:inline font-medium">Chat with us</span>

      {/* Pulse animation */}
      <span className="absolute -top-1 -right-1 h-4 w-4">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex h-4 w-4 rounded-full bg-green-500" />
      </span>
    </a>
  )
}
