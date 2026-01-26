import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { formatRelativeTime, formatTicketNumber } from '@/lib/utils/format'
import { TICKET_STATUSES, TICKET_PRIORITIES } from '@/lib/utils/constants'

export const dynamic = 'force-dynamic'

interface TicketData {
  id: string
  ticket_number: string
  title: string
  description: string
  status: string
  priority: string
  created_at: string
}

async function getServiceRequests(): Promise<TicketData[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: tickets } = await supabase
    .from('service_tickets')
    .select('*')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  return (tickets || []) as TicketData[]
}

export default async function ServiceRequestsPage() {
  const tickets = await getServiceRequests()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Service Requests</h1>
          <p className="text-muted-foreground">
            View and manage your service requests
          </p>
        </div>
        <Button asChild>
          <Link href="/customer/service-requests/new">
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Link>
        </Button>
      </div>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
          <CardDescription>
            {tickets.length} total request{tickets.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                You haven&apos;t submitted any service requests yet.
              </p>
              <Button asChild>
                <Link href="/customer/service-requests/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Submit Your First Request
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
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm text-muted-foreground">
                            {formatTicketNumber(ticket.ticket_number)}
                          </span>
                          <Badge className={priority.color} variant="secondary">
                            {priority.label}
                          </Badge>
                        </div>
                        <p className="font-medium truncate">{ticket.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {ticket.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Submitted {formatRelativeTime(ticket.created_at)}
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
    </div>
  )
}
