'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, LogIn, Clock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface SessionExpiredModalProps {
  isOpen: boolean
  reason?: 'expired' | 'inactive' | 'signed_out'
  onClose?: () => void
}

export function SessionExpiredModal({ isOpen, reason = 'expired', onClose }: SessionExpiredModalProps) {
  const router = useRouter()
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    if (!isOpen) {
      setCountdown(10)
      return
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/login')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, router])

  const handleLogin = () => {
    onClose?.()
    router.push('/login')
  }

  const getMessage = () => {
    switch (reason) {
      case 'inactive':
        return {
          title: 'Session Timed Out',
          description: 'You have been logged out due to inactivity. Please log in again to continue.',
          icon: Clock,
        }
      case 'signed_out':
        return {
          title: 'Signed Out',
          description: 'You have been signed out. Please log in again to continue.',
          icon: LogIn,
        }
      default:
        return {
          title: 'Session Expired',
          description: 'Your session has expired for security reasons. Please log in again to continue.',
          icon: AlertTriangle,
        }
    }
  }

  const { title, description, icon: Icon } = getMessage()

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Icon className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription className="text-center">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 text-center">
          <p className="text-sm text-muted-foreground">
            Redirecting to login in{' '}
            <span className="font-bold text-foreground">{countdown}</span> seconds...
          </p>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button onClick={handleLogin} className="w-full sm:w-auto">
            <LogIn className="mr-2 h-4 w-4" />
            Log In Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
