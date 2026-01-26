'use client'

import { useState } from 'react'
import { MoreHorizontal, Pencil, Trash2, Star, StarOff, Eye, EyeOff } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { EditBankAccountDialog } from './edit-bank-account-dialog'

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

interface BankAccountsTableProps {
  accounts: BankAccount[]
}

export function BankAccountsTable({ accounts }: BankAccountsTableProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editAccount, setEditAccount] = useState<BankAccount | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    const supabase = createClient()

    const { error } = await (supabase as any)
      .from('bank_accounts')
      .delete()
      .eq('id', deleteId)

    if (error) {
      toast.error('Failed to delete account', { description: error.message })
    } else {
      toast.success('Bank account deleted')
      router.refresh()
    }

    setIsDeleting(false)
    setDeleteId(null)
  }

  const togglePrimary = async (id: string, isPrimary: boolean) => {
    const supabase = createClient()

    const { error } = await (supabase as any)
      .from('bank_accounts')
      .update({ is_primary: !isPrimary })
      .eq('id', id)

    if (error) {
      toast.error('Failed to update', { description: error.message })
    } else {
      toast.success(isPrimary ? 'Removed as primary' : 'Set as primary account')
      router.refresh()
    }
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    const supabase = createClient()

    const { error } = await (supabase as any)
      .from('bank_accounts')
      .update({ is_active: !isActive })
      .eq('id', id)

    if (error) {
      toast.error('Failed to update', { description: error.message })
    } else {
      toast.success(isActive ? 'Account deactivated' : 'Account activated')
      router.refresh()
    }
  }

  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">No bank accounts added yet</p>
          <p className="text-sm text-muted-foreground">
            Add your first bank account to receive payments from customers
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Payment Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bank</TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead>Account Number</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{account.bank_name}</span>
                      {account.is_primary && (
                        <Badge variant="default" className="bg-amber-500">
                          <Star className="h-3 w-3 mr-1" />
                          Primary
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{account.account_name}</TableCell>
                  <TableCell className="font-mono">{account.account_number}</TableCell>
                  <TableCell>{account.branch || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={account.is_active ? 'default' : 'secondary'}>
                      {account.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditAccount(account)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => togglePrimary(account.id, account.is_primary)}
                        >
                          {account.is_primary ? (
                            <>
                              <StarOff className="mr-2 h-4 w-4" />
                              Remove Primary
                            </>
                          ) : (
                            <>
                              <Star className="mr-2 h-4 w-4" />
                              Set as Primary
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toggleActive(account.id, account.is_active)}
                        >
                          {account.is_active ? (
                            <>
                              <EyeOff className="mr-2 h-4 w-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteId(account.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bank Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this bank account. Customers will no longer
              see this account in payment instructions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      {editAccount && (
        <EditBankAccountDialog
          account={editAccount}
          open={!!editAccount}
          onOpenChange={() => setEditAccount(null)}
        />
      )}
    </>
  )
}
