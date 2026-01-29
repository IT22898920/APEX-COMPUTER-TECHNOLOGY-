import Link from 'next/link'
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Clock,
  CreditCard,
  Globe,
  Shield,
  Bell,
  Palette,
  Database,
  Server,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Settings,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { COMPANY_INFO, APP_URL } from '@/lib/utils/constants'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

async function getSettingsData() {
  const supabase = await createClient()

  // Get bank accounts count
  const { count: bankAccountsCount } = await (supabase as any)
    .from('bank_accounts')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  // Get total users count
  const { count: usersCount } = await (supabase as any)
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // Get products count
  const { count: productsCount } = await (supabase as any)
    .from('products')
    .select('*', { count: 'exact', head: true })

  // Get orders count
  const { count: ordersCount } = await (supabase as any)
    .from('orders')
    .select('*', { count: 'exact', head: true })

  // Check if email is configured
  const emailConfigured = !!process.env.RESEND_API_KEY

  return {
    bankAccountsCount: bankAccountsCount || 0,
    usersCount: usersCount || 0,
    productsCount: productsCount || 0,
    ordersCount: ordersCount || 0,
    emailConfigured,
  }
}

export default async function SettingsPage() {
  const data = await getSettingsData()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application settings and configurations
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Information
            </CardTitle>
            <CardDescription>Your business details used across the application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm font-medium">Company Name</p>
                  <p className="text-sm text-muted-foreground">{COMPANY_INFO.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{COMPANY_INFO.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{COMPANY_INFO.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">
                    {COMPANY_INFO.address.street}<br />
                    {COMPANY_INFO.address.city}, {COMPANY_INFO.address.country}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm font-medium">Working Hours</p>
                  <p className="text-sm text-muted-foreground">{COMPANY_INFO.workingHours}</p>
                </div>
              </div>
            </div>

            <Separator />

            <p className="text-xs text-muted-foreground">
              To update company information, edit the constants file at <code className="bg-muted px-1 rounded">src/lib/utils/constants.ts</code>
            </p>
          </CardContent>
        </Card>

        {/* Quick Settings Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Quick Settings
            </CardTitle>
            <CardDescription>Manage various aspects of your system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/settings/bank-accounts">
              <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <CreditCard className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Bank Accounts</p>
                    <p className="text-xs text-muted-foreground">{data.bankAccountsCount} active accounts</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>

            <Link href="/admin/users">
              <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Shield className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">User Management</p>
                    <p className="text-xs text-muted-foreground">{data.usersCount} total users</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>

            <Link href="/admin/categories">
              <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Database className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Categories</p>
                    <p className="text-xs text-muted-foreground">Manage product categories</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>

            <Link href="/admin/services">
              <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100">
                    <Globe className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Services</p>
                    <p className="text-xs text-muted-foreground">Manage service offerings</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>Current system configuration and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Email Service (Resend)</span>
                </div>
                {data.emailConfigured ? (
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Configured
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600 border-amber-300">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Not Configured
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Database (Supabase)</span>
                </div>
                <Badge className="bg-green-100 text-green-700">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Site URL</span>
                </div>
                <code className="text-xs bg-muted px-2 py-1 rounded">{APP_URL}</code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Overview
            </CardTitle>
            <CardDescription>Quick overview of your data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-2xl font-bold text-blue-600">{data.usersCount}</p>
                <p className="text-sm text-blue-600/70">Total Users</p>
              </div>
              <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                <p className="text-2xl font-bold text-green-600">{data.productsCount}</p>
                <p className="text-sm text-green-600/70">Products</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
                <p className="text-2xl font-bold text-purple-600">{data.ordersCount}</p>
                <p className="text-sm text-purple-600/70">Total Orders</p>
              </div>
              <div className="p-4 rounded-lg bg-orange-50 border border-orange-100">
                <p className="text-2xl font-bold text-orange-600">{data.bankAccountsCount}</p>
                <p className="text-sm text-orange-600/70">Bank Accounts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 bg-red-50/50">
            <div>
              <p className="font-medium text-sm">Clear All Data</p>
              <p className="text-xs text-muted-foreground">
                This action cannot be undone. This will permanently delete all orders, products, and user data.
              </p>
            </div>
            <Button variant="destructive" size="sm" disabled>
              Clear Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
