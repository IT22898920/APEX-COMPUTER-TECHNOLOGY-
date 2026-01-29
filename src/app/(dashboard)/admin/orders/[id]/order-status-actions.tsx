'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, FileText, Eye } from 'lucide-react'
import Link from 'next/link'
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
import { updateOrderStatus, sendInvoiceEmail } from './actions'

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
  const [isSendingInvoice, setIsSendingInvoice] = useState(false)

  const handleUpdate = async () => {
    setIsUpdating(true)

    const hasStatusChange = status !== currentStatus
    const hasPaymentChange = paymentStatus !== currentPaymentStatus

    if (!hasStatusChange && !hasPaymentChange) {
      toast.info('No changes to save')
      setIsUpdating(false)
      return
    }

    const result = await updateOrderStatus({
      orderId,
      status: hasStatusChange ? status : undefined,
      paymentStatus: hasPaymentChange ? paymentStatus : undefined,
    })

    if (!result.success) {
      toast.error('Failed to update order', { description: result.error })
    } else {
      toast.success('Order updated successfully')
      router.refresh()
    }

    setIsUpdating(false)
  }

  const hasChanges = status !== currentStatus || paymentStatus !== currentPaymentStatus

  const handleSendInvoice = async () => {
    setIsSendingInvoice(true)

    const result = await sendInvoiceEmail(orderId)

    if (!result.success) {
      toast.error('Failed to send invoice', { description: result.error })
    } else {
      toast.success('Invoice sent!', {
        description: `Invoice sent to ${result.customerEmail}`,
      })
    }

    setIsSendingInvoice(false)
  }

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

      <Separator />

      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Invoice</p>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link href={`/admin/orders/${orderId}/invoice`} target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              View
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendInvoice}
            disabled={isSendingInvoice}
          >
            {isSendingInvoice ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Send
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
