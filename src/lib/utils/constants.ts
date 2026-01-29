// App configuration
export const APP_NAME = 'Apex Computer Technology'
export const APP_DESCRIPTION = 'Professional IT Solutions for Your Business'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Company information
export const COMPANY_INFO = {
  name: 'Apex Computer Technology',
  tagline: 'Professional IT Solutions for Your Business',
  phone: '+94 77 777 0003',
  whatsapp: '+94777770003', // Without spaces for WhatsApp API
  whatsappDisplay: '+94 77 777 0003',
  email: 'apex@isplanka.lk',
  address: {
    street: '#236/15, Wijayakumarathunga Mawatha',
    city: 'Colombo 05',
    country: 'Sri Lanka',
  },
  workingHours: 'Mon - Fri: 8:00 AM - 6:00 PM',
  emergencySupport: '24/7 Emergency Support Available',
}

// SLA Configuration
export const SLA_CONFIG = {
  defaultResponseHours: 3,
  criticalResponseHours: 2,
  warningThresholdMinutes: 30, // Alert 30 minutes before deadline
}

// Ticket statuses with display info
export const TICKET_STATUSES = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-700', icon: '⚪' },
  assigned: { label: 'Assigned', color: 'bg-blue-100 text-blue-700', icon: '🔵' },
  in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-700', icon: '🟡' },
  on_hold: { label: 'On Hold', color: 'bg-red-100 text-red-700', icon: '🔴' },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-700', icon: '🟢' },
  closed: { label: 'Closed', color: 'bg-gray-800 text-white', icon: '⚫' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-300 text-gray-600', icon: '⊘' },
} as const

// Ticket priorities with display info
export const TICKET_PRIORITIES = {
  critical: { label: 'Critical', color: 'bg-red-600 text-white', weight: 4 },
  high: { label: 'High', color: 'bg-orange-500 text-white', weight: 3 },
  medium: { label: 'Medium', color: 'bg-amber-400 text-gray-800', weight: 2 },
  low: { label: 'Low', color: 'bg-gray-400 text-white', weight: 1 },
} as const

// Agreement types with display info
export const AGREEMENT_TYPES = {
  comprehensive: {
    label: 'Comprehensive',
    description: 'Full coverage including parts, labour, and priority response',
    features: ['Parts included', 'Labour included', '2-hour response', '24/7 support'],
  },
  labour_only: {
    label: 'Labour Only',
    description: 'Labour covered, customer pays for parts',
    features: ['Labour included', 'Parts billed separately', '3-hour response', 'Business hours'],
  },
  on_call: {
    label: 'On-Call',
    description: 'Pay per service, no monthly commitment',
    features: ['No monthly fee', 'Pay per visit', '3-hour response', 'Business hours'],
  },
} as const

// Order statuses
export const ORDER_STATUSES = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-700' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700' },
  processing: { label: 'Processing', color: 'bg-amber-100 text-amber-700' },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
  refunded: { label: 'Refunded', color: 'bg-gray-300 text-gray-600' },
} as const

// Payment statuses
export const PAYMENT_STATUSES = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  partial: { label: 'Partial', color: 'bg-blue-100 text-blue-700' },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-700' },
  refunded: { label: 'Refunded', color: 'bg-gray-300 text-gray-600' },
} as const

// Problem categories
export const PROBLEM_CATEGORIES = [
  { value: 'hardware', label: 'Hardware Issue' },
  { value: 'software', label: 'Software Issue' },
  { value: 'network', label: 'Network/Connectivity' },
  { value: 'security', label: 'Security/Virus' },
  { value: 'performance', label: 'Performance/Slow' },
  { value: 'data', label: 'Data Recovery' },
  { value: 'installation', label: 'Installation/Setup' },
  { value: 'other', label: 'Other' },
] as const

// Services offered
export const SERVICES = [
  {
    title: 'Hardware Repairs',
    description: 'Computer, laptop, and server repairs & maintenance',
    icon: 'Wrench',
  },
  {
    title: 'Networking Solutions',
    description: 'LAN/WAN setup, WiFi configuration, and security',
    icon: 'Network',
  },
  {
    title: 'Software Support',
    description: 'OS installation, troubleshooting, and updates',
    icon: 'Monitor',
  },
  {
    title: 'IT Product Sales',
    description: 'Hardware, peripherals, and accessories',
    icon: 'ShoppingCart',
  },
  {
    title: 'Maintenance Contracts',
    description: 'Comprehensive, Labour Only, and On-Call plans',
    icon: 'FileText',
  },
  {
    title: 'Emergency Response',
    description: '2-3 hour guaranteed response time',
    icon: 'AlertCircle',
  },
] as const

// Navigation items
export const PUBLIC_NAV_ITEMS = [
  { title: 'Home', href: '/' },
  { title: 'About', href: '/about' },
  { title: 'Services', href: '/services' },
  { title: 'Products', href: '/products' },
  { title: 'Contact', href: '/contact' },
] as const

export const ADMIN_NAV_ITEMS = [
  { title: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
  { title: 'Users', href: '/admin/users', icon: 'Users' },
  { title: 'Categories', href: '/admin/categories', icon: 'FolderTree' },
  { title: 'Services', href: '/admin/services', icon: 'Briefcase' },
  { title: 'Products', href: '/admin/products', icon: 'Package' },
  { title: 'Orders', href: '/admin/orders', icon: 'ShoppingCart' },
  { title: 'Reports', href: '/admin/reports', icon: 'BarChart3' },
  { title: 'Bank Accounts', href: '/admin/settings/bank-accounts', icon: 'Building2' },
  { title: 'Settings', href: '/admin/settings', icon: 'Settings' },
] as const

export const STAFF_NAV_ITEMS = {
  technician: [
    { title: 'Dashboard', href: '/staff', icon: 'LayoutDashboard' },
    { title: 'Orders', href: '/staff/orders', icon: 'ShoppingCart' },
  ],
  marketing: [
    { title: 'Dashboard', href: '/staff', icon: 'LayoutDashboard' },
    { title: 'Inventory', href: '/staff/inventory', icon: 'Package' },
    { title: 'Orders', href: '/staff/orders', icon: 'ShoppingCart' },
  ],
  support: [
    { title: 'Dashboard', href: '/staff', icon: 'LayoutDashboard' },
    { title: 'Inventory', href: '/staff/inventory', icon: 'Package' },
    { title: 'Orders', href: '/staff/orders', icon: 'ShoppingCart' },
  ],
} as const

export const CUSTOMER_NAV_ITEMS = [
  { title: 'Dashboard', href: '/customer', icon: 'LayoutDashboard' },
  { title: 'My Orders', href: '/customer/orders', icon: 'ShoppingCart' },
  { title: 'Profile', href: '/customer/profile', icon: 'User' },
] as const

// Currency formatting
export const CURRENCY = {
  code: 'LKR',
  symbol: 'Rs.',
  locale: 'en-LK',
}

// Pagination defaults
export const PAGINATION = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 25, 50, 100],
}
