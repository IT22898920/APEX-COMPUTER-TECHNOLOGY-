'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface UpdateProfileInput {
  fullName: string
  phone: string | null
  address: string | null
}

export async function updateProfile(input: UpdateProfileInput) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Format phone number if provided
  let formattedPhone = input.phone
  if (formattedPhone) {
    // Remove spaces and dashes
    formattedPhone = formattedPhone.replace(/[\s-]/g, '')

    // Convert 07x to +947x format
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+94' + formattedPhone.substring(1)
    }

    // Add +94 if not present
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+94' + formattedPhone
    }
  }

  // Update profile
  const { error: profileError } = await (supabase as any)
    .from('profiles')
    .update({
      full_name: input.fullName,
      phone: formattedPhone,
      address: input.address,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (profileError) {
    console.error('Profile update error:', profileError)
    return { success: false, error: 'Failed to update profile' }
  }

  revalidatePath('/customer/profile')
  revalidatePath('/customer')

  return { success: true }
}

interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

export async function changePassword(input: ChangePasswordInput) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email) {
    return { success: false, error: 'Not authenticated' }
  }

  // First verify current password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: input.currentPassword,
  })

  if (signInError) {
    return { success: false, error: 'Current password is incorrect' }
  }

  // Update to new password
  const { error: updateError } = await supabase.auth.updateUser({
    password: input.newPassword,
  })

  if (updateError) {
    console.error('Password update error:', updateError)
    return { success: false, error: 'Failed to update password' }
  }

  return { success: true }
}
