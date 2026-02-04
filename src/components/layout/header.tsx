'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  X,
  Phone,
  Mail,
  LogOut,
  LayoutDashboard,
  User,
  ShoppingBag,
  Home,
  Info,
  Wrench,
  Package,
  MessageCircle,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { COMPANY_INFO } from '@/lib/utils/constants'
import { useUser } from '@/lib/hooks/use-user'
import { getInitials } from '@/lib/utils/format'
import { InquiryBadge } from './inquiry-badge'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/about', label: 'About', icon: Info },
  { href: '/services', label: 'Services', icon: Wrench },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/contact', label: 'Contact', icon: MessageCircle },
]

function MagneticLink({
  href,
  children,
  className,
  onClick
}: {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    setPosition({ x: x * 0.3, y: y * 0.3 })
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      <motion.span
        animate={{ x: position.x, y: position.y }}
        transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
        className="inline-block"
      >
        {children}
      </motion.span>
    </Link>
  )
}

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, session, signOut, isAdmin, isStaff } = useUser()

  const isAuthenticated = !!session || !!user
  const dashboardUrl = isAdmin ? '/admin' : isStaff ? '/staff' : '/customer'

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Floating Navigation */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className={cn(
          'fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500',
          'px-3 py-2.5 rounded-2xl',
          scrolled
            ? 'bg-black/70 backdrop-blur-2xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_60px_rgba(59,130,246,0.1)]'
            : 'bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.3)]'
        )}
      >
        <div className="flex items-center gap-2">
          {/* Logo */}
          <Link href="/" className="flex items-center px-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex items-center gap-2"
            >
              <div className="relative">
                <div className="rounded-lg overflow-hidden bg-white/90 p-1">
                  <Image
                    src="/logo.png"
                    alt="APEX"
                    width={32}
                    height={32}
                    className="h-7 w-auto"
                    priority
                  />
                </div>
                <motion.div
                  className="absolute inset-0 bg-blue-500/40 blur-lg rounded-full -z-10"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <span className="hidden sm:block text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                APEX
              </span>
            </motion.div>
          </Link>

          {/* Separator */}
          <div className="hidden md:block w-px h-8 bg-white/20" />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <MagneticLink
                  href={item.href}
                  className="group relative px-3 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    <item.icon className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:text-blue-400 transition-all" />
                    {item.label}
                  </span>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 group-hover:w-1/2 transition-all duration-300 rounded-full" />
                </MagneticLink>
              </motion.div>
            ))}
          </nav>

          {/* Separator */}
          <div className="hidden md:block w-px h-8 bg-white/20" />

          {/* Right Actions */}
          <div className="flex items-center gap-2 px-2">
            {/* Inquiry Badge */}
            <InquiryBadge />

            {isAuthenticated ? (
              <>
                {(isAdmin || isStaff) && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href={dashboardUrl}
                      className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span className="hidden lg:inline">Dashboard</span>
                    </Link>
                  </motion.div>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="relative rounded-full p-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                    >
                      <Avatar className="h-8 w-8 border-2 border-black/50">
                        <AvatarImage src={session?.avatarUrl} />
                        <AvatarFallback className="bg-black/50 text-white text-xs">
                          {session?.fullName ? getInitials(session.fullName) : user?.email?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </motion.button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-black/90 backdrop-blur-xl border-white/10 text-white">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{session?.fullName || 'User'}</p>
                        <p className="text-xs text-white/60">{session?.email || user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    {(isAdmin || isStaff) && (
                      <DropdownMenuItem asChild className="hover:bg-white/10 focus:bg-white/10">
                        <Link href={dashboardUrl}>
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild className="hover:bg-white/10 focus:bg-white/10">
                      <Link href={`${dashboardUrl}/orders`}>
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="hover:bg-white/10 focus:bg-white/10">
                      <Link href={`${dashboardUrl}/profile`}>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem onClick={signOut} className="text-red-400 hover:bg-red-500/20 focus:bg-red-500/20">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hidden sm:block">
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all"
                  >
                    Login
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/login"
                    className="relative px-4 py-2 rounded-xl text-sm font-semibold text-white overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 group-hover:from-blue-400 group-hover:via-cyan-400 group-hover:to-blue-500 transition-all animate-gradient-flow bg-[length:200%_100%]" />
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 blur-lg opacity-40 group-hover:opacity-70 transition-opacity" />
                    <span className="absolute inset-[1px] rounded-[10px] bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Portal</span>
                    </span>
                  </Link>
                </motion.div>
              </>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 h-full w-[300px] bg-black/90 backdrop-blur-xl border-l border-white/10"
            >
              <div className="p-6 pt-20">
                {/* Navigation */}
                <nav className="space-y-2">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all"
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                <div className="my-6 h-px bg-white/10" />

                {/* Auth Actions */}
                {isAuthenticated ? (
                  <div className="space-y-2">
                    {(isAdmin || isStaff) && (
                      <Link
                        href={dashboardUrl}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all"
                      >
                        <LayoutDashboard className="w-5 h-5" />
                        <span className="font-medium">Dashboard</span>
                      </Link>
                    )}
                    <Link
                      href={`${dashboardUrl}/orders`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      <span className="font-medium">My Orders</span>
                    </Link>
                    <Link
                      href={`${dashboardUrl}/profile`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <User className="w-5 h-5" />
                      <span className="font-medium">Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        setIsOpen(false)
                        signOut()
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/20 transition-all"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Sign out</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium"
                  >
                    <Sparkles className="w-5 h-5" />
                    Customer Portal
                  </Link>
                )}

                <div className="my-6 h-px bg-white/10" />

                {/* Contact Info */}
                <div className="space-y-3 text-sm">
                  <a
                    href={`tel:${COMPANY_INFO.phone}`}
                    className="flex items-center gap-3 text-white/60 hover:text-white transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    {COMPANY_INFO.phone}
                  </a>
                  <a
                    href={`mailto:${COMPANY_INFO.email}`}
                    className="flex items-center gap-3 text-white/60 hover:text-white transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    {COMPANY_INFO.email}
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
