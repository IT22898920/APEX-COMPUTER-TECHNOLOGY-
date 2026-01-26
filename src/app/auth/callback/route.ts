import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect')

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // If a specific redirect was requested, use it
      if (redirect && redirect !== '/dashboard') {
        return NextResponse.redirect(`${origin}${redirect}`)
      }

      // Otherwise, check user role and redirect accordingly
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase.from('profiles') as any)
        .select('role')
        .eq('id', data.user.id)
        .single()

      const role = (profile as { role?: string })?.role

      // Customers go to home page, admin/staff go to their dashboards
      if (role === 'customer') {
        return NextResponse.redirect(`${origin}/`)
      } else if (role === 'admin') {
        return NextResponse.redirect(`${origin}/admin`)
      } else if (role === 'staff') {
        return NextResponse.redirect(`${origin}/staff`)
      }

      // Default fallback to home
      return NextResponse.redirect(`${origin}/`)
    }
  }

  // Redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
