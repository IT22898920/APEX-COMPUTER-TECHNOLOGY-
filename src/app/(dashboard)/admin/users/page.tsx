import Link from 'next/link'
import { Plus, Users, Shield, UserCog, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { syncMissingProfiles, getUsersWithEmails } from './actions'
import { UsersTable } from './users-table'

export const dynamic = 'force-dynamic'

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

async function getUsers(): Promise<UserProfile[]> {
  // First, sync any missing profiles automatically
  const syncResult = await syncMissingProfiles()
  if (syncResult.synced > 0) {
    console.log(`Auto-synced ${syncResult.synced} missing profiles`)
  }

  // Then get all users with their emails
  const { users, error } = await getUsersWithEmails()

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }

  return users as UserProfile[]
}

export default async function AdminUsersPage() {
  const users = await getUsers()

  const totalUsers = users.length
  const adminCount = users.filter(u => u.role === 'admin').length
  const staffCount = users.filter(u => u.role === 'staff').length
  const customerCount = users.filter(u => u.role === 'customer').length
  const activeCount = users.filter(u => u.is_active).length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage system users and their roles
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/users/new">
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{adminCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff</CardTitle>
            <UserCog className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{staffCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <User className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{customerCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">of {totalUsers} users</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table with Search and Export */}
      <UsersTable users={users} />
    </div>
  )
}
