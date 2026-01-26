import { Plus, Building2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { BankAccountsTable } from './bank-accounts-table'
import { AddBankAccountDialog } from './add-bank-account-dialog'

export const dynamic = 'force-dynamic'

interface BankAccount {
  id: string
  bank_name: string
  account_name: string
  account_number: string
  branch: string | null
  swift_code: string | null
  is_primary: boolean
  is_active: boolean
  display_order: number
  created_at: string
}

async function getBankAccounts() {
  const supabase = await createClient()

  const { data, error } = await (supabase
    .from('bank_accounts')
    .select('*')
    .order('display_order', { ascending: true }) as any)

  if (error) {
    console.error('Error fetching bank accounts:', error)
    return []
  }

  return data as BankAccount[]
}

export default async function BankAccountsPage() {
  const accounts = await getBankAccounts()

  const totalAccounts = accounts.length
  const activeAccounts = accounts.filter(a => a.is_active).length
  const primaryAccount = accounts.find(a => a.is_primary)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bank Accounts</h1>
          <p className="text-muted-foreground">
            Manage payment account details for customers
          </p>
        </div>
        <AddBankAccountDialog />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAccounts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeAccounts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Primary Account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold truncate">
              {primaryAccount ? primaryAccount.bank_name : 'Not set'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bank Accounts Table */}
      <BankAccountsTable accounts={accounts} />
    </div>
  )
}
