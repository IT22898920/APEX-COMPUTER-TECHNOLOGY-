'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FloatingElementProps {
  children: ReactNode
  className?: string
  duration?: number
  delay?: number
  yOffset?: number
  xOffset?: number
  rotation?: number
}

export function FloatingElement({
  children,
  className,
  duration = 6,
  delay = 0,
  yOffset = 20,
  xOffset = 0,
  rotation = 0,
}: FloatingElementProps) {
  return (
    <motion.div
      className={cn(className)}
      animate={{
        y: [-yOffset, yOffset, -yOffset],
        x: [-xOffset, xOffset, -xOffset],
        rotate: [-rotation, rotation, -rotation],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  )
}

// Orbiting element around a center point
interface OrbitingElementProps {
  children: ReactNode
  className?: string
  duration?: number
  radius?: number
  delay?: number
  reverse?: boolean
}

export function OrbitingElement({
  children,
  className,
  duration = 20,
  radius = 100,
  delay = 0,
  reverse = false,
}: OrbitingElementProps) {
  return (
    <motion.div
      className={cn('absolute', className)}
      animate={{
        rotate: reverse ? -360 : 360,
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{
        transformOrigin: `calc(50% + ${radius}px) 50%`,
      }}
    >
      <motion.div
        animate={{
          rotate: reverse ? 360 : -360,
        }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

// Pulsing element
interface PulsingElementProps {
  children: ReactNode
  className?: string
  duration?: number
  scale?: number
}

export function PulsingElement({
  children,
  className,
  duration = 2,
  scale = 1.1,
}: PulsingElementProps) {
  return (
    <motion.div
      className={cn(className)}
      animate={{
        scale: [1, scale, 1],
        opacity: [0.7, 1, 0.7],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  )
}

// Morphing blob background
interface MorphingBlobProps {
  className?: string
  color?: string
  size?: number
  duration?: number
}

export function MorphingBlob({
  className,
  color = 'rgba(59, 130, 246, 0.3)',
  size = 400,
  duration = 8,
}: MorphingBlobProps) {
  return (
    <motion.div
      className={cn('absolute rounded-full blur-[80px]', className)}
      style={{
        width: size,
        height: size,
        background: color,
      }}
      animate={{
        borderRadius: [
          '60% 40% 30% 70% / 60% 30% 70% 40%',
          '30% 60% 70% 40% / 50% 60% 30% 60%',
          '60% 40% 30% 70% / 60% 30% 70% 40%',
        ],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

// Gradient orb with animation
interface GradientOrbProps {
  className?: string
  colors?: string[]
  size?: number
  blur?: number
  duration?: number
}

export function GradientOrb({
  className,
  colors = ['#3b82f6', '#8b5cf6', '#06b6d4'],
  size = 300,
  blur = 100,
  duration = 10,
}: GradientOrbProps) {
  return (
    <motion.div
      className={cn('absolute rounded-full', className)}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${colors.join(', ')})`,
        filter: `blur(${blur}px)`,
      }}
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 180, 360],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

// Grid of floating dots
interface FloatingDotsProps {
  className?: string
  count?: number
  color?: string
}

// Pre-computed dot positions to avoid hydration mismatch
const generateDots = (count: number) => {
  // Use a seeded approach with fixed positions based on index
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: ((i * 37 + 13) % 100), // Pseudo-random but deterministic
    y: ((i * 53 + 7) % 100),
    size: 2 + (i % 4),
    duration: 4 + (i % 4),
    delay: (i % 20) * 0.1,
  }))
}

export function FloatingDots({
  className,
  count = 20,
  color = 'rgba(59, 130, 246, 0.5)',
}: FloatingDotsProps) {
  // Use useMemo with empty deps to ensure consistent values
  const dots = generateDots(count)

  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      {dots.map((dot) => (
        <motion.div
          key={dot.id}
          className="absolute rounded-full"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: dot.size,
            height: dot.size,
            background: color,
          }}
          animate={{
            y: [-20, 20, -20],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: dot.duration,
            delay: dot.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// Noise/grain overlay
export function NoiseOverlay({ className, opacity = 0.03 }: { className?: string; opacity?: number }) {
  return (
    <div
      className={cn('absolute inset-0 pointer-events-none', className)}
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }}
    />
  )
}
