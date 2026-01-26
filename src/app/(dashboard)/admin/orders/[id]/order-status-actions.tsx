'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface OrderStatusActionsProps {
  orderId: string
  currentStatus: string
  currentPaymentStatus: string
}

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'partial', label: 'Partial' },
  { value: 'paid', label: 'Paid' },
  { value: 'refunded', label: 'Refunded' },
]

export function OrderStatusActions({
  orderId,
  currentStatus,
  currentPaymentStatus,
}: OrderStatusActionsProps) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdate = async () => {
    setIsUpdating(true)

    const supabase = createClient()

    const updates: Record<string, string> = {}
    if (status !== currentStatus) updates.status = status
    if (paymentStatus !== currentPaymentStatus) updates.payment_status = paymentStatus

    if (Object.keys(updates).length === 0) {
      toast.info('No changes to save')
      setIsUpdating(false)
      return
    }

    const { error } = await (supabase as any)
      .from('orders')
      .update(updates)
      .eq('id', orderId)

    if (error) {
      toast.error('Failed to update order', { description: error.message })
    } else {
      toast.success('Order updated successfully')
      router.refresh()
    }

    setIsUpdating(false)
  }

  const hasChanges = status !== currentStatus || paymentStatus !== currentPaymentStatus

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Order Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Payment Status</Label>
        <Select value={paymentStatus} onValueChange={setPaymentStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <Button
        className="w-full"
        onClick={handleUpdate}
        disabled={!hasChanges || isUpdating}
      >
        {isUpdating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          'Save Changes'
        )}
      </Button>
    </div>
  )
}
