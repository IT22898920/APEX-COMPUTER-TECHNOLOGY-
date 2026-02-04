'use client'

import { motion, useInView, Variants } from 'framer-motion'
import { useRef } from 'react'
import { cn } from '@/lib/utils'

interface SplitTextProps {
  text: string
  className?: string
  delay?: number
  duration?: number
  type?: 'chars' | 'words'
  animation?: 'fadeUp' | 'fadeIn' | 'slideUp' | 'blur' | 'scale'
}

const animations: Record<string, { hidden: Variants['hidden']; visible: Variants['visible'] }> = {
  fadeUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideUp: {
    hidden: { opacity: 0, y: 100, rotateX: -90 },
    visible: { opacity: 1, y: 0, rotateX: 0 },
  },
  blur: {
    hidden: { opacity: 0, filter: 'blur(10px)' },
    visible: { opacity: 1, filter: 'blur(0px)' },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { opacity: 1, scale: 1 },
  },
}

export function SplitText({
  text,
  className,
  delay = 0,
  duration = 0.05,
  type = 'chars',
  animation = 'fadeUp',
}: SplitTextProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const items = type === 'chars' ? text.split('') : text.split(' ')
  const { hidden, visible } = animations[animation]

  return (
    <motion.span
      ref={ref}
      className={cn('inline-flex flex-wrap', className)}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {items.map((item, index) => (
        <motion.span
          key={index}
          className={type === 'words' ? 'mr-2' : ''}
          variants={{
            hidden,
            visible: {
              ...visible,
              transition: {
                duration: 0.5,
                delay: delay + index * duration,
                ease: [0.215, 0.61, 0.355, 1],
              },
            },
          }}
          style={{ display: 'inline-block', whiteSpace: item === ' ' ? 'pre' : 'normal' }}
        >
          {item === ' ' ? '\u00A0' : item}
        </motion.span>
      ))}
    </motion.span>
  )
}
