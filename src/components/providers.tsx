'use client'

import { ReactNode } from 'react'
import { InquiryProvider } from '@/lib/contexts/inquiry-context'
import { SessionProvider } from '@/components/auth/session-provider'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <InquiryProvider>{children}</InquiryProvider>
    </SessionProvider>
  )
}

