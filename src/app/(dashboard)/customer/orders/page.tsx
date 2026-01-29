import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils/format'
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Eye,
  ShoppingBag,
  CreditCard,
  ShoppingCart
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Order {
  id: string
  order_number: string
  status: string
  payment_status: string
  total: number
  created_at: string
  order_items: { quantity: number }[]
}

async function getCustomerOrders() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: orders, error } = await (supabase as any)
    .from('orders')
    .select(`
      id,
      order_number,
      status,
      payment_status,
      total,
      created_at,
      order_items (quantity)
    `)
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
    return []
  }

  return orders as Order[]
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: <Clock className="h-3 w-3" /> },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <CheckCircle2 className="h-3 w-3" /> },
  processing: { label: 'Processing', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Package className="h-3 w-3" /> },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: <Truck className="h-3 w-3" /> },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle2 className="h-3 w-3" /> },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200', icon: <XCircle className="h-3 w-3" /> },
}

const paymentConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Unpaid', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  partial: { label: 'Partial', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-700 border-green-200' },
  refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-700 border-gray-200' },
}

export default async function CustomerOrdersPage() {
  const orders = await getCustomerOrders()

  if (orders === null) {
    redirect('/login')
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary rounded-xl">
              <ShoppingCart className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Orders</h1>
              <p className="text-muted-foreground">
                View and manage your orders
              </p>
            </div>
          </div>
          <Button asChild size="lg">
            <Link href="/products">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Browse Products
            </Link>
          </Button>
        </div>
      </div>

      {/* Orders Stats */}
      {orders.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-primary">{orders.length}</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-amber-600">
                {orders.filter(o => o.payment_status === 'pending').length}
              </p>
              <p className="text-sm text-muted-foreground">Pending Payment</p>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">
                {orders.filter(o => ['processing', 'shipped'].includes(o.status)).length}
              </p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-600">
                {orders.filter(o => o.status === 'delivered').length}
              </p>
              <p className="text-sm text-muted-foreground">Delivered</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card className="bg-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 bg-muted rounded-full mb-4">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              You haven&apos;t placed any orders yet. Start shopping to see your orders here.
            </p>
            <Button asChild size="lg">
              <Link href="/products">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Browse Products
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.pending
            const payment = paymentConfig[order.payment_status] || paymentConfig.pending
            const totalItems = order.order_items.reduce((sum, item) => sum + item.quantity, 0)

            return (
              <Card key={order.id} className="bg-card hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-bold text-lg">{order.order_number}</h3>
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
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDate(order.created_at)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {totalItems} item{totalItems !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Total</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(order.total)}</p>
                      </div>
                      <Button asChild>
                        <Link href={`/customer/orders/${order.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
