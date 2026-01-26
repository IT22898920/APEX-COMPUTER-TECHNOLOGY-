import Link from 'next/link'
import { Plus, Clock, CheckCircle, AlertTriangle, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { formatRelativeTime, formatTicketNumber } from '@/lib/utils/format'
import { TICKET_STATUSES, TICKET_PRIORITIES } from '@/lib/utils/constants'

export const dynamic = 'force-dynamic'

// Types for data
interface TicketData {
  id: string
  ticket_number: string
  title: string
  description: string
  status: string
  priority: string
  created_at: string
}

interface AgreementData {
  id: string
  agreement_type: string
  end_date: string
  status: string
}

async function getCustomerDashboardData() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Get tickets summary
  const { data: tickets } = await supabase
    .from('service_tickets')
    .select('*')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get active agreements
  const { data: agreements } = await supabase
    .from('service_agreements')
    .select('*')
    .eq('customer_id', user.id)
    .eq('status', 'active')

  // Get ticket counts
  const { count: openCount } = await supabase
    .from('service_tickets')
    .select('*', { count: 'exact', head: true })
    .eq('customer_id', user.id)
    .in('status', ['pending', 'assigned', 'in_progress'])

  const { count: resolvedCount } = await supabase
    .from('service_tickets')
    .select('*', { count: 'exact', head: true })
    .eq('customer_id', user.id)
    .eq('status', 'resolved')

  return {
    tickets: (tickets || []) as TicketData[],
    agreements: (agreements || []) as AgreementData[],
    stats: {
      open: openCount || 0,
      resolved: resolvedCount || 0,
      agreements: agreements?.length || 0,
    },
  }
}

export default async function CustomerDashboardPage() {
  const data = await getCustomerDashboardData()

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Unable to load dashboard data.</p>
      </div>
    )
  }

  const { tickets, agreements, stats } = data

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customer Dashboard</h1>
          <p className="text-muted-foreground">
            Track your service requests and manage your account
          </p>
        </div>
        <Button asChild>
          <Link href="/customer/service-requests/new">
            <Plus className="mr-2 h-4 w-4" />
            New Service Request
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.open}</div>
            <p className="text-xs text-muted-foreground">
              Currently being processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting your confirmation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agreements</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.agreements}</div>
            <p className="text-xs text-muted-foreground">
              Service agreements
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Service Requests</CardTitle>
            <CardDescription>Your latest service tickets</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/customer/service-requests">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-semibold">No service requests yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create a new service request when you need IT support
              </p>
              <Button className="mt-4" asChild>
                <Link href="/customer/service-requests/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Service Request
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => {
                const status = TICKET_STATUSES[ticket.status as keyof typeof TICKET_STATUSES]
                const priority = TICKET_PRIORITIES[ticket.priority as keyof typeof TICKET_PRIORITIES]

                return (
                  <Link
                    key={ticket.id}
                    href={`/customer/service-requests/${ticket.id}`}
                    className="block"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm text-muted-foreground">
                            {formatTicketNumber(ticket.ticket_number)}
                          </span>
                          <Badge className={priority.color}>
                            {priority.label}
                          </Badge>
                        </div>
                        <p className="font-medium truncate">{ticket.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatRelativeTime(ticket.created_at)}
                        </p>
                      </div>
                      <Badge className={`${status.color} shrink-0`}>
                        {status.icon} {status.label}
                      </Badge>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Agreements */}
      {agreements.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Service Agreements</CardTitle>
              <CardDescription>Your current service plans</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/customer/agreements">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agreements.map((agreement) => (
                <Link
                  key={agreement.id}
                  href={`/customer/agreements/${agreement.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-medium capitalize">
                        {agreement.agreement_type.replace('_', ' ')} Plan
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Valid until {new Date(agreement.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Active
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
