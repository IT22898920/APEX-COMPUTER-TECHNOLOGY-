'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useInquiry } from '@/lib/contexts/inquiry-context'
import { useUser } from '@/lib/hooks/use-user'

export function InquiryBadge() {
  const { totalItems } = useInquiry()
  const { user, session } = useUser()

  const isAuthenticated = !!session || !!user

  return (
    <Button variant="ghost" size="icon" asChild className="relative">
      <Link href={isAuthenticated ? '/inquiry' : '/login'}>
        <ShoppingCart className="h-5 w-5" />
        {isAuthenticated && totalItems > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {totalItems > 99 ? '99+' : totalItems}
          </span>
        )}
        <span className="sr-only">
          {isAuthenticated ? `View inquiry list (${totalItems} items)` : 'Login to view inquiry list'}
        </span>
      </Link>
    </Button>
  )
}
