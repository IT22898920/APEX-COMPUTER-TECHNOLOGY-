import Link from 'next/link'
import { ShoppingCart, Clock, CheckCircle2, XCircle, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { OrdersTable } from './orders-table'

export const dynamic = 'force-dynamic'

interface Order {
  id: string
  order_number: string
  customer_id: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  status: string
  subtotal: number
  total: number
  payment_status: string
  created_at: string
  payment_receipts: { id: string; status: string }[]
}

async function getOrders() {
  const supabase = await createClient()

  const { data, error } = await (supabase
    .from('orders')
    .select(`
      id,
      order_number,
      customer_id,
      customer_name,
      customer_email,
      customer_phone,
      status,
      subtotal,
      total,
      payment_status,
      created_at,
      payment_receipts (id, status)
    `)
    .order('created_at', { ascending: false }) as any)

  if (error) {
    console.error('Error fetching orders:', error)
    return []
  }

  return data as Order[]
}

export default async function AdminOrdersPage() {
  const orders = await getOrders()

  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const completedOrders = orders.filter(o => o.status === 'delivered').length
  const pendingPayments = orders.filter(o => o.payment_status === 'pending').length
  const pendingReceipts = orders.filter(o =>
    o.payment_receipts?.some(r => r.status === 'pending')
  ).length

  const totalRevenue = orders
    .filter(o => o.payment_status === 'paid')
    .reduce((sum, o) => sum + o.total, 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage customer orders and payment receipts
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>
        <Card className={pendingOrders > 0 ? 'border-amber-500' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${pendingOrders > 0 ? 'text-amber-500' : ''}`}>
              {pendingOrders}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedOrders}</div>
          </CardContent>
        </Card>
        <Card className={pendingReceipts > 0 ? 'border-blue-500' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receipts to Verify</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${pendingReceipts > 0 ? 'text-blue-500' : ''}`}>
              {pendingReceipts}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue (Paid)</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">
              LKR {totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <OrdersTable orders={orders} />
    </div>
  )
}
