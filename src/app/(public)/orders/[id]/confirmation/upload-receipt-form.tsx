'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Loader2, X, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { uploadPaymentReceipt } from '@/app/(public)/inquiry/actions'
import { formatCurrency } from '@/lib/utils/format'

interface UploadReceiptFormProps {
  orderId: string
  orderTotal: number
}

export function UploadReceiptForm({ orderId, orderTotal }: UploadReceiptFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    amount: orderTotal.toString(),
    paymentDate: new Date().toISOString().split('T')[0],
    bankReference: '',
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        toast.error('Please select an image or PDF file')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }

      setSelectedFile(file)

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreviewUrl(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setPreviewUrl(null)
      }
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      toast.error('Please select a file to upload')
      return
    }

    setIsUploading(true)

    try {
      const data = new FormData()
      data.append('file', selectedFile)
      data.append('orderId', orderId)
      data.append('amount', formData.amount)
      data.append('paymentDate', formData.paymentDate)
      data.append('bankReference', formData.bankReference)

      const result = await uploadPaymentReceipt(data)

      if (result.success) {
        toast.success('Receipt uploaded successfully', {
          description: 'We will verify your payment shortly',
        })
        clearFile()
        setFormData({
          amount: orderTotal.toString(),
          paymentDate: new Date().toISOString().split('T')[0],
          bankReference: '',
        })
        router.refresh()
      } else {
        toast.error('Failed to upload receipt', {
          description: result.error,
        })
      }
    } catch (error) {
      toast.error('Something went wrong', {
        description: 'Please try again',
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* File Upload Area */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileSelect}
          className="hidden"
          id="receipt-file"
        />

        {selectedFile ? (
          <div className="relative border-2 border-dashed border-primary/50 rounded-lg p-4 bg-primary/5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={clearFile}
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-4">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Receipt preview"
                  className="w-20 h-20 object-cover rounded-lg"
                />
              ) : (
                <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div>
                <p className="font-medium truncate max-w-[200px]">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          </div>
        ) : (
          <label
            htmlFor="receipt-file"
            className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:border-primary/50 transition-colors"
          >
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="font-medium">Click to upload receipt</p>
            <p className="text-sm text-muted-foreground">
              PNG, JPG, or PDF (max 5MB)
            </p>
          </label>
        )}
      </div>

      {/* Payment Details */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount Paid</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder={formatCurrency(orderTotal)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="paymentDate">Payment Date</Label>
          <Input
            id="paymentDate"
            type="date"
            value={formData.paymentDate}
            onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bankReference">Bank Reference / Transaction ID (optional)</Label>
        <Input
          id="bankReference"
          value={formData.bankReference}
          onChange={(e) => setFormData({ ...formData, bankReference: e.target.value })}
          placeholder="e.g., TXN123456789"
        />
      </div>

      <Button type="submit" className="w-full" disabled={!selectedFile || isUploading}>
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload Receipt
          </>
        )}
      </Button>
    </form>
  )
}
