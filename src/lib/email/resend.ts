import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY

console.log('[Email] RESEND_API_KEY configured:', !!resendApiKey)

export const resend = resendApiKey ? new Resend(resendApiKey) : null

export async function sendEmail({
  to,
  subject,
  html,
  from = 'APEX Computer Technology <onboarding@resend.dev>',
}: {
  to: string | string[]
  subject: string
  html: string
  from?: string
}) {
  console.log('[Email] Attempting to send email to:', to)

  if (!resend) {
    console.error('[Email] RESEND_API_KEY not configured!')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    console.log('[Email] Sending via Resend...')
    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    })

    if (error) {
      console.error('[Email] Resend error:', error)
      return { success: false, error: error.message }
    }

    console.log('[Email] Sent successfully! ID:', data?.id)
    return { success: true, data }
  } catch (err) {
    console.error('[Email] Exception:', err)
    return { success: false, error: 'Failed to send email' }
  }
}
