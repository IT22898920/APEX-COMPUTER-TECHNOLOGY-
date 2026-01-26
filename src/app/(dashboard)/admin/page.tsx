import Link from 'next/link'
import {
  Ticket,
  Users,
  Package,
  ShoppingCart,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { formatRelativeTime, formatTicketNumber } from '@/lib/utils/format'
import { TICKET_STATUSES, TICKET_PRIORITIES } from '@/lib/utils/constants'

export const dynamic = 'force-dynamic'

// Type for ticket with relations
interface TicketWithRelations {
  id: string
  ticket_number: string
  title: string
  status: string
  priority: string
  created_at: string
  customer: { full_name: string; company_name?: string } | null
  technician: { full_name: string } | null
}

// Type for product
interface ProductData {
  id: string
  name: string
  sku: string
  stock_quantity: number
  reorder_level: number
}

async function getAdminDashboardData() {
  const supabase = await createClient()

  // Get ticket stats
  const { count: openTickets } = await supabase
    .from('service_tickets')
    .select('*', { count: 'exact', head: true })
    .in('status', ['pending', 'assigned'])

  const { count: inProgressTickets } = await supabase
    .from('service_tickets')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'in_progress')

  const { data: slaAtRiskTickets } = await supabase
    .from('service_tickets')
    .select('*')
    .eq('sla_breached', false)
    .in('status', ['pending', 'assigned', 'in_progress'])
    .lt('sla_deadline', new Date(Date.now() + 30 * 60 * 1000).toISOString())

  // Get today's resolved tickets
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { count: resolvedToday } = await supabase
    .from('service_tickets')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'resolved')
    .gte('resolved_at', today.toISOString())

  // Get recent tickets
  const { data: recentTickets } = await supabase
    .from('service_tickets')
    .select(`
      *,
      customer:profiles!service_tickets_customer_id_fkey(full_name, company_name),
      technician:profiles!service_tickets_assigned_to_fkey(full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get low stock products - products where stock_quantity <= reorder_level
  const { data: lowStockData } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('stock_quantity', { ascending: true })
    .limit(10)

  // Filter to only show items at or below reorder level
  const filteredLowStock = (lowStockData || []).filter(
    (p: { stock_quantity: number; reorder_level: number }) =>
      p.stock_quantity <= p.reorder_level
  ).slice(0, 5)

  // Get pending orders
  const { count: pendingOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  // Get total customers
  const { count: totalCustomers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'customer')
    .eq('is_active', true)

  return {
    stats: {
      openTickets: openTickets || 0,
      inProgressTickets: inProgressTickets || 0,
      slaAtRisk: slaAtRiskTickets?.length || 0,
      resolvedToday: resolvedToday || 0,
      pendingOrders: pendingOrders || 0,
      totalCustomers: totalCustomers || 0,
    },
    recentTickets: (recentTickets || []) as TicketWithRelations[],
    lowStockProducts: filteredLowStock as ProductData[],
  }
}

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData()
  const { stats, recentTickets, lowStockProducts } = data

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your business operations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openTickets}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting assignment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgressTickets}</div>
            <p className="text-xs text-muted-foreground">
              Being worked on
            </p>
          </CardContent>
        </Card>

        <Card className={stats.slaAtRisk > 0 ? 'border-amber-500' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA At Risk</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${stats.slaAtRisk > 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.slaAtRisk > 0 ? 'text-amber-500' : ''}`}>
              {stats.slaAtRisk}
            </div>
            <p className="text-xs text-muted-foreground">
              Deadline within 30min
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolvedToday}</div>
            <p className="text-xs text-muted-foreground">
              Tickets completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <Link href="/admin/orders" className="text-xs text-primary hover:underline">
              View orders
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockProducts.length}</div>
            <Link href="/staff/inventory" className="text-xs text-primary hover:underline">
              View inventory
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <Link href="/admin/users" className="text-xs text-primary hover:underline">
              Manage users
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Tickets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Tickets</CardTitle>
              <CardDescription>Latest service requests</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/tickets">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentTickets.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">
                No recent tickets
              </p>
            ) : (
              <div className="space-y-4">
                {recentTickets.map((ticket) => {
                  const status = TICKET_STATUSES[ticket.status as keyof typeof TICKET_STATUSES]
                  const priority = TICKET_PRIORITIES[ticket.priority as keyof typeof TICKET_PRIORITIES]
                  const customer = ticket.customer as { full_name: string; company_name?: string } | null

                  return (
                    <Link
                      key={ticket.id}
                      href={`/admin/tickets/${ticket.id}`}
                      className="block"
                    >
                      <div className="flex items-start justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-muted-foreground">
                              {formatTicketNumber(ticket.ticket_number)}
                            </span>
                            <Badge className={priority.color} variant="secondary">
                              {priority.label}
                            </Badge>
                          </div>
                          <p className="font-medium truncate">{ticket.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {customer?.company_name || customer?.full_name} &bull; {formatRelativeTime(ticket.created_at)}
                          </p>
                        </div>
                        <Badge className={status.color}>
                          {status.label}
                        </Badge>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Low Stock Alerts</CardTitle>
              <CardDescription>Products below reorder level</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/staff/inventory">Manage</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">
                All products are well stocked
              </p>
            ) : (
              <div className="space-y-4">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        SKU: {product.sku}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={product.stock_quantity === 0 ? 'destructive' : 'outline'}
                        className={product.stock_quantity === 0 ? '' : 'bg-amber-50 text-amber-700 border-amber-200'}
                      >
                        {product.stock_quantity} left
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Reorder at {product.reorder_level}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
