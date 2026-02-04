'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LightPillarProps {
  className?: string
  pillars?: number
  color?: string
  speed?: number
}

export function LightPillar({
  className,
  pillars = 5,
  color = '#3b82f6',
  speed = 3,
}: LightPillarProps) {
  // Pre-defined positions for consistent rendering (avoiding hydration issues)
  const pillarPositions = [
    { left: 10, width: 2, delay: 0, opacity: 0.3 },
    { left: 25, width: 3, delay: 0.5, opacity: 0.4 },
    { left: 45, width: 4, delay: 1, opacity: 0.5 },
    { left: 65, width: 3, delay: 1.5, opacity: 0.4 },
    { left: 85, width: 2, delay: 2, opacity: 0.3 },
    { left: 15, width: 1.5, delay: 0.3, opacity: 0.2 },
    { left: 35, width: 2.5, delay: 0.8, opacity: 0.35 },
    { left: 55, width: 3.5, delay: 1.3, opacity: 0.45 },
    { left: 75, width: 2, delay: 1.8, opacity: 0.3 },
    { left: 95, width: 1.5, delay: 2.2, opacity: 0.25 },
  ]

  const visiblePillars = pillarPositions.slice(0, Math.min(pillars, 10))

  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      {visiblePillars.map((pillar, index) => (
        <motion.div
          key={index}
          className="absolute top-0 h-full"
          style={{
            left: `${pillar.left}%`,
            width: `${pillar.width}%`,
          }}
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{
            opacity: [0, pillar.opacity, pillar.opacity, 0],
            scaleY: [0, 1, 1, 0],
          }}
          transition={{
            duration: speed,
            delay: pillar.delay,
            repeat: Infinity,
            repeatDelay: 1,
            ease: 'easeInOut',
          }}
        >
          {/* Main pillar glow */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, transparent 0%, ${color}40 20%, ${color}80 50%, ${color}40 80%, transparent 100%)`,
            }}
          />
          {/* Core bright line */}
          <div
            className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px]"
            style={{
              background: `linear-gradient(180deg, transparent 0%, ${color} 20%, white 50%, ${color} 80%, transparent 100%)`,
              boxShadow: `0 0 20px ${color}, 0 0 40px ${color}, 0 0 60px ${color}`,
            }}
          />
        </motion.div>
      ))}
    </div>
  )
}

// Aurora variant with horizontal waves
interface AuroraBackgroundProps {
  className?: string
  colors?: string[]
}

export function AuroraBackground({
  className,
  colors = ['#3b82f6', '#8b5cf6', '#06b6d4'],
}: AuroraBackgroundProps) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      {colors.map((color, index) => (
        <motion.div
          key={index}
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 50% at ${30 + index * 20}% ${20 + index * 15}%, ${color}30 0%, transparent 50%)`,
          }}
          animate={{
            x: ['-10%', '10%', '-10%'],
            y: ['-5%', '5%', '-5%'],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8 + index * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: index * 0.5,
          }}
        />
      ))}
    </div>
  )
}

// Grid with light effect
interface LightGridProps {
  className?: string
  color?: string
}

export function LightGrid({ className, color = '#3b82f6' }: LightGridProps) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      {/* Perspective grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(${color}20 1px, transparent 1px),
            linear-gradient(90deg, ${color}20 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: 'perspective(500px) rotateX(60deg)',
          transformOrigin: 'center top',
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 80%)',
        }}
      />
      {/* Moving light on grid */}
      <motion.div
        className="absolute top-0 left-1/2 w-40 h-full -translate-x-1/2"
        style={{
          background: `linear-gradient(180deg, ${color}60 0%, transparent 100%)`,
          filter: 'blur(40px)',
        }}
        animate={{
          x: ['-200%', '200%'],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  )
}

// Beam effect
interface BeamProps {
  className?: string
}

export function Beam({ className }: BeamProps) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-full"
        style={{
          background: 'linear-gradient(180deg, rgba(59,130,246,0.4) 0%, transparent 50%)',
          clipPath: 'polygon(40% 0%, 60% 0%, 80% 100%, 20% 100%)',
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
}
