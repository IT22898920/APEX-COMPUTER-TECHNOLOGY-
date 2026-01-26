'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface BankAccount {
  id: string
  bank_name: string
  account_name: string
  account_number: string
  branch: string | null
  swift_code: string | null
  is_primary: boolean
  is_active: boolean
}

interface EditBankAccountDialogProps {
  account: BankAccount
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditBankAccountDialog({
  account,
  open,
  onOpenChange,
}: EditBankAccountDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    bank_name: account.bank_name,
    account_name: account.account_name,
    account_number: account.account_number,
    branch: account.branch || '',
    swift_code: account.swift_code || '',
    is_primary: account.is_primary,
    is_active: account.is_active,
  })

  useEffect(() => {
    setFormData({
      bank_name: account.bank_name,
      account_name: account.account_name,
      account_number: account.account_number,
      branch: account.branch || '',
      swift_code: account.swift_code || '',
      is_primary: account.is_primary,
      is_active: account.is_active,
    })
  }, [account])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.bank_name || !formData.account_name || !formData.account_number) {
      toast.error('Please fill in required fields')
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    const { error } = await (supabase as any)
      .from('bank_accounts')
      .update({
        bank_name: formData.bank_name,
        account_name: formData.account_name,
        account_number: formData.account_number,
        branch: formData.branch || null,
        swift_code: formData.swift_code || null,
        is_primary: formData.is_primary,
        is_active: formData.is_active,
      })
      .eq('id', account.id)

    if (error) {
      toast.error('Failed to update bank account', { description: error.message })
    } else {
      toast.success('Bank account updated successfully')
      onOpenChange(false)
      router.refresh()
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Bank Account</DialogTitle>
          <DialogDescription>
            Update the bank account details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit_bank_name">Bank Name *</Label>
              <Input
                id="edit_bank_name"
                value={formData.bank_name}
                onChange={(e) =>
                  setFormData({ ...formData, bank_name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_account_name">Account Name *</Label>
              <Input
                id="edit_account_name"
                value={formData.account_name}
                onChange={(e) =>
                  setFormData({ ...formData, account_name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_account_number">Account Number *</Label>
              <Input
                id="edit_account_number"
                value={formData.account_number}
                onChange={(e) =>
                  setFormData({ ...formData, account_number: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_branch">Branch</Label>
                <Input
                  id="edit_branch"
                  value={formData.branch}
                  onChange={(e) =>
                    setFormData({ ...formData, branch: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_swift_code">SWIFT Code</Label>
                <Input
                  id="edit_swift_code"
                  value={formData.swift_code}
                  onChange={(e) =>
                    setFormData({ ...formData, swift_code: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex items-center space-x-4 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit_is_primary"
                  checked={formData.is_primary}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_primary: checked as boolean })
                  }
                />
                <Label htmlFor="edit_is_primary" className="text-sm font-normal">
                  Set as primary account
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit_is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked as boolean })
                  }
                />
                <Label htmlFor="edit_is_active" className="text-sm font-normal">
                  Active
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
