'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export interface Service {
  id: string
  title: string
  slug: string
  description: string
  icon: string
  image_url: string | null
  images: string[]
  features: string[]
  price_from: number | null
  price_to: number | null
  is_featured: boolean
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// Get all services
export async function getServices() {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching services:', error)
      return { services: [], error: error.message }
    }

    return { services: data as Service[], error: null }
  } catch (error) {
    console.error('Get services error:', error)
    return { services: [], error: 'Failed to fetch services' }
  }
}

// Get active services (for public pages)
export async function getActiveServices() {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching active services:', error)
      return { services: [], error: error.message }
    }

    return { services: data as Service[], error: null }
  } catch (error) {
    console.error('Get active services error:', error)
    return { services: [], error: 'Failed to fetch services' }
  }
}

// Create a new service
export async function createService(data: {
  title: string
  slug: string
  description: string
  icon?: string
  image_url?: string
  images?: string[]
  features?: string[]
  price_from?: number | null
  price_to?: number | null
  is_featured?: boolean
  display_order?: number
  is_active?: boolean
}) {
  try {
    const supabase = createAdminClient()

    const { data: service, error } = await supabase
      .from('services')
      .insert({
        title: data.title,
        slug: data.slug,
        description: data.description,
        icon: data.icon || 'Wrench',
        image_url: data.images?.[0] || data.image_url || null,
        images: data.images || [],
        features: data.features || [],
        price_from: data.price_from || null,
        price_to: data.price_to || null,
        is_featured: data.is_featured ?? false,
        display_order: data.display_order || 0,
        is_active: data.is_active ?? true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating service:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/services')
    revalidatePath('/')
    return { success: true, service }
  } catch (error) {
    console.error('Create service error:', error)
    return { success: false, error: 'Failed to create service' }
  }
}

// Update a service
export async function updateService(id: string, data: {
  title?: string
  slug?: string
  description?: string
  icon?: string
  image_url?: string | null
  images?: string[]
  features?: string[]
  price_from?: number | null
  price_to?: number | null
  is_featured?: boolean
  display_order?: number
  is_active?: boolean
}) {
  try {
    const supabase = createAdminClient()

    // If images array is provided, also update image_url with first image
    const updateData = { ...data }
    if (data.images !== undefined) {
      updateData.image_url = data.images[0] || null
    }

    const { error } = await supabase
      .from('services')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Error updating service:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/services')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Update service error:', error)
    return { success: false, error: 'Failed to update service' }
  }
}

// Delete a service
export async function deleteService(id: string) {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting service:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/services')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Delete service error:', error)
    return { success: false, error: 'Failed to delete service' }
  }
}

// Toggle service active status
export async function toggleServiceStatus(id: string, isActive: boolean) {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('services')
      .update({ is_active: isActive })
      .eq('id', id)

    if (error) {
      console.error('Error toggling service status:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/services')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Toggle service status error:', error)
    return { success: false, error: 'Failed to update service status' }
  }
}

// Toggle featured status
export async function toggleServiceFeatured(id: string, isFeatured: boolean) {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('services')
      .update({ is_featured: isFeatured })
      .eq('id', id)

    if (error) {
      console.error('Error toggling featured status:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/services')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Toggle featured status error:', error)
    return { success: false, error: 'Failed to update featured status' }
  }
}
