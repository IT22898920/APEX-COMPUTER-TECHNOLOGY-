import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { generateInvoiceEmail } from '@/lib/email/templates/invoice'
import { PrintButton } from './print-button'

interface OrderItem {
  id: string
  quantity: number
  unit_price: number
  total_price: number
  product: {
    id: string
    name: string
    sku: string
  }
}

interface Order {
  id: string
  order_number: string
  customer_id: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  status: string
  subtotal: number
  tax: number
  discount: number
  total: number
  payment_status: string
  created_at: string
  order_items: OrderItem[]
}

async function getOrderForInvoice(id: string): Promise<Order | null> {
  const supabase = await createClient()

  const { data, error } = await (supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        quantity,
        unit_price,
        total_price,
        product:products (id, name, sku)
      )
    `)
    .eq('id', id)
    .single() as any)

  if (error) {
    console.error('Error fetching order:', error)
    return null
  }

  return data as Order
}

async function getBankAccounts() {
  const supabase = await createClient()

  const { data } = await (supabase as any)
    .from('bank_accounts')
    .select('bank_name, account_name, account_number, branch, is_primary')
    .eq('is_active', true)
    .order('is_primary', { ascending: false })

  return data || []
}

async function getCustomerAddress(customerId: string) {
  const supabase = await createClient()

  const { data } = await (supabase as any)
    .from('profiles')
    .select('address')
    .eq('id', customerId)
    .single()

  return data?.address || null
}

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await getOrderForInvoice(id)

  if (!order) {
    notFound()
  }

  const [bankAccounts, customerAddress] = await Promise.all([
    getBankAccounts(),
    order.customer_id ? getCustomerAddress(order.customer_id) : null,
  ])

  // Transform order items
  const items = order.order_items.map((item) => ({
    name: item.product?.name || 'Product',
    sku: item.product?.sku || 'N/A',
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.total_price,
  }))

  // Generate invoice date once on server to avoid hydration mismatch
  const invoiceDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Generate invoice HTML
  const invoiceHtml = generateInvoiceEmail({
    orderNumber: order.order_number,
    orderId: order.id,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone,
    customerAddress,
    items,
    subtotal: order.subtotal,
    tax: order.tax || 0,
    discount: order.discount || 0,
    total: order.total,
    paymentStatus: order.payment_status,
    orderStatus: order.status,
    orderDate: order.created_at,
    invoiceDate,
    bankAccounts,
  })

  // Return the invoice HTML directly
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Print Button Bar */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b shadow-sm z-50 print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/admin/orders/${id}`}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Order
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-sm font-medium text-gray-900">
              Invoice INV-{order.order_number}
            </span>
          </div>
          <PrintButton />
        </div>
      </div>

      {/* Invoice Content */}
      <div className="pt-16 pb-8 print:pt-0 print:pb-0">
        <div
          className="max-w-[700px] mx-auto"
          dangerouslySetInnerHTML={{ __html: invoiceHtml }}
        />
      </div>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            margin: 0.5cm;
            size: A4;
          }
        }
      `}} />
    </div>
  )
}
