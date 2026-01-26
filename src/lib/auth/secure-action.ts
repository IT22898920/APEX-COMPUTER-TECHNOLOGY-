'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

type Role = 'admin' | 'staff' | 'customer'
type StaffType = 'technician' | 'marketing' | 'support'

interface AuthUser {
  id: string
  email: string
  role: Role
  staffType: StaffType | null
}

interface ActionOptions {
  requiredRoles?: Role[]
  requiredStaffTypes?: StaffType[]
  allowSelf?: boolean // Allow action if user is performing on their own resource
}

interface ActionContext {
  user: AuthUser
  supabase: Awaited<ReturnType<typeof createClient>>
}

type ActionHandler<TInput, TOutput> = (
  input: TInput,
  context: ActionContext
) => Promise<TOutput>

// Rate limiting store (in-memory, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(userId: string, limit: number = 60, windowMs: number = 60000): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(userId)

  if (!record || now > record.resetAt) {
    rateLimitStore.set(userId, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  record.count++
  return true
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetAt) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean every minute

export function createSecureAction<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  handler: ActionHandler<TInput, TOutput>,
  options: ActionOptions = {}
) {
  return async (rawInput: unknown): Promise<{ success: true; data: TOutput } | { success: false; error: string }> => {
    try {
      // 1. Validate input
      const validationResult = schema.safeParse(rawInput)
      if (!validationResult.success) {
        return {
          success: false,
          error: validationResult.error.issues.map(e => e.message).join(', ')
        }
      }

      const input = validationResult.data

      // 2. Get authenticated user
      const supabase = await createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        return { success: false, error: 'Unauthorized: Please log in' }
      }

      // 3. Get user profile for role checking
      const { data: profile, error: profileError } = await (supabase
        .from('profiles') as any)
        .select('role, staff_type')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        return { success: false, error: 'User profile not found' }
      }

      const profileData = profile as { role: string; staff_type: string | null }
      const authUser: AuthUser = {
        id: user.id,
        email: user.email || '',
        role: profileData.role as Role,
        staffType: profileData.staff_type as StaffType | null
      }

      // 4. Check rate limiting
      if (!checkRateLimit(user.id)) {
        return { success: false, error: 'Too many requests. Please try again later.' }
      }

      // 5. Check required roles
      if (options.requiredRoles && options.requiredRoles.length > 0) {
        if (!options.requiredRoles.includes(authUser.role)) {
          return { success: false, error: 'Forbidden: Insufficient permissions' }
        }
      }

      // 6. Check required staff types (if user is staff)
      if (options.requiredStaffTypes && options.requiredStaffTypes.length > 0) {
        if (authUser.role !== 'staff' && authUser.role !== 'admin') {
          return { success: false, error: 'Forbidden: Staff access required' }
        }
        if (authUser.role === 'staff' && authUser.staffType && !options.requiredStaffTypes.includes(authUser.staffType)) {
          return { success: false, error: 'Forbidden: Insufficient staff permissions' }
        }
      }

      // 7. Execute the handler
      const result = await handler(input, { user: authUser, supabase })

      return { success: true, data: result }
    } catch (error) {
      console.error('Secure action error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }
}

// Helper for admin-only actions
export function createAdminAction<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  handler: ActionHandler<TInput, TOutput>
) {
  return createSecureAction(schema, handler, { requiredRoles: ['admin'] })
}

// Helper for staff actions (admin or staff)
export function createStaffAction<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  handler: ActionHandler<TInput, TOutput>,
  staffTypes?: StaffType[]
) {
  return createSecureAction(schema, handler, {
    requiredRoles: ['admin', 'staff'],
    requiredStaffTypes: staffTypes
  })
}

// Helper to check if user can access a resource
export async function canAccessResource(
  resourceOwnerId: string,
  allowedRoles: Role[] = ['admin', 'staff']
): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  // User is accessing their own resource
  if (user.id === resourceOwnerId) return true

  // Check role
  const { data: profile } = await (supabase
    .from('profiles') as any)
    .select('role')
    .eq('id', user.id)
    .single()

  const profileData = profile as { role: string } | null
  return profileData ? allowedRoles.includes(profileData.role as Role) : false
}
