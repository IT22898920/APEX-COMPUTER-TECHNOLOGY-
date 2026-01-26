'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Loader2,
  Calendar,
  Hash,
  DollarSign,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils/format'

interface PaymentReceipt {
  id: string
  receipt_url: string
  amount: number | null
  payment_date: string | null
  bank_reference: string | null
  status: string
  rejection_reason: string | null
  created_at: string
}

interface ReceiptVerificationProps {
  receipt: PaymentReceipt
  orderId: string
}

export function ReceiptVerification({ receipt, orderId }: ReceiptVerificationProps) {
  const router = useRouter()
  const [isVerifying, setIsVerifying] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const handleVerify = async () => {
    setIsVerifying(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await (supabase as any)
      .from('payment_receipts')
      .update({
        status: 'verified',
        verified_by: user?.id,
        verified_at: new Date().toISOString(),
      })
      .eq('id', receipt.id)

    if (error) {
      toast.error('Failed to verify receipt')
    } else {
      toast.success('Receipt verified successfully')

      // Update order payment status to paid
      await (supabase as any)
        .from('orders')
        .update({ payment_status: 'paid' })
        .eq('id', orderId)

      router.refresh()
    }

    setIsVerifying(false)
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }

    setIsRejecting(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await (supabase as any)
      .from('payment_receipts')
      .update({
        status: 'rejected',
        rejection_reason: rejectionReason,
        verified_by: user?.id,
        verified_at: new Date().toISOString(),
      })
      .eq('id', receipt.id)

    if (error) {
      toast.error('Failed to reject receipt')
    } else {
      toast.success('Receipt rejected')
      setShowRejectDialog(false)
      router.refresh()
    }

    setIsRejecting(false)
  }

  const getStatusBadge = () => {
    switch (receipt.status) {
      case 'verified':
        return (
          <Badge className="bg-green-100 text-green-700 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Verified
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-700 gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge className="bg-amber-100 text-amber-700 gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        )
    }
  }

  return (
    <>
      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              <span className="text-sm text-muted-foreground">
                Uploaded {formatDate(receipt.created_at)}
              </span>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href={receipt.receipt_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-1" />
              View
            </a>
          </Button>
        </div>

        {/* Receipt Image Preview */}
        {receipt.receipt_url && (
          <a
            href={receipt.receipt_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <img
              src={receipt.receipt_url}
              alt="Payment receipt"
              className="w-full max-h-48 object-contain bg-muted rounded-lg"
            />
          </a>
        )}

        {/* Receipt Details */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>{receipt.amount ? formatCurrency(receipt.amount) : 'N/A'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{receipt.payment_date ? formatDate(receipt.payment_date) : 'N/A'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{receipt.bank_reference || 'N/A'}</span>
          </div>
        </div>

        {/* Rejection Reason */}
        {receipt.status === 'rejected' && receipt.rejection_reason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">
              <strong>Rejection reason:</strong> {receipt.rejection_reason}
            </p>
          </div>
        )}

        {/* Actions for pending receipts */}
        {receipt.status === 'pending' && (
          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={handleVerify}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Verify
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => setShowRejectDialog(true)}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </div>
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Receipt</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this receipt. The customer will be notified.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isRejecting || !rejectionReason.trim()}
            >
              {isRejecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Reject Receipt'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
