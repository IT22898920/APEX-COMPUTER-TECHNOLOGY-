import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { Providers } from '@/components/providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Apex Computer Technology | Professional IT Solutions',
    template: '%s | Apex Computer Technology',
  },
  description:
    'Professional IT solutions for your business. Computer hardware maintenance, repairs, networking, and IT product sales with 2-3 hour guaranteed response time.',
  keywords: [
    'IT support',
    'computer repair',
    'networking',
    'IT services',
    'hardware maintenance',
    'Sri Lanka',
  ],
  authors: [{ name: 'Apex Computer Technology' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Apex Computer Technology',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
