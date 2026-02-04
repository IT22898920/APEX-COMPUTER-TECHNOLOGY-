'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface ShimmerButtonProps {
  children: ReactNode
  className?: string
  shimmerColor?: string
  shimmerSize?: string
  borderRadius?: string
  shimmerDuration?: string
  background?: string
  onClick?: () => void
}

// Shimmer Button - Uiverse style
export function ShimmerButton({
  children,
  className,
  shimmerColor = '#ffffff',
  shimmerSize = '0.1em',
  borderRadius = '100px',
  shimmerDuration = '2s',
  background = 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
  onClick,
}: ShimmerButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative cursor-pointer overflow-hidden whitespace-nowrap px-8 py-4 text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_8px_rgba(59,130,246,0.4)]',
        className
      )}
      style={{
        borderRadius,
        background,
      }}
    >
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ borderRadius }}
      >
        <div
          className="absolute inset-[-100%] animate-[shimmer_2s_infinite]"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${shimmerColor}40 50%, transparent 100%)`,
          }}
        />
      </div>
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  )
}

// Glow Button
interface GlowButtonProps {
  children: ReactNode
  className?: string
  glowColor?: string
  onClick?: () => void
}

export function GlowButton({
  children,
  className,
  glowColor = 'rgba(59, 130, 246, 0.5)',
  onClick,
}: GlowButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'relative px-8 py-4 rounded-full bg-slate-900 text-white font-semibold overflow-hidden group',
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at center, ${glowColor} 0%, transparent 70%)`,
          filter: 'blur(20px)',
        }}
      />

      {/* Border gradient */}
      <div className="absolute inset-0 rounded-full p-[2px] bg-gradient-to-r from-primary via-purple-500 to-cyan-500">
        <div className="h-full w-full rounded-full bg-slate-900" />
      </div>

      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}

// Pulse Button
interface PulseButtonProps {
  children: ReactNode
  className?: string
  pulseColor?: string
  onClick?: () => void
}

export function PulseButton({
  children,
  className,
  pulseColor = 'rgba(59, 130, 246, 0.6)',
  onClick,
}: PulseButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'relative px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white font-semibold',
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Pulse rings */}
      <span
        className="absolute inset-0 rounded-xl animate-ping opacity-20"
        style={{ background: pulseColor }}
      />
      <span
        className="absolute inset-0 rounded-xl animate-ping opacity-10"
        style={{ background: pulseColor, animationDelay: '0.5s' }}
      />

      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}

// Liquid Button
interface LiquidButtonProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function LiquidButton({ children, className, onClick }: LiquidButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'relative px-10 py-4 rounded-full bg-transparent border-2 border-primary text-primary font-semibold overflow-hidden group',
        className
      )}
      whileHover="hover"
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute inset-0 bg-primary"
        initial={{ y: '100%' }}
        variants={{
          hover: { y: 0 },
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      />
      <span className="relative z-10 group-hover:text-white transition-colors duration-300">
        {children}
      </span>
    </motion.button>
  )
}

// Neon Button
interface NeonButtonProps {
  children: ReactNode
  className?: string
  color?: string
  onClick?: () => void
}

export function NeonButton({
  children,
  className,
  color = '#3b82f6',
  onClick,
}: NeonButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'relative px-8 py-4 rounded-lg bg-transparent font-semibold transition-all duration-300',
        className
      )}
      style={{
        color,
        border: `2px solid ${color}`,
        textShadow: `0 0 10px ${color}, 0 0 20px ${color}, 0 0 40px ${color}`,
        boxShadow: `0 0 10px ${color}40, inset 0 0 10px ${color}20`,
      }}
      whileHover={{
        boxShadow: `0 0 20px ${color}60, 0 0 40px ${color}40, inset 0 0 20px ${color}30`,
        textShadow: `0 0 20px ${color}, 0 0 40px ${color}, 0 0 80px ${color}`,
      }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  )
}

// 3D Button
interface Button3DProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function Button3D({ children, className, onClick }: Button3DProps) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'relative px-8 py-4 rounded-xl bg-gradient-to-b from-primary to-blue-700 text-white font-bold shadow-[0_6px_0_0_#1e40af,0_8px_10px_rgba(0,0,0,0.3)] active:shadow-[0_2px_0_0_#1e40af,0_4px_6px_rgba(0,0,0,0.2)] active:translate-y-1 transition-all duration-100',
        className
      )}
    >
      {children}
    </motion.button>
  )
}
