import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Route configuration
const publicRoutes = ['/', '/about', '/services', '/products', '/contact']
const authRoutes = ['/login', '/register', '/forgot-password', '/verify', '/auth/callback', '/auth/signout']
const protectedRoutes = ['/dashboard', '/admin', '/staff', '/customer']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Update session and get user
  const { supabaseResponse, user, supabase } = await updateSession(request)

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith('/products/')
  )

  // Check if route is auth-related
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Allow public routes
  if (isPublicRoute) {
    return supabaseResponse
  }

  // Redirect authenticated users away from auth pages (except signout)
  if (isAuthRoute && user && !pathname.startsWith('/auth/signout')) {
    // Get user role and redirect to appropriate dashboard
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'customer'
    const redirectUrl = role === 'admin'
      ? '/admin'
      : role === 'staff'
        ? '/staff'
        : '/customer'

    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  // Allow auth routes for unauthenticated users
  if (isAuthRoute) {
    return supabaseResponse
  }

  // Protect dashboard routes
  if (isProtectedRoute) {
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Get user profile for role-based routing
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, staff_type')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'customer'
    const staffType = profile?.staff_type

    // Handle /dashboard redirect based on role
    if (pathname === '/dashboard') {
      const redirectUrl = role === 'admin'
        ? '/admin'
        : role === 'staff'
          ? '/staff'
          : '/customer'
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }

    // Role-based access control
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (pathname.startsWith('/staff') && role !== 'staff' && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (pathname.startsWith('/customer') && role !== 'customer' && role !== 'admin') {
      // Admin can access customer routes for support
      if (role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // Staff type restrictions
    if (role === 'staff' && pathname.startsWith('/staff')) {
      const technicianRoutes = ['/staff/tickets']
      const marketingRoutes = ['/staff/inventory', '/staff/orders']

      const isTechnicianRoute = technicianRoutes.some(r => pathname.startsWith(r))
      const isMarketingRoute = marketingRoutes.some(r => pathname.startsWith(r))

      if (isTechnicianRoute && staffType !== 'technician' && staffType !== 'support') {
        return NextResponse.redirect(new URL('/staff', request.url))
      }

      if (isMarketingRoute && staffType !== 'marketing' && staffType !== 'support') {
        return NextResponse.redirect(new URL('/staff', request.url))
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)',
  ],
}
