import { COMPANY_INFO, APP_URL } from '@/lib/utils/constants'
import { formatCurrency } from '@/lib/utils/format'

interface OrderItem {
  name: string
  sku: string
  quantity: number
  unit_price: number
  total_price: number
}

interface BankAccount {
  bank_name: string
  account_name: string
  account_number: string
  branch?: string | null
  is_primary: boolean
}

interface OrderConfirmationData {
  orderNumber: string
  orderId: string
  customerName: string
  items: OrderItem[]
  subtotal: number
  total: number
  notes?: string | null
  bankAccounts: BankAccount[]
}

export function generateOrderConfirmationEmail(data: OrderConfirmationData): string {
  const { orderNumber, orderId, customerName, items, subtotal, total, notes, bankAccounts } = data

  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <strong>${item.name}</strong><br>
          <span style="color: #6b7280; font-size: 14px;">SKU: ${item.sku}</span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.unit_price)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${formatCurrency(item.total_price)}</td>
      </tr>
    `
    )
    .join('')

  const bankAccountsHtml = bankAccounts
    .map(
      (account) => `
      <div style="background-color: ${account.is_primary ? '#eff6ff' : '#f9fafb'}; border: 1px solid ${account.is_primary ? '#3b82f6' : '#e5e7eb'}; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
        <div style="font-weight: 600; margin-bottom: 8px;">
          ${account.bank_name}
          ${account.is_primary ? '<span style="background-color: #3b82f6; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-left: 8px;">Primary</span>' : ''}
        </div>
        <table style="width: 100%; font-size: 14px;">
          <tr><td style="color: #6b7280; padding: 4px 0;">Account Name:</td><td style="font-weight: 500;">${account.account_name}</td></tr>
          <tr><td style="color: #6b7280; padding: 4px 0;">Account Number:</td><td style="font-family: monospace; font-weight: 500;">${account.account_number}</td></tr>
          ${account.branch ? `<tr><td style="color: #6b7280; padding: 4px 0;">Branch:</td><td style="font-weight: 500;">${account.branch}</td></tr>` : ''}
        </table>
      </div>
    `
    )
    .join('')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - ${orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">

    <!-- Header -->
    <div style="background-color: #1e40af; border-radius: 12px 12px 0 0; padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">APEX Computer Technology</h1>
      <p style="color: #93c5fd; margin: 8px 0 0 0; font-size: 14px;">${COMPANY_INFO.tagline}</p>
    </div>

    <!-- Success Banner -->
    <div style="background-color: #dcfce7; padding: 24px; text-align: center; border-bottom: 1px solid #bbf7d0;">
      <div style="font-size: 48px; margin-bottom: 8px;">✓</div>
      <h2 style="color: #166534; margin: 0; font-size: 20px;">Order Placed Successfully!</h2>
      <p style="color: #15803d; margin: 8px 0 0 0;">Order #${orderNumber}</p>
    </div>

    <!-- Main Content -->
    <div style="background-color: white; padding: 32px;">

      <p style="margin: 0 0 24px 0; color: #374151;">Dear <strong>${customerName}</strong>,</p>

      <p style="margin: 0 0 24px 0; color: #374151;">
        Thank you for your order! We've received your request and it's now being processed.
        Please complete the payment to confirm your order.
      </p>

      <!-- Order Summary -->
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #111827;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #e5e7eb;">
              <th style="padding: 12px; text-align: left; font-weight: 600;">Product</th>
              <th style="padding: 12px; text-align: center; font-weight: 600;">Qty</th>
              <th style="padding: 12px; text-align: right; font-weight: 600;">Price</th>
              <th style="padding: 12px; text-align: right; font-weight: 600;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 12px; text-align: right; color: #6b7280;">Subtotal:</td>
              <td style="padding: 12px; text-align: right;">${formatCurrency(subtotal)}</td>
            </tr>
            <tr style="font-size: 18px; font-weight: bold;">
              <td colspan="3" style="padding: 12px; text-align: right; color: #111827;">Total:</td>
              <td style="padding: 12px; text-align: right; color: #1e40af;">${formatCurrency(total)}</td>
            </tr>
          </tfoot>
        </table>
        ${notes ? `<p style="margin: 16px 0 0 0; color: #6b7280; font-size: 14px;"><strong>Notes:</strong> ${notes}</p>` : ''}
      </div>

      <!-- Payment Instructions -->
      <div style="margin-bottom: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #111827;">Payment Instructions</h3>
        <p style="margin: 0 0 16px 0; color: #374151;">
          Please transfer the total amount to one of our bank accounts below:
        </p>
        ${bankAccounts.length > 0 ? bankAccountsHtml : '<p style="color: #6b7280;">Payment details will be shared shortly. Please contact us for more information.</p>'}

        <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-top: 16px;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            <strong>Important:</strong> Please include your order number <strong style="font-family: monospace;">${orderNumber}</strong> as the payment reference when making the transfer.
          </p>
        </div>
      </div>

      <!-- Upload Receipt CTA -->
      <div style="text-align: center; margin-bottom: 24px;">
        <p style="margin: 0 0 16px 0; color: #374151;">
          After making the payment, upload your receipt for quick verification:
        </p>
        <a href="${APP_URL}/orders/${orderId}/confirmation" style="display: inline-block; background-color: #1e40af; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Upload Payment Receipt
        </a>
      </div>

      <!-- Need Help -->
      <div style="border-top: 1px solid #e5e7eb; padding-top: 24px;">
        <h3 style="margin: 0 0 12px 0; color: #111827;">Need Help?</h3>
        <p style="margin: 0; color: #374151; font-size: 14px;">
          Contact us at <a href="tel:${COMPANY_INFO.phone}" style="color: #1e40af;">${COMPANY_INFO.phone}</a> or
          <a href="mailto:${COMPANY_INFO.email}" style="color: #1e40af;">${COMPANY_INFO.email}</a>
        </p>
      </div>

    </div>

    <!-- Footer -->
    <div style="background-color: #1f2937; border-radius: 0 0 12px 12px; padding: 24px; text-align: center;">
      <p style="color: #9ca3af; margin: 0 0 8px 0; font-size: 14px;">${COMPANY_INFO.name}</p>
      <p style="color: #6b7280; margin: 0; font-size: 12px;">
        ${COMPANY_INFO.address.street}, ${COMPANY_INFO.address.city}, ${COMPANY_INFO.address.country}
      </p>
      <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 12px;">
        ${COMPANY_INFO.workingHours}
      </p>
    </div>

  </div>
</body>
</html>
`
}
