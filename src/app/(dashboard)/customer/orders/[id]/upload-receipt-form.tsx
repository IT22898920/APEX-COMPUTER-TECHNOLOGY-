'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Upload, X, FileText, Image as ImageIcon } from 'lucide-react'
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
  const [preview, setPreview] = useState<string | null>(null)
  const [amount, setAmount] = useState(orderTotal.toString())
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [bankReference, setBankReference] = useState('')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload JPG, PNG, WebP, or PDF.')
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 10MB.')
      return
    }

    setSelectedFile(file)

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      toast.error('Please select a receipt file')
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('orderId', orderId)
      formData.append('amount', amount)
      formData.append('paymentDate', paymentDate)
      formData.append('bankReference', bankReference)

      const result = await uploadPaymentReceipt(formData)

      if (result.success) {
        toast.success('Receipt uploaded successfully! We will verify it shortly.')
        clearFile()
        setAmount(orderTotal.toString())
        setBankReference('')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to upload receipt')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* File Upload */}
      <div className="space-y-2">
        <Label>Receipt File *</Label>
        {!selectedFile ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Click to upload</p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG, WebP or PDF (max 10MB)
            </p>
          </div>
        ) : (
          <div className="border rounded-lg p-4 relative">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={clearFile}
            >
              <X className="h-4 w-4" />
            </Button>
            {preview ? (
              <img
                src={preview}
                alt="Receipt preview"
                className="max-h-32 mx-auto rounded"
              />
            ) : (
              <div className="flex items-center gap-3">
                <FileText className="h-10 w-10 text-red-500" />
                <div>
                  <p className="font-medium text-sm">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">Amount Paid</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={formatCurrency(orderTotal)}
        />
        <p className="text-xs text-muted-foreground">
          Order total: {formatCurrency(orderTotal)}
        </p>
      </div>

      {/* Payment Date */}
      <div className="space-y-2">
        <Label htmlFor="paymentDate">Payment Date</Label>
        <Input
          id="paymentDate"
          type="date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
        />
      </div>

      {/* Bank Reference */}
      <div className="space-y-2">
        <Label htmlFor="bankReference">Bank Reference (Optional)</Label>
        <Input
          id="bankReference"
          value={bankReference}
          onChange={(e) => setBankReference(e.target.value)}
          placeholder="Transaction ID or reference number"
        />
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" disabled={isUploading || !selectedFile}>
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
