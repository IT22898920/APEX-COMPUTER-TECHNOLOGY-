import { COMPANY_INFO, APP_URL } from '@/lib/utils/constants'
import { formatCurrency } from '@/lib/utils/format'

interface PaymentStatusData {
  customerName: string
  orderNumber: string
  orderId: string
  amount: number
  status: 'verified' | 'rejected'
  rejectionReason?: string
}

export function generatePaymentVerifiedEmail(data: PaymentStatusData): string {
  const { customerName, orderNumber, orderId, amount } = data

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Verified - ${orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">

    <!-- Header -->
    <div style="background-color: #1e40af; border-radius: 12px 12px 0 0; padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">APEX Computer Technology</h1>
    </div>

    <!-- Success Banner -->
    <div style="background-color: #dcfce7; padding: 24px; text-align: center; border-bottom: 1px solid #bbf7d0;">
      <div style="font-size: 48px; margin-bottom: 8px;">✓</div>
      <h2 style="color: #166534; margin: 0; font-size: 20px;">Payment Verified!</h2>
      <p style="color: #15803d; margin: 8px 0 0 0;">Your payment has been confirmed</p>
    </div>

    <!-- Main Content -->
    <div style="background-color: white; padding: 32px;">
      <p style="margin: 0 0 24px 0; color: #374151;">Dear <strong>${customerName}</strong>,</p>

      <p style="margin: 0 0 24px 0; color: #374151;">
        Great news! We have verified your payment for order <strong>#${orderNumber}</strong>.
      </p>

      <div style="background-color: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <table style="width: 100%;">
          <tr>
            <td style="color: #6b7280; padding: 4px 0;">Order Number:</td>
            <td style="font-weight: 600; text-align: right;">#${orderNumber}</td>
          </tr>
          <tr>
            <td style="color: #6b7280; padding: 4px 0;">Amount Verified:</td>
            <td style="font-weight: 600; text-align: right; color: #16a34a;">${formatCurrency(amount)}</td>
          </tr>
          <tr>
            <td style="color: #6b7280; padding: 4px 0;">Status:</td>
            <td style="font-weight: 600; text-align: right; color: #16a34a;">PAID</td>
          </tr>
        </table>
      </div>

      <p style="margin: 0 0 24px 0; color: #374151;">
        Your order is now being processed and will be prepared for delivery/pickup soon.
        We will notify you once your order is ready.
      </p>

      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${APP_URL}/orders/${orderId}/confirmation" style="display: inline-block; background-color: #1e40af; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
          View Order Details
        </a>
      </div>

      <div style="border-top: 1px solid #e5e7eb; padding-top: 24px;">
        <p style="margin: 0; color: #374151; font-size: 14px;">
          Thank you for shopping with us!<br>
          If you have any questions, contact us at <a href="tel:${COMPANY_INFO.phone}" style="color: #1e40af;">${COMPANY_INFO.phone}</a>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #1f2937; border-radius: 0 0 12px 12px; padding: 24px; text-align: center;">
      <p style="color: #9ca3af; margin: 0; font-size: 14px;">${COMPANY_INFO.name}</p>
      <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 12px;">
        ${COMPANY_INFO.address.street}, ${COMPANY_INFO.address.city}
      </p>
    </div>

  </div>
</body>
</html>
`
}

export function generatePaymentRejectedEmail(data: PaymentStatusData): string {
  const { customerName, orderNumber, orderId, amount, rejectionReason } = data

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Issue - ${orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">

    <!-- Header -->
    <div style="background-color: #1e40af; border-radius: 12px 12px 0 0; padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">APEX Computer Technology</h1>
    </div>

    <!-- Alert Banner -->
    <div style="background-color: #fef2f2; padding: 24px; text-align: center; border-bottom: 1px solid #fecaca;">
      <div style="font-size: 48px; margin-bottom: 8px;">⚠️</div>
      <h2 style="color: #dc2626; margin: 0; font-size: 20px;">Payment Receipt Issue</h2>
      <p style="color: #b91c1c; margin: 8px 0 0 0;">Action required</p>
    </div>

    <!-- Main Content -->
    <div style="background-color: white; padding: 32px;">
      <p style="margin: 0 0 24px 0; color: #374151;">Dear <strong>${customerName}</strong>,</p>

      <p style="margin: 0 0 24px 0; color: #374151;">
        We were unable to verify your payment receipt for order <strong>#${orderNumber}</strong>.
      </p>

      <div style="background-color: #fef2f2; border: 1px solid #ef4444; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 12px 0; color: #991b1b; font-weight: 600;">Reason for rejection:</p>
        <p style="margin: 0; color: #7f1d1d;">${rejectionReason || 'No reason provided'}</p>
      </div>

      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <table style="width: 100%;">
          <tr>
            <td style="color: #6b7280; padding: 4px 0;">Order Number:</td>
            <td style="font-weight: 600; text-align: right;">#${orderNumber}</td>
          </tr>
          <tr>
            <td style="color: #6b7280; padding: 4px 0;">Amount:</td>
            <td style="font-weight: 600; text-align: right;">${formatCurrency(amount)}</td>
          </tr>
        </table>
      </div>

      <p style="margin: 0 0 24px 0; color: #374151;">
        <strong>What to do next:</strong><br>
        Please upload a clear photo or scan of your payment receipt. Make sure the following details are visible:
      </p>

      <ul style="margin: 0 0 24px 0; color: #374151; padding-left: 20px;">
        <li>Transaction date and time</li>
        <li>Amount transferred</li>
        <li>Bank reference number</li>
        <li>Recipient account details</li>
      </ul>

      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${APP_URL}/orders/${orderId}/confirmation" style="display: inline-block; background-color: #1e40af; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Upload New Receipt
        </a>
      </div>

      <div style="border-top: 1px solid #e5e7eb; padding-top: 24px;">
        <p style="margin: 0; color: #374151; font-size: 14px;">
          Need help? Contact us at <a href="tel:${COMPANY_INFO.phone}" style="color: #1e40af;">${COMPANY_INFO.phone}</a> or
          <a href="https://wa.me/${COMPANY_INFO.whatsapp}" style="color: #25D366;">WhatsApp</a>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #1f2937; border-radius: 0 0 12px 12px; padding: 24px; text-align: center;">
      <p style="color: #9ca3af; margin: 0; font-size: 14px;">${COMPANY_INFO.name}</p>
      <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 12px;">
        ${COMPANY_INFO.address.street}, ${COMPANY_INFO.address.city}
      </p>
    </div>

  </div>
</body>
</html>
`
}
