import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Ticket,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Package,
  ShoppingCart,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { formatRelativeTime, formatTicketNumber } from '@/lib/utils/format'
import { TICKET_STATUSES, TICKET_PRIORITIES } from '@/lib/utils/constants'

export const dynamic = 'force-dynamic'

// Types
interface ProfileData {
  id: string
  full_name: string
  role: string
  staff_type: string | null
}

interface TicketWithCustomer {
  id: string
  ticket_number: string
  title: string
  status: string
  priority: string
  sla_deadline: string
  customer: { full_name: string; company_name?: string } | null
}

async function getStaffDashboardData() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Get staff profile
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const profile = profileData as ProfileData | null
  if (!profile || profile.role !== 'staff') return null

  const staffType = profile.staff_type

  // Technician data
  let assignedTickets: TicketWithCustomer[] = []
  let ticketStats = { assigned: 0, inProgress: 0, slaAtRisk: 0, completedToday: 0 }

  if (staffType === 'technician' || staffType === 'support') {
    const { data: tickets } = await supabase
      .from('service_tickets')
      .select(`
        *,
        customer:profiles!service_tickets_customer_id_fkey(full_name, company_name)
      `)
      .eq('assigned_to', user.id)
      .in('status', ['assigned', 'in_progress', 'on_hold'])
      .order('sla_deadline', { ascending: true })
      .limit(10)

    assignedTickets = (tickets || []) as TicketWithCustomer[]

    const { count: assigned } = await supabase
      .from('service_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', user.id)
      .eq('status', 'assigned')

    const { count: inProgress } = await supabase
      .from('service_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', user.id)
      .eq('status', 'in_progress')

    const { data: slaRisk } = await supabase
      .from('service_tickets')
      .select('id')
      .eq('assigned_to', user.id)
      .in('status', ['assigned', 'in_progress'])
      .eq('sla_breached', false)
      .lt('sla_deadline', new Date(Date.now() + 30 * 60 * 1000).toISOString())

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count: completed } = await supabase
      .from('service_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', user.id)
      .in('status', ['resolved', 'closed'])
      .gte('resolved_at', today.toISOString())

    ticketStats = {
      assigned: assigned || 0,
      inProgress: inProgress || 0,
      slaAtRisk: slaRisk?.length || 0,
      completedToday: completed || 0,
    }
  }

  // Marketing data
  let orderStats = { pending: 0, processing: 0, lowStock: 0 }

  if (staffType === 'marketing' || staffType === 'support') {
    const { count: pending } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    const { count: processing } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'processing')

    const { data: lowStockData } = await supabase
      .from('products')
      .select('id, stock_quantity, reorder_level')
      .eq('is_active', true)

    const lowStockCount = (lowStockData || []).filter(
      (p: { stock_quantity: number; reorder_level: number }) =>
        p.stock_quantity <= p.reorder_level
    ).length

    orderStats = {
      pending: pending || 0,
      processing: processing || 0,
      lowStock: lowStockCount,
    }
  }

  return {
    profile: profile as ProfileData,
    staffType,
    assignedTickets: assignedTickets as TicketWithCustomer[],
    ticketStats,
    orderStats,
  }
}

export default async function StaffDashboardPage() {
  const data = await getStaffDashboardData()

  if (!data) {
    redirect('/login')
  }

  const { profile, staffType, assignedTickets, ticketStats, orderStats } = data
  const isTechnician = staffType === 'technician' || staffType === 'support'
  const isMarketing = staffType === 'marketing' || staffType === 'support'

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome, {profile.full_name}
        </h1>
        <p className="text-muted-foreground capitalize">
          {staffType} Dashboard
        </p>
      </div>

      {/* Technician Stats */}
      {isTechnician && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assigned</CardTitle>
                <Ticket className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ticketStats.assigned}</div>
                <p className="text-xs text-muted-foreground">
                  Waiting to start
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ticketStats.inProgress}</div>
                <p className="text-xs text-muted-foreground">
                  Currently working
                </p>
              </CardContent>
            </Card>

            <Card className={ticketStats.slaAtRisk > 0 ? 'border-amber-500' : ''}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">SLA At Risk</CardTitle>
                <AlertTriangle className={`h-4 w-4 ${ticketStats.slaAtRisk > 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${ticketStats.slaAtRisk > 0 ? 'text-amber-500' : ''}`}>
                  {ticketStats.slaAtRisk}
                </div>
                <p className="text-xs text-muted-foreground">
                  Act now!
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ticketStats.completedToday}</div>
                <p className="text-xs text-muted-foreground">
                  Great work!
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Assigned Tickets */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Tickets</CardTitle>
                <CardDescription>Tickets assigned to you</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/staff/tickets">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {assignedTickets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No tickets assigned to you</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignedTickets.map((ticket) => {
                    const status = TICKET_STATUSES[ticket.status as keyof typeof TICKET_STATUSES]
                    const priority = TICKET_PRIORITIES[ticket.priority as keyof typeof TICKET_PRIORITIES]
                    const customer = ticket.customer as { full_name: string; company_name?: string } | null

                    // Calculate SLA status
                    const slaDeadline = new Date(ticket.sla_deadline)
                    const now = new Date()
                    const minutesLeft = Math.floor((slaDeadline.getTime() - now.getTime()) / 60000)
                    const isOverdue = minutesLeft < 0
                    const isWarning = minutesLeft > 0 && minutesLeft <= 30

                    return (
                      <Link
                        key={ticket.id}
                        href={`/staff/tickets/${ticket.id}`}
                        className="block"
                      >
                        <div className={`flex items-start justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors ${isOverdue ? 'border-red-300 bg-red-50' : isWarning ? 'border-amber-300 bg-amber-50' : ''}`}>
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-muted-foreground">
                                {formatTicketNumber(ticket.ticket_number)}
                              </span>
                              <Badge className={priority.color} variant="secondary">
                                {priority.label}
                              </Badge>
                              {(isOverdue || isWarning) && (
                                <Badge variant={isOverdue ? 'destructive' : 'outline'} className={isWarning && !isOverdue ? 'bg-amber-100 text-amber-700' : ''}>
                                  {isOverdue ? 'OVERDUE' : `${minutesLeft}m left`}
                                </Badge>
                              )}
                            </div>
                            <p className="font-medium truncate">{ticket.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {customer?.company_name || customer?.full_name}
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
        </>
      )}

      {/* Marketing Stats */}
      {isMarketing && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats.pending}</div>
              <Link href="/staff/orders" className="text-xs text-primary hover:underline">
                View orders
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats.processing}</div>
              <p className="text-xs text-muted-foreground">
                Being prepared
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats.lowStock}</div>
              <Link href="/staff/inventory" className="text-xs text-primary hover:underline">
                View inventory
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
