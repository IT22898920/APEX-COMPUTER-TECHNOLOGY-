'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Edit, Shield, UserCog, User, Power, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface UserProfile {
  id: string
  role: 'admin' | 'staff' | 'customer'
  staff_type: 'technician' | 'marketing' | 'support' | null
  full_name: string
  is_active: boolean
}

interface UserActionsProps {
  user: UserProfile
}

export function UserActions({ user }: UserActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [showStaffTypeDialog, setShowStaffTypeDialog] = useState(false)
  const [pendingRole, setPendingRole] = useState<'admin' | 'staff' | 'customer' | null>(null)
  const [pendingStaffType, setPendingStaffType] = useState<'technician' | 'marketing' | 'support' | null>(null)

  const handleRoleChange = async (newRole: 'admin' | 'staff' | 'customer') => {
    if (newRole === 'staff') {
      setPendingRole(newRole)
      setShowStaffTypeDialog(true)
      return
    }

    setPendingRole(newRole)
    setShowRoleDialog(true)
  }

  const confirmRoleChange = async () => {
    if (!pendingRole) return

    setIsLoading(true)
    const supabase = createClient()

    const updateData: { role: string; staff_type?: string | null } = {
      role: pendingRole,
    }

    // Clear staff_type if not staff
    if (pendingRole !== 'staff') {
      updateData.staff_type = null
    } else if (pendingStaffType) {
      updateData.staff_type = pendingStaffType
    }

    const { error } = await (supabase.from('profiles') as any)
      .update(updateData)
      .eq('id', user.id)

    setIsLoading(false)
    setShowRoleDialog(false)
    setShowStaffTypeDialog(false)
    setPendingRole(null)
    setPendingStaffType(null)

    if (error) {
      toast.error('Failed to update role: ' + error.message)
      return
    }

    toast.success(`Role updated to ${pendingRole}`)
    router.refresh()
  }

  const handleStaffTypeSelect = (staffType: 'technician' | 'marketing' | 'support') => {
    setPendingStaffType(staffType)
    setShowStaffTypeDialog(false)
    setShowRoleDialog(true)
  }

  const handleToggleActive = async () => {
    setIsLoading(true)
    const supabase = createClient()

    const { error } = await (supabase.from('profiles') as any)
      .update({ is_active: !user.is_active })
      .eq('id', user.id)

    setIsLoading(false)

    if (error) {
      toast.error('Failed to update status: ' + error.message)
      return
    }

    toast.success(user.is_active ? 'User deactivated' : 'User activated')
    router.refresh()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a href={`/admin/users/${user.id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Details
            </a>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Shield className="mr-2 h-4 w-4" />
              Change Role
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() => handleRoleChange('admin')}
                disabled={user.role === 'admin'}
              >
                <Shield className="mr-2 h-4 w-4 text-red-500" />
                Admin
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleRoleChange('staff')}
                disabled={user.role === 'staff'}
              >
                <UserCog className="mr-2 h-4 w-4 text-blue-500" />
                Staff
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleRoleChange('customer')}
                disabled={user.role === 'customer'}
              >
                <User className="mr-2 h-4 w-4 text-green-500" />
                Customer
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleToggleActive}>
            <Power className={`mr-2 h-4 w-4 ${user.is_active ? 'text-destructive' : 'text-green-500'}`} />
            {user.is_active ? 'Deactivate' : 'Activate'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Staff Type Selection Dialog */}
      <Dialog open={showStaffTypeDialog} onOpenChange={setShowStaffTypeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Staff Type</DialogTitle>
            <DialogDescription>
              Choose the staff type for {user.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => handleStaffTypeSelect('technician')}
            >
              <UserCog className="mr-2 h-4 w-4" />
              Technician - Handles service tickets and repairs
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => handleStaffTypeSelect('marketing')}
            >
              <UserCog className="mr-2 h-4 w-4" />
              Marketing - Manages products and orders
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => handleStaffTypeSelect('support')}
            >
              <UserCog className="mr-2 h-4 w-4" />
              Support - Customer support and ticket handling
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStaffTypeDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Change Confirmation Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Role Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to change {user.full_name}&apos;s role to{' '}
              <strong>{pendingRole}</strong>
              {pendingStaffType && (
                <> ({pendingStaffType})</>
              )}
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmRoleChange} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Confirm'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
