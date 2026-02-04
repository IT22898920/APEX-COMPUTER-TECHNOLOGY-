'use client'

import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface DockItemProps {
  href: string
  icon?: React.ReactNode
  label: string
  isActive?: boolean
  onClick?: () => void
}

function DockItem({ href, icon, label, isActive, onClick }: DockItemProps) {
  const ref = useRef<HTMLAnchorElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const mouseX = useMotionValue(Infinity)
  const mouseY = useMotionValue(Infinity)

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
    return val - bounds.x - bounds.width / 2
  })

  const scale = useTransform(distance, [-100, 0, 100], [1, 1.2, 1])
  const springScale = useSpring(scale, { mass: 0.1, stiffness: 150, damping: 12 })

  return (
    <motion.div
      style={{ scale: springScale }}
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
    >
      <Link
        ref={ref}
        href={href}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300',
          'hover:bg-white/20 hover:text-white',
          isActive
            ? 'text-white bg-white/15'
            : 'text-white/80'
        )}
      >
        {icon && <span className="w-5 h-5">{icon}</span>}
        <span>{label}</span>

        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 10,
            scale: isHovered ? 1 : 0.8
          }}
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-lg text-xs text-white whitespace-nowrap pointer-events-none"
        >
          {label}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/80 rotate-45" />
        </motion.div>

        {/* Active indicator */}
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white"
          />
        )}
      </Link>
    </motion.div>
  )
}

interface DockProps {
  items: {
    href: string
    label: string
    icon?: React.ReactNode
  }[]
  activeItem?: string
  className?: string
  onItemClick?: () => void
}

export function Dock({ items, activeItem, className, onItemClick }: DockProps) {
  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.2 }}
      className={cn(
        'flex items-center gap-1 px-4 py-2 rounded-2xl',
        'bg-white/10 backdrop-blur-xl border border-white/20',
        'shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
        className
      )}
    >
      {items.map((item) => (
        <DockItem
          key={item.href}
          href={item.href}
          label={item.label}
          icon={item.icon}
          isActive={activeItem === item.href}
          onClick={onItemClick}
        />
      ))}
    </motion.nav>
  )
}

// Floating Dock variant (fixed at top)
interface FloatingDockProps extends DockProps {
  logo?: React.ReactNode
  rightContent?: React.ReactNode
}

export function FloatingDock({ items, activeItem, logo, rightContent, className, onItemClick }: FloatingDockProps) {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className={cn(
        'fixed top-4 left-1/2 -translate-x-1/2 z-50',
        'flex items-center gap-4 px-6 py-3 rounded-2xl',
        'bg-black/40 backdrop-blur-xl border border-white/10',
        'shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]',
        className
      )}
    >
      {logo && (
        <div className="flex items-center pr-4 border-r border-white/20">
          {logo}
        </div>
      )}

      <nav className="flex items-center gap-1">
        {items.map((item) => (
          <DockItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            isActive={activeItem === item.href}
            onClick={onItemClick}
          />
        ))}
      </nav>

      {rightContent && (
        <div className="flex items-center pl-4 border-l border-white/20">
          {rightContent}
        </div>
      )}
    </motion.header>
  )
}
