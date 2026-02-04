'use client'

import { ReactNode } from 'react'
import { InquiryProvider } from '@/lib/contexts/inquiry-context'
import { SessionProvider } from '@/components/auth/session-provider'
import { SmoothScrollProvider } from '@/components/ui/smooth-scroll'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <InquiryProvider>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </InquiryProvider>
    </SessionProvider>
  )
}

