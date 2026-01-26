import { z } from 'zod'

// Sanitize string to prevent XSS
const sanitizeString = (val: string) =>
  val.replace(/<[^>]*>/g, '').trim()

// Common schemas
export const uuidSchema = z.string().uuid('Invalid ID format')

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

// Product schemas
export const productSchema = z.object({
  name: z
    .string()
    .min(2, 'Product name must be at least 2 characters')
    .max(200, 'Product name must be less than 200 characters')
    .transform(sanitizeString),
  sku: z
    .string()
    .min(2, 'SKU must be at least 2 characters')
    .max(50, 'SKU must be less than 50 characters')
    .regex(/^[A-Za-z0-9-_]+$/, 'SKU can only contain letters, numbers, hyphens and underscores'),
  description: z
    .string()
    .max(5000, 'Description must be less than 5000 characters')
    .transform(sanitizeString)
    .optional(),
  categoryId: uuidSchema.optional().nullable(),
  costPrice: z.coerce.number().positive('Cost price must be positive'),
  sellingPrice: z.coerce.number().positive('Selling price must be positive'),
  stockQuantity: z.coerce.number().int().min(0, 'Stock cannot be negative').default(0),
  reorderLevel: z.coerce.number().int().min(0).default(5),
  isActive: z.boolean().default(true),
})

// User/Profile schemas
export const userCreateSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .transform(sanitizeString),
  phone: z
    .string()
    .regex(/^[\d\s+()-]{7,20}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  companyName: z
    .string()
    .max(200, 'Company name too long')
    .transform(sanitizeString)
    .optional()
    .or(z.literal('')),
  role: z.enum(['admin', 'staff', 'customer']).default('customer'),
  staffType: z.enum(['technician', 'marketing', 'support']).optional().nullable(),
})

export const userUpdateSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .transform(sanitizeString),
  phone: z
    .string()
    .regex(/^[\d\s+()-]{7,20}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  companyName: z
    .string()
    .max(200, 'Company name too long')
    .transform(sanitizeString)
    .optional()
    .or(z.literal('')),
  role: z.enum(['admin', 'staff', 'customer']),
  staffType: z.enum(['technician', 'marketing', 'support']).optional().nullable(),
  isActive: z.boolean(),
})

// Service Ticket schemas
export const serviceTicketSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters')
    .transform(sanitizeString),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must be less than 5000 characters')
    .transform(sanitizeString),
  priority: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
  problemCategory: z
    .string()
    .max(100, 'Category must be less than 100 characters')
    .optional(),
  isOnsite: z.boolean().default(true),
})

// Order schemas
export const orderSchema = z.object({
  customerId: uuidSchema.optional().nullable(),
  customerName: z.string().min(2).max(100).transform(sanitizeString),
  customerEmail: z.string().email().optional().or(z.literal('')),
  customerPhone: z
    .string()
    .regex(/^[\d\s+()-]{7,20}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  notes: z.string().max(1000).transform(sanitizeString).optional(),
  items: z.array(z.object({
    productId: uuidSchema,
    quantity: z.coerce.number().int().positive('Quantity must be positive'),
  })).min(1, 'Order must have at least one item'),
})

// Search/Filter schemas (prevent SQL injection through query params)
export const searchSchema = z.object({
  query: z
    .string()
    .max(100, 'Search query too long')
    .transform(sanitizeString)
    .optional(),
  status: z.string().optional(),
  role: z.enum(['admin', 'staff', 'customer']).optional(),
  sortBy: z.string().regex(/^[a-z_]+$/, 'Invalid sort field').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type ProductInput = z.infer<typeof productSchema>
export type UserCreateInput = z.infer<typeof userCreateSchema>
export type UserUpdateInput = z.infer<typeof userUpdateSchema>
export type ServiceTicketInput = z.infer<typeof serviceTicketSchema>
export type OrderInput = z.infer<typeof orderSchema>
export type SearchInput = z.infer<typeof searchSchema>
