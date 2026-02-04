'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlitchTextProps {
  text: string
  className?: string
}

export function GlitchText({ text, className }: GlitchTextProps) {
  return (
    <span
      className={cn('relative inline-block glitch-text', className)}
      data-text={text}
    >
      {text}
    </span>
  )
}

interface TypewriterTextProps {
  text: string
  className?: string
  speed?: number
  delay?: number
}

export function TypewriterText({ text, className, speed = 0.05, delay = 0 }: TypewriterTextProps) {
  return (
    <motion.span className={cn('inline-block', className)}>
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.1,
            delay: delay + index * speed,
          }}
          style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : 'normal' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
      <motion.span
        className="inline-block w-[3px] h-[1em] bg-current ml-1"
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
      />
    </motion.span>
  )
}

interface RevealTextProps {
  text: string
  className?: string
  delay?: number
}

export function RevealText({ text, className, delay = 0 }: RevealTextProps) {
  return (
    <span className={cn('relative inline-block overflow-hidden', className)}>
      <motion.span
        className="inline-block"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{
          duration: 0.8,
          delay,
          ease: [0.6, 0.01, 0.05, 0.95],
        }}
      >
        {text}
      </motion.span>
    </span>
  )
}

interface FlipTextProps {
  text: string
  className?: string
  delay?: number
}

export function FlipText({ text, className, delay = 0 }: FlipTextProps) {
  return (
    <span className={cn('inline-flex', className)}>
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          className="inline-block"
          initial={{ rotateX: -90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          transition={{
            duration: 0.6,
            delay: delay + index * 0.05,
            ease: [0.6, 0.01, 0.05, 0.95],
          }}
          style={{
            display: 'inline-block',
            whiteSpace: char === ' ' ? 'pre' : 'normal',
            transformStyle: 'preserve-3d',
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  )
}

interface WaveTextProps {
  text: string
  className?: string
  delay?: number
}

export function WaveText({ text, className, delay = 0 }: WaveTextProps) {
  return (
    <span className={cn('inline-flex', className)}>
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          className="inline-block"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 1.5,
            delay: delay + index * 0.1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : 'normal' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  )
}
