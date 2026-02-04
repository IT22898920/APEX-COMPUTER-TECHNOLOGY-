'use client'

import { Player } from '@lottiefiles/react-lottie-player'
import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface LottieIconProps {
  src: string
  className?: string
  size?: number
  autoplay?: boolean
  loop?: boolean
  hover?: boolean
  speed?: number
}

export function LottieIcon({
  src,
  className,
  size = 48,
  autoplay = false,
  loop = false,
  hover = true,
  speed = 1,
}: LottieIconProps) {
  const playerRef = useRef<Player>(null)
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = () => {
    if (hover && playerRef.current) {
      setIsHovered(true)
      playerRef.current.play()
    }
  }

  const handleMouseLeave = () => {
    if (hover && playerRef.current) {
      setIsHovered(false)
      if (!loop) {
        playerRef.current.stop()
      }
    }
  }

  return (
    <div
      className={cn('inline-flex items-center justify-center', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Player
        ref={playerRef}
        src={src}
        style={{ width: size, height: size }}
        autoplay={autoplay}
        loop={loop || isHovered}
        speed={speed}
      />
    </div>
  )
}

// Pre-defined Lottie URLs for common tech icons
export const LOTTIE_ICONS = {
  // Tech & Computer
  computer: 'https://lottie.host/4db68bbd-31f6-4cd8-84eb-189571cf602c/U1S8IWfrJR.json',
  laptop: 'https://lottie.host/d5b59c11-5f9d-4b5e-8e1a-5e5f5b5e5f5e/laptop.json',
  settings: 'https://lottie.host/e5f5f5f5-5f5f-5f5f-5f5f-5f5f5f5f5f5f/settings.json',

  // Status & Actions
  success: 'https://lottie.host/3e5e5e5e-5e5e-5e5e-5e5e-5e5e5e5e5e5e/success.json',
  loading: 'https://lottie.host/2e2e2e2e-2e2e-2e2e-2e2e-2e2e2e2e2e2e/loading.json',

  // Communication
  support: 'https://lottie.host/1e1e1e1e-1e1e-1e1e-1e1e-1e1e1e1e1e1e/support.json',
  message: 'https://lottie.host/0e0e0e0e-0e0e-0e0e-0e0e-0e0e0e0e0e0e/message.json',
}
