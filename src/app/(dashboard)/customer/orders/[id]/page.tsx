import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils/format'
import { UploadReceiptForm } from './upload-receipt-form'
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  CreditCard,
  Receipt,
  AlertCircle,
  FileText,
  Calendar,
  Hash,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface OrderItem {
  id: string
  quantity: number
  unit_price: number
  total_price: number
  product: {
    id: string
    name: string
    sku: string
    image_url: string | null
  }
}

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

interface Order {
  id: string
  order_number: string
  status: string
  payment_status: string
  subtotal: number
  tax: number
  discount: number
  total: number
  notes: string | null
  created_at: string
  updated_at: string
  order_items: OrderItem[]
  payment_receipts: PaymentReceipt[]
}

async function getOrder(orderId: string, userId: string) {
  const supabase = await createClient()

  const { data, error } = await (supabase as any)
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        quantity,
        unit_price,
        total_price,
        product:products (id, name, sku, image_url)
      ),
      payment_receipts (
        id,
        receipt_url,
        amount,
        payment_date,
        bank_reference,
        status,
        rejection_reason,
        created_at
      )
    `)
    .eq('id', orderId)
    .eq('customer_id', userId)
    .single()

  if (error) {
    console.error('Error fetching order:', error)
    return null
  }

  return data as Order
}

async function getBankAccounts() {
  const supabase = await createClient()

  const { data } = await (supabase as any)
    .from('bank_accounts')
    .select('*')
    .eq('is_active', true)
    .order('is_primary', { ascending: false })
    .order('display_order', { ascending: true })

  return data || []
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-700', icon: <Clock className="h-4 w-4" /> },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700', icon: <CheckCircle2 className="h-4 w-4" /> },
  processing: { label: 'Processing', color: 'bg-amber-100 text-amber-700', icon: <Package className="h-4 w-4" /> },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-700', icon: <Truck className="h-4 w-4" /> },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="h-4 w-4" /> },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: <XCircle className="h-4 w-4" /> },
}

const paymentConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Unpaid', color: 'bg-amber-100 text-amber-700' },
  partial: { label: 'Partial', color: 'bg-blue-100 text-blue-700' },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-700' },
  refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-700' },
}

const receiptStatusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending Review', color: 'bg-amber-100 text-amber-700', icon: <Clock className="h-4 w-4" /> },
  verified: { label: 'Verified', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="h-4 w-4" /> },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: <XCircle className="h-4 w-4" /> },
}

export default async function CustomerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const [order, bankAccounts] = await Promise.all([
    getOrder(id, user.id),
    getBankAccounts(),
  ])

  if (!order) {
    notFound()
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatShortDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const status = statusConfig[order.status] || statusConfig.pending
  const payment = paymentConfig[order.payment_status] || paymentConfig.pending
  const canUploadReceipt = order.payment_status !== 'paid' && order.status !== 'cancelled'

  const totalItems = order.order_items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-6 md:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between">
            <Button variant="outline" size="sm" asChild>
              <Link href="/customer/orders">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Badge className={`${status.color} border`} variant="secondary">
                <span className="flex items-center gap-1">
                  {status.icon}
                  {status.label}
                </span>
              </Badge>
              <Badge className={`${payment.color} border`} variant="secondary">
                <CreditCard className="h-3 w-3 mr-1" />
                {payment.label}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{order.order_number}</h1>
              <p className="text-muted-foreground mt-1">
                Placed on {formatDate(order.created_at)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Order Total</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(order.total)}</p>
              <p className="text-sm text-muted-foreground">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Responsive Grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left Column - Order Items */}
        <div className="lg:col-span-3 space-y-6">
          {/* Order Items */}
          <Card className="bg-card">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>Order Items</CardTitle>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6 space-y-4">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="w-16 h-16 bg-background rounded-lg flex items-center justify-center shrink-0 overflow-hidden border">
                    {item.product.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      SKU: {item.product.sku}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity} × {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                  <p className="font-bold text-lg">{formatCurrency(item.total_price)}</p>
                </div>
              ))}

              <Separator className="my-4" />

              <div className="space-y-2 bg-muted/30 rounded-lg p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatCurrency(order.tax)}</span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-xl pt-2">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(order.total)}</span>
                </div>
              </div>

              {order.notes && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Your Notes:</p>
                  <p className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
                    {order.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Receipts */}
          <Card className="bg-card">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Receipt className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>Payment Receipts</CardTitle>
                    <CardDescription>
                      {order.payment_receipts.length} receipt(s) uploaded
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              {order.payment_receipts.length === 0 ? (
                <div className="text-center py-8 bg-muted/30 rounded-lg">
                  <div className="p-3 bg-muted rounded-full w-fit mx-auto mb-3">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium">No receipts uploaded yet</p>
                  {canUploadReceipt && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload your payment receipt using the form
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {order.payment_receipts.map((receipt) => {
                    const receiptStatus = receiptStatusConfig[receipt.status] || receiptStatusConfig.pending

                    return (
                      <div key={receipt.id} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <Badge className={`${receiptStatus.color} border`} variant="secondary">
                              <span className="flex items-center gap-1">
                                {receiptStatus.icon}
                                {receiptStatus.label}
                              </span>
                            </Badge>
                            <p className="text-sm text-muted-foreground">
                              Uploaded on {formatShortDate(receipt.created_at)}
                            </p>
                          </div>
                          <Button variant="default" size="sm" asChild>
                            <a href={receipt.receipt_url} target="_blank" rel="noopener noreferrer">
                              View Receipt
                            </a>
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {receipt.amount && (
                            <div className="p-2 bg-background rounded">
                              <p className="text-muted-foreground text-xs">Amount</p>
                              <p className="font-semibold">{formatCurrency(receipt.amount)}</p>
                            </div>
                          )}
                          {receipt.payment_date && (
                            <div className="p-2 bg-background rounded">
                              <p className="text-muted-foreground text-xs">Payment Date</p>
                              <p className="font-semibold">{formatShortDate(receipt.payment_date)}</p>
                            </div>
                          )}
                          {receipt.bank_reference && (
                            <div className="col-span-2 p-2 bg-background rounded">
                              <p className="text-muted-foreground text-xs">Bank Reference</p>
                              <p className="font-semibold font-mono">{receipt.bank_reference}</p>
                            </div>
                          )}
                        </div>

                        {receipt.status === 'rejected' && receipt.rejection_reason && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-red-700">Rejection Reason:</p>
                                <p className="text-sm text-red-600">{receipt.rejection_reason}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Actions & Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Receipt - Only show if payment pending */}
          {canUploadReceipt && (
            <Card className="border-primary bg-gradient-to-br from-primary/10 to-primary/5">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary">
                    <Receipt className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle>Upload Payment Receipt</CardTitle>
                    <CardDescription>
                      Confirm your payment
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <UploadReceiptForm orderId={order.id} orderTotal={order.total} />
              </CardContent>
            </Card>
          )}

          {/* Bank Accounts */}
          {canUploadReceipt && bankAccounts.length > 0 && (
            <Card className="bg-card">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Bank Account Details</CardTitle>
                    <CardDescription>
                      Transfer payment here
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6 space-y-4">
                {bankAccounts.map((account: any) => (
                  <div
                    key={account.id}
                    className={`p-4 rounded-lg border-2 ${
                      account.is_primary ? 'border-primary bg-primary/5' : 'border-muted bg-muted/30'
                    }`}
                  >
                    {account.is_primary && (
                      <Badge className="mb-2" variant="default">Primary</Badge>
                    )}
                    <p className="font-bold text-lg">{account.bank_name}</p>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between p-2 bg-background rounded">
                        <span className="text-muted-foreground">Account Name</span>
                        <span className="font-medium">{account.account_name}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-background rounded">
                        <span className="text-muted-foreground">Account No</span>
                        <span className="font-mono font-bold">{account.account_number}</span>
                      </div>
                      {account.branch && (
                        <div className="flex justify-between p-2 bg-background rounded">
                          <span className="text-muted-foreground">Branch</span>
                          <span className="font-medium">{account.branch}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Order Summary - Always show */}
          <Card className="bg-card">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Calendar className="h-5 w-5 text-amber-600" />
                </div>
                <CardTitle>Order Summary</CardTitle>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">Order Status</span>
                  <Badge className={`${status.color} border`} variant="secondary">
                    {status.label}
                  </Badge>
                </div>
                <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">Payment Status</span>
                  <Badge className={`${payment.color} border`} variant="secondary">
                    {payment.label}
                  </Badge>
                </div>
                <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">Total Items</span>
                  <span className="font-semibold">{totalItems}</span>
                </div>
                <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">{formatShortDate(order.created_at)}</span>
                </div>
                <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="font-medium">{formatShortDate(order.updated_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
