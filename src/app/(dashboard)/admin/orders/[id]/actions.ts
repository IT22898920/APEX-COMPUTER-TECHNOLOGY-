'use server'

import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/resend'
import { generatePaymentVerifiedEmail, generatePaymentRejectedEmail } from '@/lib/email/templates/payment-status'
import { generateInvoiceEmail } from '@/lib/email/templates/invoice'
import { revalidatePath } from 'next/cache'

interface VerifyReceiptInput {
  receiptId: string
  orderId: string
}

interface RejectReceiptInput {
  receiptId: string
  orderId: string
  rejectionReason: string
}

export async function verifyReceipt(input: VerifyReceiptInput) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get receipt details
  const { data: receipt, error: receiptError } = await (supabase as any)
    .from('payment_receipts')
    .select('*, orders(order_number, customer_email, customer_name, customer_phone, total)')
    .eq('id', input.receiptId)
    .single()

  if (receiptError || !receipt) {
    console.error('Receipt fetch error:', receiptError)
    return { success: false, error: 'Receipt not found' }
  }

  console.log('[Verify] Customer phone:', receipt.orders?.customer_phone)

  // Update receipt status
  const { error: updateError } = await (supabase as any)
    .from('payment_receipts')
    .update({
      status: 'verified',
      verified_by: user.id,
      verified_at: new Date().toISOString(),
    })
    .eq('id', input.receiptId)

  if (updateError) {
    return { success: false, error: 'Failed to verify receipt' }
  }

  // Update order payment status
  await (supabase as any)
    .from('orders')
    .update({ payment_status: 'paid' })
    .eq('id', input.orderId)

  // Send email notification
  const emailHtml = generatePaymentVerifiedEmail({
    customerName: receipt.orders.customer_name,
    orderNumber: receipt.orders.order_number,
    orderId: input.orderId,
    amount: receipt.amount || receipt.orders.total,
    status: 'verified',
  })

  await sendEmail({
    to: receipt.orders.customer_email,
    subject: `Payment Verified - Order #${receipt.orders.order_number} | APEX Computer Technology`,
    html: emailHtml,
  })

  revalidatePath(`/admin/orders/${input.orderId}`)

  return {
    success: true,
    customerPhone: receipt.orders?.customer_phone,
    customerName: receipt.orders?.customer_name,
    orderNumber: receipt.orders?.order_number,
  }
}

export async function rejectReceipt(input: RejectReceiptInput) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get receipt details
  const { data: receipt, error: receiptError } = await (supabase as any)
    .from('payment_receipts')
    .select('*, orders(order_number, customer_email, customer_name, total, customer_phone)')
    .eq('id', input.receiptId)
    .single()

  if (receiptError || !receipt) {
    return { success: false, error: 'Receipt not found' }
  }

  // Update receipt status
  const { error: updateError } = await (supabase as any)
    .from('payment_receipts')
    .update({
      status: 'rejected',
      rejection_reason: input.rejectionReason,
      verified_by: user.id,
      verified_at: new Date().toISOString(),
    })
    .eq('id', input.receiptId)

  if (updateError) {
    return { success: false, error: 'Failed to reject receipt' }
  }

  // Send email notification
  const emailHtml = generatePaymentRejectedEmail({
    customerName: receipt.orders.customer_name,
    orderNumber: receipt.orders.order_number,
    orderId: input.orderId,
    amount: receipt.amount || receipt.orders.total,
    status: 'rejected',
    rejectionReason: input.rejectionReason,
  })

  await sendEmail({
    to: receipt.orders.customer_email,
    subject: `Payment Issue - Order #${receipt.orders.order_number} | APEX Computer Technology`,
    html: emailHtml,
  })

  revalidatePath(`/admin/orders/${input.orderId}`)

  return {
    success: true,
    customerPhone: receipt.orders?.customer_phone,
    customerName: receipt.orders?.customer_name,
    orderNumber: receipt.orders?.order_number,
  }
}

// Update order status
interface UpdateOrderStatusInput {
  orderId: string
  status?: string
  paymentStatus?: string
}

export async function updateOrderStatus(input: UpdateOrderStatusInput) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get order details first
  const { data: order, error: orderError } = await (supabase as any)
    .from('orders')
    .select('order_number, customer_phone, customer_name, status, payment_status')
    .eq('id', input.orderId)
    .single()

  if (orderError || !order) {
    return { success: false, error: 'Order not found' }
  }

  // Build update object
  const updates: Record<string, string> = {}
  if (input.status && input.status !== order.status) {
    updates.status = input.status
  }
  if (input.paymentStatus && input.paymentStatus !== order.payment_status) {
    updates.payment_status = input.paymentStatus
  }

  if (Object.keys(updates).length === 0) {
    return { success: true, message: 'No changes' }
  }

  // Update order
  const { error: updateError } = await (supabase as any)
    .from('orders')
    .update(updates)
    .eq('id', input.orderId)

  if (updateError) {
    return { success: false, error: 'Failed to update order' }
  }

  revalidatePath(`/admin/orders/${input.orderId}`)

  return { success: true }
}

// Send invoice to customer
export async function sendInvoiceEmail(orderId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get order with items
  const { data: order, error: orderError } = await (supabase as any)
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
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    console.error('Order fetch error:', orderError)
    return { success: false, error: 'Order not found' }
  }

  // Get customer profile for additional details
  let customerAddress: string | null = null
  if (order.customer_id) {
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('address')
      .eq('id', order.customer_id)
      .single()

    if (profile?.address) {
      customerAddress = profile.address
    }
  }

  // Get bank accounts
  const { data: bankAccounts } = await (supabase as any)
    .from('bank_accounts')
    .select('bank_name, account_name, account_number, branch, is_primary')
    .eq('is_active', true)
    .order('is_primary', { ascending: false })

  // Transform order items
  const items = order.order_items.map((item: any) => ({
    name: item.product?.name || 'Product',
    sku: item.product?.sku || 'N/A',
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.total_price,
  }))

  // Generate invoice email
  const emailHtml = generateInvoiceEmail({
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
    bankAccounts: bankAccounts || [],
  })

  // Send email
  const result = await sendEmail({
    to: order.customer_email,
    subject: `Invoice INV-${order.order_number} | APEX Computer Technology`,
    html: emailHtml,
  })

  if (!result.success) {
    console.error('Email send error:', result.error)
    return { success: false, error: result.error || 'Failed to send email' }
  }

  return {
    success: true,
    message: `Invoice sent to ${order.customer_email}`,
    customerEmail: order.customer_email,
  }
}
