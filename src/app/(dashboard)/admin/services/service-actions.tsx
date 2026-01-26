'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Edit, Trash2, Power, Star, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { toast } from 'sonner'
import { deleteService, toggleServiceStatus, toggleServiceFeatured, type Service } from './actions'

interface ServiceActionsProps {
  service: Service
}

export function ServiceActions({ service }: ServiceActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleToggleStatus = async () => {
    setIsLoading(true)
    const result = await toggleServiceStatus(service.id, !service.is_active)
    setIsLoading(false)

    if (!result.success) {
      toast.error(result.error || 'Failed to update status')
      return
    }

    toast.success(service.is_active ? 'Service hidden' : 'Service activated')
    router.refresh()
  }

  const handleToggleFeatured = async () => {
    setIsLoading(true)
    const result = await toggleServiceFeatured(service.id, !service.is_featured)
    setIsLoading(false)

    if (!result.success) {
      toast.error(result.error || 'Failed to update featured status')
      return
    }

    toast.success(service.is_featured ? 'Removed from featured' : 'Added to featured')
    router.refresh()
  }

  const handleDelete = async () => {
    setIsLoading(true)
    const result = await deleteService(service.id)
    setIsLoading(false)
    setShowDeleteDialog(false)

    if (!result.success) {
      toast.error(result.error || 'Failed to delete service')
      return
    }

    toast.success('Service deleted successfully')
    router.refresh()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a href={`/admin/services/${service.id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleFeatured}>
            <Star className={`mr-2 h-4 w-4 ${service.is_featured ? 'text-yellow-500 fill-yellow-500' : ''}`} />
            {service.is_featured ? 'Remove from Featured' : 'Mark as Featured'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleStatus}>
            <Power className={`mr-2 h-4 w-4 ${service.is_active ? 'text-destructive' : 'text-green-500'}`} />
            {service.is_active ? 'Hide Service' : 'Show Service'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{service.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
