'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendEmail } from '@/lib/email/resend'
import { generateOrderConfirmationEmail } from '@/lib/email/templates/order-confirmation'

interface InquiryItem {
  id: string
  name: string
  sku: string
  price: number
  quantity: number
}

interface SubmitInquiryInput {
  items: InquiryItem[]
  customerNotes?: string
}

export async function submitInquiry(input: SubmitInquiryInput) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get user profile
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('full_name, phone')
    .eq('id', user.id)
    .single()

  // Calculate totals
  const subtotal = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = subtotal // No tax/discount for now

  // Create order
  const { data: order, error: orderError } = await (supabase as any)
    .from('orders')
    .insert({
      customer_id: user.id,
      customer_name: profile?.full_name || user.email,
      customer_email: user.email,
      customer_phone: profile?.phone,
      status: 'pending',
      subtotal,
      tax: 0,
      discount: 0,
      total,
      payment_status: 'pending',
      notes: input.customerNotes || null,
      created_by: user.id,
    })
    .select('id, order_number')
    .single()

  if (orderError) {
    console.error('Error creating order:', orderError)
    return { success: false, error: `Failed to create order: ${orderError.message}` }
  }

  // Create order items
  const orderItems = input.items.map((item) => ({
    order_id: order.id,
    product_id: item.id,
    quantity: item.quantity,
    unit_price: item.price,
    total_price: item.price * item.quantity,
  }))

  const { error: itemsError } = await (supabase as any)
    .from('order_items')
    .insert(orderItems)

  if (itemsError) {
    console.error('Error creating order items:', itemsError)
    // Delete the order if items failed
    await (supabase as any).from('orders').delete().eq('id', order.id)
    return { success: false, error: 'Failed to create order items' }
  }

  // Get bank accounts for email
  const bankAccounts = await getBankAccounts()

  // Send order confirmation email
  const emailItems = input.items.map((item) => ({
    name: item.name,
    sku: item.sku,
    quantity: item.quantity,
    unit_price: item.price,
    total_price: item.price * item.quantity,
  }))

  const emailHtml = generateOrderConfirmationEmail({
    orderNumber: order.order_number,
    orderId: order.id,
    customerName: profile?.full_name || user.email || 'Customer',
    items: emailItems,
    subtotal,
    total,
    notes: input.customerNotes,
    bankAccounts: bankAccounts.map((acc: any) => ({
      bank_name: acc.bank_name,
      account_name: acc.account_name,
      account_number: acc.account_number,
      branch: acc.branch,
      is_primary: acc.is_primary,
    })),
  })

  // Send email (don't block order completion if email fails)
  console.log('[Order] Sending confirmation email to:', user.email)

  // Await the email to ensure it's sent before the function returns
  const emailResult = await sendEmail({
    to: user.email!,
    subject: `Order Confirmation - ${order.order_number} | APEX Computer Technology`,
    html: emailHtml,
  })

  if (!emailResult.success) {
    console.error('[Order] Failed to send confirmation email:', emailResult.error)
  } else {
    console.log('[Order] Confirmation email sent successfully')
  }

  revalidatePath('/customer')

  return {
    success: true,
    orderId: order.id,
    orderNumber: order.order_number,
  }
}

export async function getBankAccounts() {
  const supabase = await createClient()

  const { data, error } = await (supabase
    .from('bank_accounts')
    .select('*')
    .eq('is_active', true)
    .order('is_primary', { ascending: false })
    .order('display_order', { ascending: true }) as any)

  if (error) {
    console.error('Error fetching bank accounts:', error)
    return []
  }

  return data || []
}

export async function uploadPaymentReceipt(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const file = formData.get('file') as File
  const orderId = formData.get('orderId') as string
  const amount = formData.get('amount') as string
  const paymentDate = formData.get('paymentDate') as string
  const bankReference = formData.get('bankReference') as string

  if (!file || !orderId) {
    return { success: false, error: 'Missing required fields' }
  }

  // Upload file to storage
  const fileExt = file.name.split('.').pop()
  const fileName = `${orderId}/${Date.now()}.${fileExt}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('payment-receipts')
    .upload(fileName, file)

  if (uploadError) {
    console.error('Error uploading file:', uploadError)
    return { success: false, error: 'Failed to upload file' }
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('payment-receipts')
    .getPublicUrl(fileName)

  // Create payment receipt record
  const { error: receiptError } = await (supabase as any)
    .from('payment_receipts')
    .insert({
      order_id: orderId,
      customer_id: user.id,
      receipt_url: publicUrl,
      amount: amount ? parseFloat(amount) : null,
      payment_date: paymentDate || null,
      bank_reference: bankReference || null,
      status: 'pending',
    })

  if (receiptError) {
    console.error('Error creating receipt record:', receiptError)
    return { success: false, error: 'Failed to save receipt' }
  }

  revalidatePath(`/orders/${orderId}`)

  return { success: true }
}
