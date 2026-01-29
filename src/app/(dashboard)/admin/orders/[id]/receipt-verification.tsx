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
  FileText,
  MessageCircle,
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
import { formatCurrency } from '@/lib/utils/format'
import { verifyReceipt, rejectReceipt } from './actions'

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
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [whatsAppData, setWhatsAppData] = useState<{
    phone: string
    message: string
    type: 'verified' | 'rejected'
  } | null>(null)

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const handleVerify = async () => {
    setIsVerifying(true)

    const result = await verifyReceipt({
      receiptId: receipt.id,
      orderId,
    })

    if (!result.success) {
      toast.error(result.error || 'Failed to verify receipt')
    } else {
      toast.success('Receipt verified! Email sent to customer.')

      // Show WhatsApp option if phone number exists
      if (result.customerPhone) {
        setWhatsAppData({
          phone: result.customerPhone.replace(/\D/g, ''),
          message: `Hi ${result.customerName}! Great news - your payment for order #${result.orderNumber} has been verified. Your order is now being processed. Thank you for shopping with APEX Computer Technology!`,
          type: 'verified',
        })
        setShowWhatsAppDialog(true)
      }

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

    const result = await rejectReceipt({
      receiptId: receipt.id,
      orderId,
      rejectionReason,
    })

    if (!result.success) {
      toast.error(result.error || 'Failed to reject receipt')
    } else {
      toast.success('Receipt rejected. Email sent to customer.')
      setShowRejectDialog(false)

      // Show WhatsApp option if phone number exists
      if (result.customerPhone) {
        setWhatsAppData({
          phone: result.customerPhone.replace(/\D/g, ''),
          message: `Hi ${result.customerName}, regarding your order #${result.orderNumber} - we couldn't verify your payment receipt. Reason: ${rejectionReason}. Please upload a clear receipt or contact us for assistance. - APEX Computer Technology`,
          type: 'rejected',
        })
        setShowWhatsAppDialog(true)
      }

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

        {/* Receipt Preview */}
        {receipt.receipt_url && (
          <a
            href={receipt.receipt_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            {receipt.receipt_url.toLowerCase().endsWith('.pdf') ? (
              <div className="w-full h-32 bg-muted rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-muted/80 transition-colors">
                <FileText className="h-12 w-12 text-red-500" />
                <span className="text-sm text-muted-foreground">Click to view PDF</span>
              </div>
            ) : (
              <img
                src={receipt.receipt_url}
                alt="Payment receipt"
                className="w-full max-h-48 object-contain bg-muted rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  target.parentElement!.innerHTML = `
                    <div class="w-full h-32 bg-muted rounded-lg flex flex-col items-center justify-center gap-2">
                      <svg class="h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      <span class="text-sm text-muted-foreground">Click to view file</span>
                    </div>
                  `
                }}
              />
            )}
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

      {/* WhatsApp Notification Dialog */}
      <Dialog open={showWhatsAppDialog} onOpenChange={setShowWhatsAppDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-[#25D366]" />
              Send WhatsApp Message?
            </DialogTitle>
            <DialogDescription>
              Email notification sent! Would you also like to notify the customer via WhatsApp?
            </DialogDescription>
          </DialogHeader>
          {whatsAppData && (
            <div className="bg-muted p-3 rounded-lg text-sm">
              <p className="text-muted-foreground mb-1">Message preview:</p>
              <p>{whatsAppData.message}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWhatsAppDialog(false)}>
              Skip
            </Button>
            <Button
              className="bg-[#25D366] hover:bg-[#128C7E]"
              onClick={() => {
                if (whatsAppData) {
                  window.open(
                    `https://wa.me/${whatsAppData.phone}?text=${encodeURIComponent(whatsAppData.message)}`,
                    '_blank'
                  )
                }
                setShowWhatsAppDialog(false)
              }}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Open WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
