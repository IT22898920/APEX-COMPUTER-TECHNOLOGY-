'use client'

import { useRef, useEffect, useState, ReactNode } from 'react'
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion'
import { cn } from '@/lib/utils'

// Scroll-triggered fade in with direction
interface ScrollFadeProps {
  children: ReactNode
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right'
  delay?: number
  duration?: number
  distance?: number
  once?: boolean
}

export function ScrollFade({
  children,
  className,
  direction = 'up',
  delay = 0,
  duration = 0.8,
  distance = 60,
  once = true
}: ScrollFadeProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once, margin: '-100px' })

  const directions = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 }
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directions[direction] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...directions[direction] }}
      transition={{ duration, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Parallax scroll effect
interface ParallaxProps {
  children: ReactNode
  className?: string
  speed?: number
  direction?: 'up' | 'down'
}

export function Parallax({ children, className, speed = 0.5, direction = 'up' }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  })

  const factor = direction === 'up' ? -1 : 1
  const y = useTransform(scrollYProgress, [0, 1], [100 * speed * factor, -100 * speed * factor])
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 })

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <motion.div style={{ y: smoothY }}>{children}</motion.div>
    </div>
  )
}

// Text reveal animation (word by word)
interface TextRevealProps {
  text: string
  className?: string
  delay?: number
  staggerDelay?: number
}

export function TextReveal({ text, className, delay = 0, staggerDelay = 0.05 }: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const words = text.split(' ')

  return (
    <div ref={ref} className={cn('flex flex-wrap', className)}>
      {words.map((word, i) => (
        <span key={i} className="overflow-hidden mr-[0.25em]">
          <motion.span
            className="inline-block"
            initial={{ y: '100%', opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 }}
            transition={{
              duration: 0.6,
              delay: delay + i * staggerDelay,
              ease: [0.25, 0.4, 0.25, 1]
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </div>
  )
}

// Character reveal animation
interface CharRevealProps {
  text: string
  className?: string
  delay?: number
  staggerDelay?: number
}

export function CharReveal({ text, className, delay = 0, staggerDelay = 0.03 }: CharRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <div ref={ref} className={cn('inline-flex flex-wrap', className)}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 50, rotateX: -90 }}
          animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 50, rotateX: -90 }}
          transition={{
            duration: 0.5,
            delay: delay + i * staggerDelay,
            ease: [0.25, 0.4, 0.25, 1]
          }}
          style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : 'normal' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </div>
  )
}

// Scale on scroll
interface ScaleOnScrollProps {
  children: ReactNode
  className?: string
  scaleStart?: number
  scaleEnd?: number
}

export function ScaleOnScroll({ children, className, scaleStart = 0.8, scaleEnd = 1 }: ScaleOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center']
  })

  const scale = useTransform(scrollYProgress, [0, 1], [scaleStart, scaleEnd])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1])
  const smoothScale = useSpring(scale, { stiffness: 100, damping: 30 })
  const smoothOpacity = useSpring(opacity, { stiffness: 100, damping: 30 })

  return (
    <motion.div ref={ref} style={{ scale: smoothScale, opacity: smoothOpacity }} className={className}>
      {children}
    </motion.div>
  )
}

// Horizontal scroll section
interface HorizontalScrollProps {
  children: ReactNode
  className?: string
}

export function HorizontalScroll({ children, className }: HorizontalScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  })

  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-75%'])
  const smoothX = useSpring(x, { stiffness: 100, damping: 30 })

  return (
    <div ref={containerRef} className={cn('relative h-[300vh]', className)}>
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <motion.div style={{ x: smoothX }} className="flex gap-8">
          {children}
        </motion.div>
      </div>
    </div>
  )
}

// Stagger children animation
interface StaggerContainerProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
  once?: boolean
}

export function StaggerContainer({ children, className, staggerDelay = 0.1, once = true }: StaggerContainerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once, margin: '-100px' })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] } }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Rotate on scroll
interface RotateOnScrollProps {
  children: ReactNode
  className?: string
  rotateStart?: number
  rotateEnd?: number
}

export function RotateOnScroll({ children, className, rotateStart = -10, rotateEnd = 0 }: RotateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center']
  })

  const rotate = useTransform(scrollYProgress, [0, 1], [rotateStart, rotateEnd])
  const smoothRotate = useSpring(rotate, { stiffness: 100, damping: 30 })

  return (
    <motion.div ref={ref} style={{ rotateZ: smoothRotate }} className={className}>
      {children}
    </motion.div>
  )
}

// Blur on scroll
interface BlurOnScrollProps {
  children: ReactNode
  className?: string
}

export function BlurOnScroll({ children, className }: BlurOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center']
  })

  const blur = useTransform(scrollYProgress, [0, 1], [10, 0])
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])

  const [blurValue, setBlurValue] = useState(10)
  const [opacityValue, setOpacityValue] = useState(0)

  useEffect(() => {
    const unsubBlur = blur.on('change', setBlurValue)
    const unsubOpacity = opacity.on('change', setOpacityValue)
    return () => {
      unsubBlur()
      unsubOpacity()
    }
  }, [blur, opacity])

  return (
    <div
      ref={ref}
      style={{
        filter: `blur(${blurValue}px)`,
        opacity: opacityValue
      }}
      className={cn('transition-[filter,opacity] duration-100', className)}
    >
      {children}
    </div>
  )
}

// Marquee/Infinite scroll
interface MarqueeProps {
  children: ReactNode
  className?: string
  speed?: number
  direction?: 'left' | 'right'
  pauseOnHover?: boolean
}

export function Marquee({ children, className, speed = 30, direction = 'left', pauseOnHover = true }: MarqueeProps) {
  return (
    <div className={cn('overflow-hidden', className)}>
      <motion.div
        className={cn('flex gap-8', pauseOnHover && 'hover:[animation-play-state:paused]')}
        animate={{ x: direction === 'left' ? '-50%' : '50%' }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: 'linear'
        }}
        style={{ width: 'fit-content' }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  )
}

// Progress indicator
export function ScrollProgress({ className }: { className?: string }) {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  return (
    <motion.div
      style={{ scaleX }}
      className={cn(
        'fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 origin-left z-[100]',
        className
      )}
    />
  )
}

// Magnetic hover effect
interface MagneticProps {
  children: ReactNode
  className?: string
  strength?: number
}

export function Magnetic({ children, className, strength = 0.3 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    setPosition({ x: x * strength, y: y * strength })
  }

  const handleMouseLeave = () => setPosition({ x: 0, y: 0 })

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
