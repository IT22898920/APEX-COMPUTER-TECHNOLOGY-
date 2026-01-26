import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle2,
  Building2,
  Copy,
  Upload,
  ChevronRight,
  Phone,
  MessageCircle,
  ArrowLeft,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils/format'
import { COMPANY_INFO } from '@/lib/utils/constants'
import { UploadReceiptForm } from './upload-receipt-form'
import { CopyButton } from './copy-button'

interface OrderItem {
  id: string
  quantity: number
  unit_price: number
  total_price: number
  product: {
    name: string
    sku: string
    image_url: string | null
  }
}

interface Order {
  id: string
  order_number: string
  customer_id: string
  customer_name: string
  customer_email: string
  status: string
  subtotal: number
  total: number
  payment_status: string
  notes: string | null
  created_at: string
  order_items: OrderItem[]
}

interface BankAccount {
  id: string
  bank_name: string
  account_name: string
  account_number: string
  branch: string | null
  is_primary: boolean
}

async function getOrder(id: string): Promise<Order | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await (supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        quantity,
        unit_price,
        total_price,
        product:products (name, sku, image_url)
      )
    `)
    .eq('id', id)
    .eq('customer_id', user.id)
    .single() as any)

  if (error) {
    console.error('Error fetching order:', error)
    return null
  }

  return data as Order
}

async function getBankAccounts(): Promise<BankAccount[]> {
  const supabase = await createClient()

  const { data, error } = await (supabase
    .from('bank_accounts')
    .select('id, bank_name, account_name, account_number, branch, is_primary')
    .eq('is_active', true)
    .order('is_primary', { ascending: false })
    .order('display_order', { ascending: true }) as any)

  if (error) {
    console.error('Error fetching bank accounts:', error)
    return []
  }

  return data || []
}

async function getExistingReceipts(orderId: string) {
  const supabase = await createClient()

  const { data } = await (supabase
    .from('payment_receipts')
    .select('id, receipt_url, amount, status, created_at')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false }) as any)

  return data || []
}

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await getOrder(id)

  if (!order) {
    notFound()
  }

  const bankAccounts = await getBankAccounts()
  const existingReceipts = await getExistingReceipts(id)

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      <div className="container py-8 px-4 max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/customer" className="hover:text-foreground transition-colors">
            My Account
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Order Confirmation</span>
        </nav>

        {/* Success Banner */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardContent className="flex items-center gap-4 py-6">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-green-800">Order Placed Successfully!</h1>
              <p className="text-green-700">
                Order #{order.order_number} • {formatDate(order.created_at)}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>
                  {order.order_items.length} item(s) • Total: {formatCurrency(order.total)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                      {item.product.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl text-muted-foreground">📦</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        SKU: {item.product.sku} • Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">{formatCurrency(item.total_price)}</p>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(order.total)}</span>
                  </div>
                </div>

                {order.notes && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium mb-1">Your Notes:</p>
                      <p className="text-sm text-muted-foreground">{order.notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Bank Account Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Payment Details
                </CardTitle>
                <CardDescription>
                  Please transfer the amount to one of our bank accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {bankAccounts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Payment details will be shared shortly. Please contact us for more information.
                  </p>
                ) : (
                  bankAccounts.map((account) => (
                    <div
                      key={account.id}
                      className={`p-4 rounded-lg border ${
                        account.is_primary ? 'border-primary bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{account.bank_name}</span>
                          {account.is_primary && (
                            <Badge variant="default" className="text-xs">Primary</Badge>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Account Name:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{account.account_name}</span>
                            <CopyButton text={account.account_name} />
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Account Number:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium">{account.account_number}</span>
                            <CopyButton text={account.account_number} />
                          </div>
                        </div>
                        {account.branch && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Branch:</span>
                            <span className="font-medium">{account.branch}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    <strong>Important:</strong> Please include your order number{' '}
                    <span className="font-mono font-bold">{order.order_number}</span> as the payment
                    reference when making the transfer.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Upload Receipt */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Payment Receipt
                </CardTitle>
                <CardDescription>
                  After making the payment, upload your receipt for verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UploadReceiptForm orderId={order.id} orderTotal={order.total} />

                {existingReceipts.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Uploaded Receipts</h4>
                    <div className="space-y-2">
                      {existingReceipts.map((receipt: any) => (
                        <div
                          key={receipt.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">🧾</span>
                            <div>
                              <p className="text-sm font-medium">
                                {receipt.amount ? formatCurrency(receipt.amount) : 'Amount not specified'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(receipt.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={
                              receipt.status === 'verified'
                                ? 'default'
                                : receipt.status === 'rejected'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {receipt.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Order Status</span>
                  <Badge variant="secondary" className="capitalize">
                    {order.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Payment Status</span>
                  <Badge
                    variant={order.payment_status === 'paid' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {order.payment_status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Need Help */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={`tel:${COMPANY_INFO.phone}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    {COMPANY_INFO.phone}
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-[#25D366]/10 border-[#25D366] text-[#128C7E]"
                  asChild
                >
                  <a
                    href={`https://wa.me/${COMPANY_INFO.whatsapp}?text=Hi! I have a question about my order ${order.order_number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    WhatsApp Support
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/customer">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go to My Account
                </Link>
              </Button>
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
