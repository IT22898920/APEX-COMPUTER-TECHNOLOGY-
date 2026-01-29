'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Loader2, Save, Phone, User, MapPin, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { updateProfile } from './actions'

const profileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  phone: z
    .string()
    .regex(/^(\+94|0)?[0-9]{9,10}$/, 'Enter a valid Sri Lankan phone number (e.g., +94771234567 or 0771234567)')
    .or(z.literal('')),
  address: z
    .string()
    .max(500, 'Address must be less than 500 characters')
    .optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileFormProps {
  initialData: {
    fullName: string
    phone: string
    address: string
  }
  email: string
}

export function ProfileForm({ initialData, email }: ProfileFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialData,
  })

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true)

    try {
      const result = await updateProfile({
        fullName: data.fullName,
        phone: data.phone || null,
        address: data.address || null,
      })

      if (result.success) {
        toast.success('Profile updated successfully')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to update profile')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Email (Read-only) */}
      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">
          Email cannot be changed. Contact support if you need to update it.
        </p>
      </div>

      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="fullName" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Full Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="fullName"
          placeholder="Enter your full name"
          {...register('fullName')}
          className={errors.fullName ? 'border-destructive' : ''}
        />
        {errors.fullName && (
          <p className="text-sm text-destructive">{errors.fullName.message}</p>
        )}
      </div>

      {/* Phone Number */}
      <div className="space-y-2">
        <Label htmlFor="phone" className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          Phone Number
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+94 77 123 4567"
          {...register('phone')}
          className={errors.phone ? 'border-destructive' : ''}
        />
        {errors.phone ? (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Used for order notifications via WhatsApp. Format: +94771234567 or 0771234567
          </p>
        )}
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Address
        </Label>
        <Textarea
          id="address"
          placeholder="Enter your address (optional)"
          rows={3}
          {...register('address')}
          className={errors.address ? 'border-destructive' : ''}
        />
        {errors.address && (
          <p className="text-sm text-destructive">{errors.address.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={isSubmitting || !isDirty}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </>
        )}
      </Button>
    </form>
  )
}
