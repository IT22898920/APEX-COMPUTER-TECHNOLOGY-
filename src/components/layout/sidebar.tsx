'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Ticket,
  FileText,
  BarChart3,
  Settings,
  Package,
  ShoppingCart,
  History,
  User,
  LogOut,
  ChevronLeft,
  FolderTree,
  Briefcase,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useUser } from '@/lib/hooks/use-user'
import { getInitials } from '@/lib/utils/format'
import {
  ADMIN_NAV_ITEMS,
  STAFF_NAV_ITEMS,
  CUSTOMER_NAV_ITEMS,
} from '@/lib/utils/constants'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Users,
  Ticket,
  FileText,
  BarChart3,
  Settings,
  Package,
  ShoppingCart,
  History,
  User,
  FolderTree,
  Briefcase,
}

interface SidebarProps {
  collapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
}

export function Sidebar({ collapsed = false, onCollapse }: SidebarProps) {
  const pathname = usePathname()
  const { session, profile, signOut, isAdmin, isStaff, isLoading } = useUser()

  // Get navigation items based on role
  const getNavItems = () => {
    // While loading, determine from URL path
    if (isLoading) {
      if (pathname.startsWith('/admin')) return ADMIN_NAV_ITEMS
      if (pathname.startsWith('/staff')) return STAFF_NAV_ITEMS.support
      return CUSTOMER_NAV_ITEMS
    }

    if (isAdmin) return ADMIN_NAV_ITEMS
    if (isStaff) {
      const staffType = session?.staffType || profile?.staff_type
      if (staffType) {
        return STAFF_NAV_ITEMS[staffType as keyof typeof STAFF_NAV_ITEMS] || STAFF_NAV_ITEMS.support
      }
      return STAFF_NAV_ITEMS.support
    }
    return CUSTOMER_NAV_ITEMS
  }

  const navItems = getNavItems()

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r bg-card transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="APEX"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
            <span className="font-bold text-lg">Apex Computer</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="mx-auto">
            <Image
              src="/logo.png"
              alt="APEX"
              width={36}
              height={36}
              className="h-9 w-auto"
            />
          </Link>
        )}
        {onCollapse && (
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-8 w-8', collapsed && 'mx-auto')}
            onClick={() => onCollapse(!collapsed)}
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-auto p-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon as string] || LayoutDashboard
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    collapsed && 'justify-center px-2'
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="border-t p-2">
        {session && (
          <div className={cn('flex items-center gap-3 rounded-lg p-2', collapsed && 'justify-center')}>
            <Avatar className="h-8 w-8">
              <AvatarImage src={session.avatarUrl} />
              <AvatarFallback>{getInitials(session.fullName)}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">{session.fullName}</p>
                <p className="truncate text-xs text-muted-foreground capitalize">{session.role}</p>
              </div>
            )}
          </div>
        )}

        <Separator className="my-2" />

        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-3 text-muted-foreground hover:text-foreground',
            collapsed && 'justify-center px-2'
          )}
          onClick={signOut}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </div>
    </aside>
  )
}
