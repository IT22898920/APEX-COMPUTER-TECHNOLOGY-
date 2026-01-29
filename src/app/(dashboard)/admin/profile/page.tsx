import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from './profile-form'
import { PasswordForm } from './password-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  User,
  Lock,
  Shield,
  Mail,
  Calendar,
  Clock,
  Phone,
  MapPin,
  Settings,
  Users,
  ShoppingCart,
  Package,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getAdminProfile() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get admin stats
  const { count: ordersManaged } = await (supabase as any)
    .from('orders')
    .select('*', { count: 'exact', head: true })

  const { count: productsCount } = await (supabase as any)
    .from('products')
    .select('*', { count: 'exact', head: true })

  const { count: usersCount } = await (supabase as any)
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  return {
    user,
    profile,
    stats: {
      ordersManaged: ordersManaged || 0,
      productsCount: productsCount || 0,
      usersCount: usersCount || 0,
    },
  }
}

export default async function AdminProfilePage() {
  const data = await getAdminProfile()

  if (!data) {
    redirect('/login')
  }

  const { user, profile, stats } = data

  // Get initials for avatar
  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email?.[0].toUpperCase() || 'A'

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'staff':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold shadow-lg ring-4 ring-white/30">
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-400 border-2 border-white" title="Online" />
            </div>

            {/* User Info */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  {profile?.full_name || 'Administrator'}
                </h1>
                <Badge className={`${getRoleBadgeColor(profile?.role)} w-fit capitalize border`}>
                  <Shield className="h-3 w-3 mr-1" />
                  {profile?.role || 'Admin'}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </span>
                {profile?.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4" />
                    {profile.phone}
                  </span>
                )}
              </div>
              <p className="text-sm text-white/70 flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Admin since {new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" asChild>
                <Link href="/admin/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.ordersManaged}</p>
                <p className="text-sm text-muted-foreground">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.productsCount}</p>
                <p className="text-sm text-muted-foreground">Products</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.usersCount}</p>
                <p className="text-sm text-muted-foreground">Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Profile & Password Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal details
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <ProfileForm
                initialData={{
                  fullName: profile?.full_name || '',
                  phone: profile?.phone || '',
                  address: profile?.address || '',
                }}
                email={user.email || ''}
              />
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Lock className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Keep your account secure with a strong password
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <PasswordForm />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Account Info */}
        <div className="space-y-6">
          {/* Account Details */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Shield className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <CardTitle>Account Details</CardTitle>
                  <CardDescription>
                    Your account information
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email Address</p>
                    <p className="text-sm font-medium break-all">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Account Role</p>
                    <p className="text-sm font-medium capitalize">{profile?.role || 'Admin'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Account Created</p>
                    <p className="text-sm font-medium">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Sign In</p>
                    <p className="text-sm font-medium">
                      {user.last_sign_in_at
                        ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                {profile?.address && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Address</p>
                      <p className="text-sm font-medium">{profile.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Security Tips */}
          <Card className="bg-amber-50/50 border-amber-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-amber-600" />
                Security Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">1.</span>
                Never share your login credentials with anyone.
              </p>
              <p className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">2.</span>
                Use a unique, strong password for this account.
              </p>
              <p className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">3.</span>
                Always log out when using shared computers.
              </p>
              <p className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">4.</span>
                Review account activity regularly.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
