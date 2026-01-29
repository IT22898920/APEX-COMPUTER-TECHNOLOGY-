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

interface InvoiceData {
  orderNumber: string
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone?: string | null
  customerAddress?: string | null
  items: OrderItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentStatus: string
  orderStatus: string
  orderDate: string
  invoiceDate?: string // Pass pre-formatted date to avoid hydration mismatch
  bankAccounts: BankAccount[]
}

export function generateInvoiceEmail(data: InvoiceData): string {
  const {
    orderNumber,
    orderId,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    items,
    subtotal,
    tax,
    discount,
    total,
    paymentStatus,
    orderStatus,
    orderDate,
    invoiceDate: providedInvoiceDate,
    bankAccounts,
  } = data

  const invoiceNumber = `INV-${orderNumber}`
  // Use provided date or generate (for email sending where hydration doesn't matter)
  const invoiceDate = providedInvoiceDate || new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const formattedOrderDate = new Date(orderDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const isPaid = paymentStatus === 'paid'

  const itemsHtml = items
    .map(
      (item, index) => `
      <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'};">
        <td style="padding: 14px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px;">
          <strong style="color: #111827;">${item.name}</strong><br>
          <span style="color: #6b7280; font-size: 12px;">SKU: ${item.sku}</span>
        </td>
        <td style="padding: 14px 16px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #374151; font-size: 14px;">${item.quantity}</td>
        <td style="padding: 14px 16px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #374151; font-size: 14px;">${formatCurrency(item.unit_price)}</td>
        <td style="padding: 14px 16px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #111827; font-size: 14px;">${formatCurrency(item.total_price)}</td>
      </tr>
    `
    )
    .join('')

  const bankAccountsHtml = bankAccounts
    .map(
      (account) => `
      <div style="background-color: ${account.is_primary ? '#eff6ff' : '#f9fafb'}; border: 1px solid ${account.is_primary ? '#3b82f6' : '#e5e7eb'}; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
        <div style="font-weight: 600; margin-bottom: 8px; color: #111827;">
          ${account.bank_name}
          ${account.is_primary ? '<span style="background-color: #3b82f6; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-left: 8px;">Primary</span>' : ''}
        </div>
        <table style="width: 100%; font-size: 13px;">
          <tr><td style="color: #6b7280; padding: 3px 0; width: 120px;">Account Name:</td><td style="font-weight: 500; color: #111827;">${account.account_name}</td></tr>
          <tr><td style="color: #6b7280; padding: 3px 0;">Account Number:</td><td style="font-family: monospace; font-weight: 600; color: #111827; letter-spacing: 0.5px;">${account.account_number}</td></tr>
          ${account.branch ? `<tr><td style="color: #6b7280; padding: 3px 0;">Branch:</td><td style="font-weight: 500; color: #111827;">${account.branch}</td></tr>` : ''}
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
  <title>Invoice ${invoiceNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 650px; margin: 0 auto; padding: 24px;">

    <!-- Invoice Container -->
    <div style="background-color: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); overflow: hidden;">

      <!-- Header -->
      <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 32px; position: relative;">
        <table style="width: 100%;">
          <tr>
            <td>
              <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">APEX</h1>
              <p style="color: #93c5fd; margin: 4px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Computer Technology</p>
            </td>
            <td style="text-align: right;">
              <div style="background-color: rgba(255,255,255,0.15); border-radius: 8px; padding: 12px 16px; display: inline-block;">
                <p style="color: #bfdbfe; margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Invoice</p>
                <p style="color: white; margin: 4px 0 0 0; font-size: 18px; font-weight: 700;">${invoiceNumber}</p>
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Status Badge & Dates -->
      <div style="background-color: #f8fafc; padding: 20px 32px; border-bottom: 1px solid #e2e8f0;">
        <table style="width: 100%;">
          <tr>
            <td>
              <span style="background-color: ${isPaid ? '#dcfce7' : '#fef3c7'}; color: ${isPaid ? '#166534' : '#92400e'}; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                ${isPaid ? 'PAID' : paymentStatus === 'partial' ? 'PARTIALLY PAID' : 'PAYMENT PENDING'}
              </span>
            </td>
            <td style="text-align: right;">
              <table style="margin-left: auto;">
                <tr>
                  <td style="color: #64748b; font-size: 12px; padding-right: 12px;">Invoice Date:</td>
                  <td style="color: #111827; font-size: 13px; font-weight: 500;">${invoiceDate}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-size: 12px; padding-right: 12px;">Order Date:</td>
                  <td style="color: #111827; font-size: 13px; font-weight: 500;">${formattedOrderDate}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>

      <!-- Bill To / From -->
      <div style="padding: 28px 32px; border-bottom: 1px solid #e5e7eb;">
        <table style="width: 100%;">
          <tr>
            <td style="vertical-align: top; width: 50%;">
              <p style="color: #64748b; margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Bill From</p>
              <p style="margin: 0; color: #111827; font-weight: 600; font-size: 15px;">${COMPANY_INFO.name}</p>
              <p style="margin: 4px 0 0 0; color: #4b5563; font-size: 13px; line-height: 1.5;">
                ${COMPANY_INFO.address.street}<br>
                ${COMPANY_INFO.address.city}, ${COMPANY_INFO.address.country}
              </p>
              <p style="margin: 8px 0 0 0; color: #4b5563; font-size: 13px;">
                Tel: ${COMPANY_INFO.phone}<br>
                Email: ${COMPANY_INFO.email}
              </p>
            </td>
            <td style="vertical-align: top; width: 50%; padding-left: 24px;">
              <p style="color: #64748b; margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Bill To</p>
              <p style="margin: 0; color: #111827; font-weight: 600; font-size: 15px;">${customerName}</p>
              <p style="margin: 4px 0 0 0; color: #4b5563; font-size: 13px; line-height: 1.5;">
                ${customerEmail}
                ${customerPhone ? `<br>${customerPhone}` : ''}
                ${customerAddress ? `<br>${customerAddress}` : ''}
              </p>
            </td>
          </tr>
        </table>
      </div>

      <!-- Order Reference -->
      <div style="padding: 16px 32px; background-color: #f8fafc; border-bottom: 1px solid #e5e7eb;">
        <table style="width: 100%;">
          <tr>
            <td style="color: #64748b; font-size: 12px;">Order Reference:</td>
            <td style="color: #111827; font-size: 13px; font-weight: 600; font-family: monospace;">${orderNumber}</td>
            <td style="color: #64748b; font-size: 12px; text-align: right;">Status:</td>
            <td style="color: #111827; font-size: 13px; font-weight: 500; text-align: right; text-transform: capitalize;">${orderStatus}</td>
          </tr>
        </table>
      </div>

      <!-- Items Table -->
      <div style="padding: 0 32px 28px 32px; position: relative;">
        ${isPaid ? `
        <!-- PAID Stamp Watermark -->
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-15deg); z-index: 10; pointer-events: none;">
          <div style="border: 4px solid #22c55e; border-radius: 12px; padding: 8px 24px; background-color: rgba(255, 255, 255, 0.95);">
            <div style="text-align: center;">
              <span style="color: #22c55e; font-size: 42px; font-weight: 900; letter-spacing: 4px; text-transform: uppercase; font-family: Arial, sans-serif;">PAID</span>
            </div>
            <div style="border-top: 2px solid #22c55e; margin-top: 4px; padding-top: 4px; text-align: center;">
              <span style="color: #16a34a; font-size: 11px; font-weight: 600;">${invoiceDate}</span>
            </div>
          </div>
        </div>
        ` : ''}

        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #1e40af;">
              <th style="padding: 14px 16px; text-align: left; color: white; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; border-radius: 6px 0 0 0;">Description</th>
              <th style="padding: 14px 16px; text-align: center; color: white; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Qty</th>
              <th style="padding: 14px 16px; text-align: right; color: white; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Unit Price</th>
              <th style="padding: 14px 16px; text-align: right; color: white; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; border-radius: 0 6px 0 0;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Totals -->
        <div style="margin-top: 20px; padding-left: 50%;">
          <table style="width: 100%;">
            <tr>
              <td style="padding: 8px 16px; color: #6b7280; font-size: 14px;">Subtotal</td>
              <td style="padding: 8px 16px; text-align: right; color: #374151; font-size: 14px;">${formatCurrency(subtotal)}</td>
            </tr>
            ${tax > 0 ? `
            <tr>
              <td style="padding: 8px 16px; color: #6b7280; font-size: 14px;">Tax</td>
              <td style="padding: 8px 16px; text-align: right; color: #374151; font-size: 14px;">${formatCurrency(tax)}</td>
            </tr>
            ` : ''}
            ${discount > 0 ? `
            <tr>
              <td style="padding: 8px 16px; color: #16a34a; font-size: 14px;">Discount</td>
              <td style="padding: 8px 16px; text-align: right; color: #16a34a; font-size: 14px;">-${formatCurrency(discount)}</td>
            </tr>
            ` : ''}
            <tr>
              <td colspan="2" style="padding: 0;"><div style="border-top: 2px solid #e5e7eb; margin: 8px 0;"></div></td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; color: #111827; font-size: 16px; font-weight: 700;">Total Due</td>
              <td style="padding: 12px 16px; text-align: right; color: #1e40af; font-size: 20px; font-weight: 700;">${formatCurrency(total)}</td>
            </tr>
          </table>
        </div>
      </div>

      ${!isPaid ? `
      <!-- Payment Instructions -->
      <div style="padding: 28px 32px; background-color: #f8fafc; border-top: 1px solid #e5e7eb;">
        <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 15px; font-weight: 600;">Payment Instructions</h3>
        <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 13px; line-height: 1.5;">
          Please transfer the total amount to one of our bank accounts below:
        </p>
        ${bankAccounts.length > 0 ? bankAccountsHtml : '<p style="color: #6b7280; font-size: 13px;">Please contact us for payment details.</p>'}

        <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 14px 16px; margin-top: 16px;">
          <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.5;">
            <strong>Important:</strong> Please include order reference <strong style="font-family: monospace; background-color: #fde68a; padding: 2px 6px; border-radius: 4px;">${orderNumber}</strong> when making the transfer.
          </p>
        </div>

        <div style="text-align: center; margin-top: 24px;">
          <a href="${APP_URL}/orders/${orderId}/confirmation" style="display: inline-block; background-color: #1e40af; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
            Upload Payment Receipt
          </a>
        </div>
      </div>
      ` : `
      <!-- Paid Confirmation -->
      <div style="padding: 32px; background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border-top: 1px solid #86efac; text-align: center;">
        <div style="display: inline-block; border: 3px solid #16a34a; border-radius: 50%; width: 80px; height: 80px; line-height: 74px; margin-bottom: 16px; background-color: white;">
          <span style="color: #16a34a; font-size: 42px; font-weight: bold;">&#10003;</span>
        </div>
        <h3 style="margin: 0; color: #166534; font-size: 20px; font-weight: 700;">Payment Received</h3>
        <p style="margin: 12px 0 0 0; color: #15803d; font-size: 14px;">Thank you for your payment!</p>
        <div style="margin-top: 20px; display: inline-block; background-color: white; border-radius: 8px; padding: 12px 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="margin: 0; color: #374151; font-size: 13px;">Amount Paid</p>
          <p style="margin: 4px 0 0 0; color: #166534; font-size: 24px; font-weight: 700;">${formatCurrency(total)}</p>
        </div>
      </div>
      `}

      <!-- Footer -->
      <div style="padding: 24px 32px; background-color: #1f2937; text-align: center;">
        <p style="color: #e5e7eb; margin: 0; font-size: 14px; font-weight: 500;">${COMPANY_INFO.name}</p>
        <p style="color: #9ca3af; margin: 8px 0 0 0; font-size: 12px; line-height: 1.5;">
          ${COMPANY_INFO.address.street}, ${COMPANY_INFO.address.city}, ${COMPANY_INFO.address.country}
        </p>
        <p style="color: #9ca3af; margin: 8px 0 0 0; font-size: 12px;">
          ${COMPANY_INFO.workingHours}
        </p>
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #374151;">
          <p style="color: #6b7280; margin: 0; font-size: 11px;">
            This is a computer-generated invoice. For any queries, please contact us at ${COMPANY_INFO.email}
          </p>
        </div>
      </div>

    </div>

    <!-- Print Notice -->
    <p style="text-align: center; color: #9ca3af; font-size: 11px; margin-top: 16px;">
      Save this email or print it for your records.
    </p>

  </div>
</body>
</html>
`
}
