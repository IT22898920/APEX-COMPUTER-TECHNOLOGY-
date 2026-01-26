// Re-export database types
export * from './database'

// Navigation types
export interface NavItem {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string | number
  disabled?: boolean
  children?: NavItem[]
}

// Address type
export interface Address {
  street?: string
  city?: string
  postal_code?: string
  country?: string
}

// Device info type
export interface DeviceInfo {
  type?: string
  brand?: string
  model?: string
  serial_number?: string
  purchase_date?: string
  warranty_status?: string
}

// Service location type
export interface ServiceLocation {
  address: Address
  contact_person?: string
  contact_phone?: string
  notes?: string
}

// Image type for products
export interface ProductImage {
  url: string
  alt?: string
  is_primary?: boolean
}

// Attachment type for notes
export interface Attachment {
  url: string
  filename: string
  type: string
  size?: number
}

// Coverage details for agreements
export interface CoverageDetails {
  hardware?: boolean
  software?: boolean
  network?: boolean
  emergency_response?: boolean
  preventive_maintenance?: boolean
  remote_support?: boolean
}

// Delivery address type
export interface DeliveryAddress extends Address {
  recipient_name?: string
  recipient_phone?: string
}

// Dashboard stats
export interface DashboardStats {
  openTickets: number
  inProgressTickets: number
  resolvedToday: number
  slaAtRisk: number
  totalRevenue?: number
  pendingOrders?: number
}

// Chart data types
export interface ChartDataPoint {
  name: string
  value: number
}

export interface RevenueData {
  date: string
  sales: number
  services: number
}

// Pagination
export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Filter types
export interface TicketFilters {
  status?: string[]
  priority?: string[]
  assignedTo?: string
  customerId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

export interface ProductFilters {
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  search?: string
}

export interface OrderFilters {
  status?: string[]
  paymentStatus?: string[]
  customerId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

// Form submission results
export interface ActionResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// User session data
export interface UserSession {
  id: string
  email: string
  role: 'admin' | 'staff' | 'customer'
  staffType?: 'technician' | 'marketing' | 'support' | null
  fullName: string
  avatarUrl?: string
}
