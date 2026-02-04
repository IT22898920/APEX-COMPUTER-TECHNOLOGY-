'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AnimatedCounterProps {
  value: number
  direction?: 'up' | 'down'
  duration?: number
  delay?: number
  className?: string
  suffix?: string
  prefix?: string
  decimalPlaces?: number
}

export function AnimatedCounter({
  value,
  direction = 'up',
  duration = 2,
  delay = 0,
  className,
  suffix = '',
  prefix = '',
  decimalPlaces = 0,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [hasAnimated, setHasAnimated] = useState(false)

  const spring = useSpring(direction === 'up' ? 0 : value, {
    damping: 30,
    stiffness: 100,
    duration: duration * 1000,
  })

  const display = useTransform(spring, (current) =>
    Math.round(current * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces)
  )

  const [displayValue, setDisplayValue] = useState(direction === 'up' ? 0 : value)

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setTimeout(() => {
        spring.set(direction === 'up' ? value : 0)
        setHasAnimated(true)
      }, delay * 1000)
    }
  }, [isInView, hasAnimated, spring, value, direction, delay])

  useEffect(() => {
    const unsubscribe = display.on('change', (latest) => {
      setDisplayValue(latest)
    })
    return () => unsubscribe()
  }, [display])

  return (
    <motion.span
      ref={ref}
      className={cn('tabular-nums', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay }}
    >
      {prefix}
      {decimalPlaces > 0 ? displayValue.toFixed(decimalPlaces) : Math.round(displayValue)}
      {suffix}
    </motion.span>
  )
}
