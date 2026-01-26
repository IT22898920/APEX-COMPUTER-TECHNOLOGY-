'use client'

import { ReactNode } from 'react'
import { InquiryProvider } from '@/lib/contexts/inquiry-context'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return <InquiryProvider>{children}</InquiryProvider>
}
