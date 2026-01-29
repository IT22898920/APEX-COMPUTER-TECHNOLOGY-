'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface AdminSignature {
  id: string
  name: string
  title: string | null
  image_url: string
  is_default: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

// Get all signatures
export async function getSignatures() {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('admin_signatures')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching signatures:', error)
      return { signatures: [], error: error.message }
    }

    return { signatures: data as AdminSignature[], error: null }
  } catch (error) {
    console.error('Get signatures error:', error)
    return { signatures: [], error: 'Failed to fetch signatures' }
  }
}

// Get default signature
export async function getDefaultSignature() {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('admin_signatures')
      .select('*')
      .eq('is_default', true)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching default signature:', error)
      return { signature: null, error: error.message }
    }

    return { signature: data as AdminSignature | null, error: null }
  } catch (error) {
    console.error('Get default signature error:', error)
    return { signature: null, error: 'Failed to fetch default signature' }
  }
}

// Create signature
export async function createSignature(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const file = formData.get('file') as File
    const name = formData.get('name') as string
    const title = formData.get('title') as string
    const isDefault = formData.get('is_default') === 'true'

    if (!file || !name) {
      return { success: false, error: 'File and name are required' }
    }

    const adminClient = createAdminClient()

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    // Upload file
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from('signatures')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { success: false, error: 'Failed to upload signature image' }
    }

    // Get public URL
    const { data: { publicUrl } } = adminClient.storage
      .from('signatures')
      .getPublicUrl(uploadData.path)

    // If setting as default, unset other defaults
    if (isDefault) {
      await adminClient
        .from('admin_signatures')
        .update({ is_default: false })
        .eq('is_default', true)
    }

    // Create signature record
    const { data: signature, error: sigError } = await adminClient
      .from('admin_signatures')
      .insert({
        name,
        title: title || null,
        image_url: publicUrl,
        is_default: isDefault,
        created_by: user.id,
      })
      .select()
      .single()

    if (sigError) {
      console.error('Error creating signature record:', sigError)
      await adminClient.storage.from('signatures').remove([uploadData.path])
      return { success: false, error: sigError.message }
    }

    revalidatePath('/admin/reports')
    return { success: true, signature }
  } catch (error) {
    console.error('Create signature error:', error)
    return { success: false, error: 'Failed to create signature' }
  }
}

// Update signature
export async function updateSignature(id: string, data: {
  name?: string
  title?: string
  is_default?: boolean
}) {
  try {
    const supabase = createAdminClient()

    // If setting as default, unset other defaults
    if (data.is_default) {
      await supabase
        .from('admin_signatures')
        .update({ is_default: false })
        .eq('is_default', true)
    }

    const { error } = await supabase
      .from('admin_signatures')
      .update({
        name: data.name,
        title: data.title,
        is_default: data.is_default,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating signature:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/reports')
    return { success: true }
  } catch (error) {
    console.error('Update signature error:', error)
    return { success: false, error: 'Failed to update signature' }
  }
}

// Delete signature
export async function deleteSignature(id: string) {
  try {
    const supabase = createAdminClient()

    // Get signature
    const { data: signature, error: fetchError } = await supabase
      .from('admin_signatures')
      .select('image_url')
      .eq('id', id)
      .single()

    if (fetchError) {
      return { success: false, error: 'Signature not found' }
    }

    // Delete file from storage
    try {
      const url = new URL(signature.image_url)
      const filePath = url.pathname.split('/signatures/')[1]
      if (filePath) {
        await supabase.storage.from('signatures').remove([filePath])
      }
    } catch (e) {
      console.error('Error deleting file:', e)
    }

    // Delete signature record
    const { error } = await supabase
      .from('admin_signatures')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting signature:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/reports')
    return { success: true }
  } catch (error) {
    console.error('Delete signature error:', error)
    return { success: false, error: 'Failed to delete signature' }
  }
}

// Set signature as default
export async function setDefaultSignature(id: string) {
  try {
    const supabase = createAdminClient()

    // Unset all defaults
    await supabase
      .from('admin_signatures')
      .update({ is_default: false })
      .eq('is_default', true)

    // Set new default
    const { error } = await supabase
      .from('admin_signatures')
      .update({ is_default: true, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('Error setting default signature:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/reports')
    return { success: true }
  } catch (error) {
    console.error('Set default signature error:', error)
    return { success: false, error: 'Failed to set default signature' }
  }
}
