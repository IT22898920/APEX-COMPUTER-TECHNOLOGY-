import { format, formatDistanceToNow, parseISO, differenceInMinutes } from 'date-fns'
import { CURRENCY } from './constants'

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(CURRENCY.locale, {
    style: 'currency',
    currency: CURRENCY.code,
    minimumFractionDigits: 2,
  }).format(amount)
}

// Format currency short (without decimals for large amounts)
export function formatCurrencyShort(amount: number): string {
  if (amount >= 1000000) {
    return `${CURRENCY.symbol} ${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `${CURRENCY.symbol} ${(amount / 1000).toFixed(1)}K`
  }
  return formatCurrency(amount)
}

// Format date
export function formatDate(date: string | Date, formatStr: string = 'MMM d, yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, formatStr)
}

// Format date and time
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy h:mm a')
}

// Format time only
export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'h:mm a')
}

// Format relative time (e.g., "2 hours ago")
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

// Format SLA countdown
export function formatSLATime(deadline: string | Date): {
  text: string
  isOverdue: boolean
  isWarning: boolean
  minutesRemaining: number
} {
  const d = typeof deadline === 'string' ? parseISO(deadline) : deadline
  const now = new Date()
  const minutesRemaining = differenceInMinutes(d, now)

  if (minutesRemaining <= 0) {
    return {
      text: 'OVERDUE',
      isOverdue: true,
      isWarning: false,
      minutesRemaining,
    }
  }

  if (minutesRemaining <= 30) {
    return {
      text: `${minutesRemaining}m left`,
      isOverdue: false,
      isWarning: true,
      minutesRemaining,
    }
  }

  const hours = Math.floor(minutesRemaining / 60)
  const mins = minutesRemaining % 60

  if (hours > 0) {
    return {
      text: `${hours}h ${mins}m left`,
      isOverdue: false,
      isWarning: false,
      minutesRemaining,
    }
  }

  return {
    text: `${mins}m left`,
    isOverdue: false,
    isWarning: false,
    minutesRemaining,
  }
}

// Format phone number
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '')

  // Format Sri Lankan phone numbers
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
  }

  if (cleaned.length === 9) {
    return `0${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`
  }

  return phone
}

// Format ticket number for display
export function formatTicketNumber(ticketNumber: string): string {
  return ticketNumber.toUpperCase()
}

// Format order number for display
export function formatOrderNumber(orderNumber: string): string {
  return orderNumber.toUpperCase()
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// Generate initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Pluralize word
export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural || `${singular}s`)
}
