'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface TextShimmerProps {
  children: React.ReactNode
  className?: string
  shimmerWidth?: number
  duration?: number
}

export function TextShimmer({
  children,
  className,
  shimmerWidth = 100,
  duration = 2,
}: TextShimmerProps) {
  return (
    <motion.span
      className={cn(
        'relative inline-block bg-clip-text text-transparent',
        'bg-[length:200%_100%]',
        'bg-gradient-to-r from-primary via-white to-primary',
        className
      )}
      initial={{ backgroundPosition: '100% 0' }}
      animate={{ backgroundPosition: '-100% 0' }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {children}
    </motion.span>
  )
}

interface GlowingTextProps {
  children: React.ReactNode
  className?: string
  glowColor?: string
}

export function GlowingText({
  children,
  className,
  glowColor = 'rgba(59, 130, 246, 0.5)',
}: GlowingTextProps) {
  return (
    <span
      className={cn('relative inline-block', className)}
      style={{
        textShadow: `0 0 20px ${glowColor}, 0 0 40px ${glowColor}, 0 0 60px ${glowColor}`,
      }}
    >
      {children}
    </span>
  )
}
