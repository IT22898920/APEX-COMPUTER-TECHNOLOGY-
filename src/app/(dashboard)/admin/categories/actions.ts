'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  parent_id: string | null
  display_order: number
  is_active: boolean
  created_at: string
}

// Get all categories
export async function getCategories() {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching categories:', error)
      return { categories: [], error: error.message }
    }

    return { categories: data as Category[], error: null }
  } catch (error) {
    console.error('Get categories error:', error)
    return { categories: [], error: 'Failed to fetch categories' }
  }
}

// Create a new category
export async function createCategory(data: {
  name: string
  slug: string
  description?: string
  parent_id?: string | null
  display_order?: number
  is_active?: boolean
}) {
  try {
    const supabase = createAdminClient()

    const { data: category, error } = await supabase
      .from('categories')
      .insert({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        parent_id: data.parent_id || null,
        display_order: data.display_order || 0,
        is_active: data.is_active ?? true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating category:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/categories')
    revalidatePath('/admin/products')
    return { success: true, category }
  } catch (error) {
    console.error('Create category error:', error)
    return { success: false, error: 'Failed to create category' }
  }
}

// Update a category
export async function updateCategory(id: string, data: {
  name?: string
  slug?: string
  description?: string | null
  parent_id?: string | null
  display_order?: number
  is_active?: boolean
}) {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('categories')
      .update(data)
      .eq('id', id)

    if (error) {
      console.error('Error updating category:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/categories')
    revalidatePath('/admin/products')
    return { success: true }
  } catch (error) {
    console.error('Update category error:', error)
    return { success: false, error: 'Failed to update category' }
  }
}

// Delete a category
export async function deleteCategory(id: string) {
  try {
    const supabase = createAdminClient()

    // Check if category has products
    const { data: products } = await supabase
      .from('products')
      .select('id')
      .eq('category_id', id)
      .limit(1)

    if (products && products.length > 0) {
      return { success: false, error: 'Cannot delete category with products. Move or delete products first.' }
    }

    // Check if category has children
    const { data: children } = await supabase
      .from('categories')
      .select('id')
      .eq('parent_id', id)
      .limit(1)

    if (children && children.length > 0) {
      return { success: false, error: 'Cannot delete category with subcategories. Delete subcategories first.' }
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting category:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/categories')
    revalidatePath('/admin/products')
    return { success: true }
  } catch (error) {
    console.error('Delete category error:', error)
    return { success: false, error: 'Failed to delete category' }
  }
}

// Toggle category active status
export async function toggleCategoryStatus(id: string, isActive: boolean) {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('categories')
      .update({ is_active: isActive })
      .eq('id', id)

    if (error) {
      console.error('Error toggling category status:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/categories')
    return { success: true }
  } catch (error) {
    console.error('Toggle category status error:', error)
    return { success: false, error: 'Failed to update category status' }
  }
}
