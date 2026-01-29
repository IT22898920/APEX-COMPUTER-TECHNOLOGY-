import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from './profile-form'
import { PasswordForm } from './password-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { User, Lock, Shield, Mail, Calendar, Clock, Phone, MapPin } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getProfile() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return {
    user,
    profile,
  }
}

export default async function CustomerProfilePage() {
  const data = await getProfile()

  if (!data) {
    redirect('/login')
  }

  const { user, profile } = data

  // Get initials for avatar
  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email?.[0].toUpperCase() || 'U'

  return (
    <div className="container max-w-6xl py-6 space-y-8">
      {/* Profile Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-background border">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold shadow-lg ring-4 ring-background">
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-2 border-background" title="Active" />
            </div>

            {/* User Info */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  {profile?.full_name || 'Welcome!'}
                </h1>
                <Badge variant="secondary" className="w-fit capitalize">
                  {profile?.role || 'Customer'}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Member since {new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
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
          {/* Account Stats */}
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
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Account Type</p>
                    <p className="text-sm font-medium capitalize">{profile?.role || 'Customer'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Member Since</p>
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

          {/* Quick Tips */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                Keep your phone number updated to receive WhatsApp order notifications.
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                Use a strong password with uppercase, lowercase, numbers, and special characters.
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                Your address will be used as the default delivery address for orders.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
