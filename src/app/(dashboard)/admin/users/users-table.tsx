'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Plus, Users, Shield, UserCog, User, Download } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatRelativeTime, getInitials } from '@/lib/utils/format'
import { UserActions } from './user-actions'
import { exportToPDF } from '@/lib/utils/pdf-export'

interface UserProfile {
  id: string
  role: 'admin' | 'staff' | 'customer'
  staff_type: 'technician' | 'marketing' | 'support' | null
  full_name: string
  phone: string | null
  avatar_url: string | null
  company_name: string | null
  is_active: boolean
  created_at: string
  email?: string | null
}

interface UsersTableProps {
  users: UserProfile[]
}

const roleColors = {
  admin: 'bg-red-100 text-red-700 border-red-200',
  staff: 'bg-blue-100 text-blue-700 border-blue-200',
  customer: 'bg-green-100 text-green-700 border-green-200',
}

const roleIcons = {
  admin: Shield,
  staff: UserCog,
  customer: User,
}

const staffTypeLabels: Record<string, string> = {
  technician: 'Technician',
  marketing: 'Marketing',
  support: 'Support',
}

export function UsersTable({ users }: UsersTableProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase()
    return (
      user.full_name.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.phone?.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query) ||
      user.company_name?.toLowerCase().includes(query)
    )
  })

  // Export to PDF
  const handleExportPDF = async () => {
    const tableData = users.map(user => [
      user.full_name,
      user.email || '-',
      user.phone || '-',
      user.role.charAt(0).toUpperCase() + user.role.slice(1),
      user.staff_type ? staffTypeLabels[user.staff_type] : '-',
      user.company_name || '-',
      user.is_active ? 'Active' : 'Inactive'
    ])

    const doc = await exportToPDF({
      title: 'Users Report',
      headers: ['Name', 'Email', 'Phone', 'Role', 'Staff Type', 'Company', 'Status'],
      data: tableData,
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 40 },
        2: { cellWidth: 25 },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 22, halign: 'center' },
        5: { cellWidth: 28 },
        6: { cellWidth: 18, halign: 'center' }
      },
      summary: [
        { label: 'Total Users', value: users.length.toString() },
        { label: 'Admins', value: users.filter(u => u.role === 'admin').length.toString() },
        { label: 'Staff', value: users.filter(u => u.role === 'staff').length.toString() },
        { label: 'Customers', value: users.filter(u => u.role === 'customer').length.toString() },
        { label: 'Active Users', value: users.filter(u => u.is_active).length.toString() }
      ]
    })

    doc.save(`users-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              {filteredUsers.length} of {users.length} users
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-[200px] sm:w-[250px]"
              />
            </div>

            {/* Export */}
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No users yet</h3>
            <p className="text-muted-foreground mt-2">
              Get started by adding your first user.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/admin/users/new">
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Link>
            </Button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No users found</h3>
            <p className="text-muted-foreground mt-2">
              Try adjusting your search query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const RoleIcon = roleIcons[user.role]
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.full_name}</div>
                            {user.phone && (
                              <div className="text-xs text-muted-foreground">{user.phone}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{user.email || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={roleColors[user.role]}>
                            <RoleIcon className="mr-1 h-3 w-3" />
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                          {user.staff_type && (
                            <Badge variant="secondary" className="text-xs">
                              {staffTypeLabels[user.staff_type]}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.company_name || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? 'default' : 'secondary'}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatRelativeTime(user.created_at)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <UserActions user={user} />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
