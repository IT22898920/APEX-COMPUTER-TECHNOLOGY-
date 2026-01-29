import Link from 'next/link'
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Boxes,
  FileText,
  UserPlus,
  PackagePlus,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatRelativeTime } from '@/lib/utils/format'
import { DashboardCharts } from './dashboard-charts'

export const dynamic = 'force-dynamic'

interface OrderData {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  total: number
  status: string
  payment_status: string
  created_at: string
}

interface ProductData {
  id: string
  name: string
  sku: string
  stock_quantity: number
  reorder_level: number
  price: number
}

async function getAdminDashboardData() {
  const supabase = await createClient()

  // Get date ranges
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

  // Get order stats
  const { count: totalOrders } = await (supabase as any)
    .from('orders')
    .select('*', { count: 'exact', head: true })

  const { count: pendingOrders } = await (supabase as any)
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { count: processingOrders } = await (supabase as any)
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .in('status', ['confirmed', 'processing', 'shipped'])

  const { count: completedOrders } = await (supabase as any)
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'delivered')

  // Get this month's revenue
  const { data: thisMonthOrders } = await (supabase as any)
    .from('orders')
    .select('total')
    .eq('payment_status', 'paid')
    .gte('created_at', monthStart.toISOString())

  const thisMonthRevenue = (thisMonthOrders || []).reduce((sum: number, o: { total: number }) => sum + o.total, 0)

  // Get last month's revenue for comparison
  const { data: lastMonthOrders } = await (supabase as any)
    .from('orders')
    .select('total')
    .eq('payment_status', 'paid')
    .gte('created_at', lastMonthStart.toISOString())
    .lt('created_at', monthStart.toISOString())

  const lastMonthRevenue = (lastMonthOrders || []).reduce((sum: number, o: { total: number }) => sum + o.total, 0)

  // Calculate revenue change percentage
  const revenueChange = lastMonthRevenue > 0
    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
    : thisMonthRevenue > 0 ? 100 : 0

  // Get today's orders
  const { count: todayOrders } = await (supabase as any)
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayStart.toISOString())

  // Get pending payments
  const { data: pendingPaymentOrders } = await (supabase as any)
    .from('orders')
    .select('total')
    .eq('payment_status', 'pending')

  const pendingPayments = (pendingPaymentOrders || []).reduce((sum: number, o: { total: number }) => sum + o.total, 0)

  // Get product stats
  const { count: totalProducts } = await (supabase as any)
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  // Get low stock products
  const { data: allProducts } = await (supabase as any)
    .from('products')
    .select('id, name, sku, stock_quantity, reorder_level, price')
    .eq('is_active', true)
    .order('stock_quantity', { ascending: true })

  const lowStockProducts = (allProducts || []).filter(
    (p: ProductData) => p.stock_quantity <= p.reorder_level
  ).slice(0, 5)

  const outOfStockCount = (allProducts || []).filter(
    (p: ProductData) => p.stock_quantity === 0
  ).length

  // Get customer stats
  const { count: totalCustomers } = await (supabase as any)
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'customer')

  const { count: newCustomersThisMonth } = await (supabase as any)
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'customer')
    .gte('created_at', monthStart.toISOString())

  // Get recent orders
  const { data: recentOrders } = await (supabase as any)
    .from('orders')
    .select('id, order_number, customer_name, customer_email, total, status, payment_status, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  // Get service count
  const { count: totalServices } = await (supabase as any)
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  // Get monthly revenue data for the last 6 months
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const revenueData = []

  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

    const { data: monthOrders } = await (supabase as any)
      .from('orders')
      .select('total, id')
      .eq('payment_status', 'paid')
      .gte('created_at', monthDate.toISOString())
      .lt('created_at', nextMonthDate.toISOString())

    const monthRevenue = (monthOrders || []).reduce((sum: number, o: { total: number }) => sum + o.total, 0)
    const monthOrderCount = (monthOrders || []).length

    revenueData.push({
      month: monthNames[monthDate.getMonth()],
      revenue: monthRevenue,
      orders: monthOrderCount,
    })
  }

  // Get order status counts for pie chart
  const { count: pendingCount } = await (supabase as any)
    .from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending')
  const { count: confirmedCount } = await (supabase as any)
    .from('orders').select('*', { count: 'exact', head: true }).eq('status', 'confirmed')
  const { count: processingCount } = await (supabase as any)
    .from('orders').select('*', { count: 'exact', head: true }).eq('status', 'processing')
  const { count: shippedCount } = await (supabase as any)
    .from('orders').select('*', { count: 'exact', head: true }).eq('status', 'shipped')
  const { count: deliveredCount } = await (supabase as any)
    .from('orders').select('*', { count: 'exact', head: true }).eq('status', 'delivered')
  const { count: cancelledCount } = await (supabase as any)
    .from('orders').select('*', { count: 'exact', head: true }).eq('status', 'cancelled')

  const orderStatusData = [
    { name: 'Pending', value: pendingCount || 0, color: '#9ca3af' },
    { name: 'Confirmed', value: confirmedCount || 0, color: '#3b82f6' },
    { name: 'Processing', value: processingCount || 0, color: '#f59e0b' },
    { name: 'Shipped', value: shippedCount || 0, color: '#8b5cf6' },
    { name: 'Delivered', value: deliveredCount || 0, color: '#22c55e' },
    { name: 'Cancelled', value: cancelledCount || 0, color: '#ef4444' },
  ]

  // Get daily orders for the last 7 days
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dailyOrdersData = []

  for (let i = 6; i >= 0; i--) {
    const dayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    const nextDayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1)

    const { data: dayOrders } = await (supabase as any)
      .from('orders')
      .select('total')
      .gte('created_at', dayDate.toISOString())
      .lt('created_at', nextDayDate.toISOString())

    const dayRevenue = (dayOrders || []).reduce((sum: number, o: { total: number }) => sum + o.total, 0)

    dailyOrdersData.push({
      day: dayNames[dayDate.getDay()],
      orders: (dayOrders || []).length,
      revenue: dayRevenue,
    })
  }

  return {
    stats: {
      totalOrders: totalOrders || 0,
      pendingOrders: pendingOrders || 0,
      processingOrders: processingOrders || 0,
      completedOrders: completedOrders || 0,
      todayOrders: todayOrders || 0,
      thisMonthRevenue,
      lastMonthRevenue,
      revenueChange,
      pendingPayments,
      totalProducts: totalProducts || 0,
      lowStockCount: lowStockProducts.length,
      outOfStockCount,
      totalCustomers: totalCustomers || 0,
      newCustomersThisMonth: newCustomersThisMonth || 0,
      totalServices: totalServices || 0,
    },
    recentOrders: (recentOrders || []) as OrderData[],
    lowStockProducts: lowStockProducts as ProductData[],
    chartData: {
      revenueData,
      orderStatusData,
      dailyOrdersData,
    },
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-gray-100 text-gray-700'
    case 'confirmed': return 'bg-blue-100 text-blue-700'
    case 'processing': return 'bg-amber-100 text-amber-700'
    case 'shipped': return 'bg-purple-100 text-purple-700'
    case 'delivered': return 'bg-green-100 text-green-700'
    case 'cancelled': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

const getPaymentColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-amber-100 text-amber-700'
    case 'partial': return 'bg-blue-100 text-blue-700'
    case 'paid': return 'bg-green-100 text-green-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

export default async function AdminDashboardPage() {
  const { stats, recentOrders, lowStockProducts, chartData } = await getAdminDashboardData()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your business.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/products/new">
              <PackagePlus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/admin/users/new">
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Revenue Card */}
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">This Month Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.thisMonthRevenue)}</div>
            <div className="flex items-center text-xs text-blue-100 mt-1">
              {stats.revenueChange >= 0 ? (
                <>
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>+{stats.revenueChange.toFixed(1)}% from last month</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                  <span>{stats.revenueChange.toFixed(1)}% from last month</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Orders Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.todayOrders} orders today
            </p>
          </CardContent>
        </Card>

        {/* Products Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalServices} services available
            </p>
          </CardContent>
        </Card>

        {/* Customers Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newCustomersThisMonth} this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Order Status Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className={stats.pendingOrders > 0 ? 'border-amber-300 bg-amber-50/50' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className={`h-4 w-4 ${stats.pendingOrders > 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.pendingOrders > 0 ? 'text-amber-600' : ''}`}>
              {stats.pendingOrders}
            </div>
            <Link href="/admin/orders?status=pending" className="text-xs text-primary hover:underline">
              View pending →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.processingOrders}</div>
            <Link href="/admin/orders?status=processing" className="text-xs text-primary hover:underline">
              View processing →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedOrders}</div>
            <Link href="/admin/orders?status=delivered" className="text-xs text-primary hover:underline">
              View completed →
            </Link>
          </CardContent>
        </Card>

        <Card className={stats.pendingPayments > 0 ? 'border-orange-300 bg-orange-50/50' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <DollarSign className={`h-4 w-4 ${stats.pendingPayments > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.pendingPayments > 0 ? 'text-orange-600' : ''}`}>
              {formatCurrency(stats.pendingPayments)}
            </div>
            <Link href="/admin/orders?payment=pending" className="text-xs text-primary hover:underline">
              View unpaid →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <DashboardCharts
        revenueData={chartData.revenueData}
        orderStatusData={chartData.orderStatusData}
        dailyOrdersData={chartData.dailyOrdersData}
      />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest customer orders</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/orders">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-medium">
                            #{order.order_number}
                          </span>
                          <Badge className={getStatusColor(order.status)} variant="secondary">
                            {order.status}
                          </Badge>
                          <Badge className={getPaymentColor(order.payment_status)} variant="secondary">
                            {order.payment_status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {order.customer_name || order.customer_email}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold">{formatCurrency(order.total)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(order.created_at)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Low Stock Alerts
                {stats.outOfStockCount > 0 && (
                  <Badge variant="destructive">{stats.outOfStockCount} out of stock</Badge>
                )}
              </CardTitle>
              <CardDescription>Products below reorder level</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/products">Manage</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Boxes className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>All products are well stocked</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/admin/products/${product.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          SKU: {product.sku}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <Badge
                          variant={product.stock_quantity === 0 ? 'destructive' : 'outline'}
                          className={product.stock_quantity === 0 ? '' : 'bg-amber-50 text-amber-700 border-amber-200'}
                        >
                          {product.stock_quantity === 0 ? 'Out of stock' : `${product.stock_quantity} left`}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Reorder at {product.reorder_level}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto py-4 justify-start" asChild>
              <Link href="/admin/orders">
                <ShoppingCart className="mr-3 h-5 w-5 text-blue-500" />
                <div className="text-left">
                  <p className="font-medium">Manage Orders</p>
                  <p className="text-xs text-muted-foreground">View and process orders</p>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 justify-start" asChild>
              <Link href="/admin/products">
                <Package className="mr-3 h-5 w-5 text-green-500" />
                <div className="text-left">
                  <p className="font-medium">Manage Products</p>
                  <p className="text-xs text-muted-foreground">Add and edit products</p>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 justify-start" asChild>
              <Link href="/admin/services">
                <FileText className="mr-3 h-5 w-5 text-purple-500" />
                <div className="text-left">
                  <p className="font-medium">Manage Services</p>
                  <p className="text-xs text-muted-foreground">Edit service offerings</p>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 justify-start" asChild>
              <Link href="/admin/users">
                <Users className="mr-3 h-5 w-5 text-orange-500" />
                <div className="text-left">
                  <p className="font-medium">Manage Users</p>
                  <p className="text-xs text-muted-foreground">Customers and staff</p>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
