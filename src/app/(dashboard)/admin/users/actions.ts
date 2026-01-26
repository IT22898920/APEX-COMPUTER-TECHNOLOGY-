'use server'

import { createAdminClient } from '@/lib/supabase/admin'

// Create a new user (admin only) - no email confirmation required
export async function createUserByAdmin(userData: {
  email: string
  password: string
  full_name: string
  phone?: string
  company_name?: string
  role: 'admin' | 'staff' | 'customer'
  staff_type?: 'technician' | 'marketing' | 'support' | null
}) {
  try {
    const supabase = createAdminClient()

    // Create user with admin API (auto-confirms email)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: userData.full_name,
        role: userData.role,
      },
    })

    if (authError) {
      console.error('Auth error:', authError)
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create user' }
    }

    // Create/update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        full_name: userData.full_name,
        phone: userData.phone || null,
        company_name: userData.company_name || null,
        role: userData.role,
        staff_type: userData.role === 'staff' ? userData.staff_type : null,
        is_active: true,
      })

    if (profileError) {
      console.error('Profile error:', profileError)
      // User created but profile failed - still return success with warning
      return {
        success: true,
        userId: authData.user.id,
        warning: 'User created but profile update failed'
      }
    }

    return { success: true, userId: authData.user.id }
  } catch (error) {
    console.error('Create user error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export async function syncMissingProfiles() {
  try {
    const supabase = createAdminClient()

    // Get all users from auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error('Error fetching auth users:', authError)
      return { success: false, error: authError.message, synced: 0 }
    }

    if (!authUsers?.users?.length) {
      return { success: true, synced: 0 }
    }

    // Get all existing profile IDs
    const { data: existingProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      return { success: false, error: profilesError.message, synced: 0 }
    }

    const existingProfileIds = new Set(existingProfiles?.map(p => p.id) || [])

    // Find users without profiles
    const usersWithoutProfiles = authUsers.users.filter(
      user => !existingProfileIds.has(user.id)
    )

    if (usersWithoutProfiles.length === 0) {
      return { success: true, synced: 0 }
    }

    // Create profiles for missing users
    const profilesToCreate = usersWithoutProfiles.map(user => ({
      id: user.id,
      role: (user.user_metadata?.role as 'admin' | 'staff' | 'customer') || 'customer',
      staff_type: user.user_metadata?.staff_type || null,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown',
      phone: user.user_metadata?.phone || null,
      avatar_url: user.user_metadata?.avatar_url || null,
      company_name: user.user_metadata?.company_name || null,
      is_active: true,
    }))

    const { error: insertError } = await supabase
      .from('profiles')
      .insert(profilesToCreate)

    if (insertError) {
      console.error('Error creating profiles:', insertError)
      return { success: false, error: insertError.message, synced: 0 }
    }

    console.log(`Synced ${profilesToCreate.length} missing profiles`)
    return { success: true, synced: profilesToCreate.length }
  } catch (error) {
    console.error('Sync error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      synced: 0
    }
  }
}

// Get users with their emails from auth
export async function getUsersWithEmails() {
  try {
    const supabase = createAdminClient()

    // Get all users from auth.users (includes email)
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error('Error fetching auth users:', authError)
      return { users: [], error: authError.message }
    }

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      return { users: [], error: profilesError.message }
    }

    // Create a map of auth users by ID for quick lookup
    const authUserMap = new Map(
      authUsers?.users?.map(u => [u.id, u]) || []
    )

    // Merge profiles with auth user data (including email)
    const usersWithEmails = (profiles || []).map(profile => ({
      ...profile,
      email: authUserMap.get(profile.id)?.email || null,
    }))

    return { users: usersWithEmails, error: null }
  } catch (error) {
    console.error('Get users error:', error)
    return {
      users: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
