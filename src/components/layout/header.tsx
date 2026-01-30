'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, Phone, Mail, LogOut, LayoutDashboard, User, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PUBLIC_NAV_ITEMS, COMPANY_INFO } from '@/lib/utils/constants'
import { useUser } from '@/lib/hooks/use-user'
import { getInitials } from '@/lib/utils/format'
import { InquiryBadge } from './inquiry-badge'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, session, signOut, isAdmin, isStaff } = useUser()

  // Check if user is authenticated (either session or user exists)
  const isAuthenticated = !!session || !!user

  // Determine dashboard URL based on role
  const dashboardUrl = isAdmin ? '/admin' : isStaff ? '/staff' : '/customer'

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top bar */}
      <div className="hidden border-b bg-primary text-primary-foreground md:block">
        <div className="container flex h-10 items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <a href={`tel:${COMPANY_INFO.phone}`} className="flex items-center gap-2 hover:underline">
              <Phone className="h-4 w-4" />
              {COMPANY_INFO.phone}
            </a>
            <a href={`mailto:${COMPANY_INFO.email}`} className="flex items-center gap-2 hover:underline">
              <Mail className="h-4 w-4" />
              {COMPANY_INFO.email}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-primary-foreground/80">{COMPANY_INFO.emergencySupport}</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo-full.png"
            alt="APEX Computer Technology (Pvt) Ltd"
            width={200}
            height={50}
            className="h-10 w-auto hidden sm:block"
            priority
          />
          <Image
            src="/logo.png"
            alt="APEX"
            width={50}
            height={50}
            className="h-10 w-auto sm:hidden"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {PUBLIC_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {item.title}
            </Link>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-2">
          {/* Inquiry Badge */}
          <InquiryBadge />

          {isAuthenticated ? (
            <>
              {/* Dashboard button only for admin/staff */}
              {(isAdmin || isStaff) && (
                <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                  <Link href={dashboardUrl}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session?.avatarUrl} />
                      <AvatarFallback>
                        {session?.fullName ? getInitials(session.fullName) : user?.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{session?.fullName || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{session?.email || user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* Dashboard only for admin/staff */}
                  {(isAdmin || isStaff) && (
                    <DropdownMenuItem asChild>
                      <Link href={dashboardUrl}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href={`${dashboardUrl}/orders`}>
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`${dashboardUrl}/profile`}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/login">Customer Portal</Link>
              </Button>
            </>
          )}

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <nav className="flex flex-col gap-4 mt-8">
                {PUBLIC_NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {item.title}
                  </Link>
                ))}
                <hr className="my-4" />
                {isAuthenticated ? (
                  <>
                    {/* Dashboard only for admin/staff */}
                    {(isAdmin || isStaff) && (
                      <Button asChild className="w-full">
                        <Link href={dashboardUrl} onClick={() => setIsOpen(false)}>
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </Button>
                    )}
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`${dashboardUrl}/orders`} onClick={() => setIsOpen(false)}>
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        My Orders
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`${dashboardUrl}/profile`} onClick={() => setIsOpen(false)}>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full text-destructive"
                      onClick={() => {
                        setIsOpen(false)
                        signOut()
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </Button>
                  </>
                ) : (
                  <Button asChild className="w-full">
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      Customer Portal
                    </Link>
                  </Button>
                )}
              </nav>

              {/* Mobile contact info */}
              <div className="mt-8 space-y-3 text-sm text-muted-foreground">
                <a href={`tel:${COMPANY_INFO.phone}`} className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {COMPANY_INFO.phone}
                </a>
                <a href={`mailto:${COMPANY_INFO.email}`} className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {COMPANY_INFO.email}
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
