# APEX Computer Technology - Project Guide

## Project Overview

A comprehensive Service & Sales Management System for a computer technology company in Sri Lanka. Built with Next.js 15, Supabase, and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email/Password, Magic Link, Google OAuth)
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **State Management**: React hooks + Supabase real-time
- **Validation**: Zod schemas
- **Icons**: Lucide React

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages (login, register)
│   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── admin/         # Admin panel pages
│   │   ├── staff/         # Staff panel pages
│   │   └── customer/      # Customer portal pages
│   └── (public)/          # Public pages (home, products, etc.)
├── components/
│   ├── layout/            # Layout components (sidebar, header, footer)
│   ├── ui/                # shadcn/ui components
│   └── sections/          # Page sections (hero, services, etc.)
├── lib/
│   ├── supabase/          # Supabase clients (client, server, admin, middleware)
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── validations/       # Zod validation schemas
│   └── auth/              # Authentication utilities
└── types/                 # TypeScript type definitions
```

## User Roles & Permissions

### Admin
- Full system access
- User management (create, edit, delete, change roles)
- Product management
- Order management
- Service ticket oversight
- Reports & analytics

### Staff (3 types)
- **Technician**: Service tickets, repairs
- **Marketing**: Products, inventory, orders
- **Support**: Customer service, ticket handling

### Customer
- View/create service tickets
- View orders and order history
- Manage profile

## Database Schema

### Core Tables
- `profiles` - User profiles (extends auth.users)
- `products` - Product catalog
- `categories` - Product categories
- `orders` - Customer orders
- `order_items` - Order line items
- `service_agreements` - Customer service contracts
- `service_tickets` - Service/repair tickets
- `ticket_notes` - Notes on tickets
- `ticket_history` - Ticket change logs
- `notifications` - User notifications
- `inventory_logs` - Stock movement tracking

### Key Database Features
- Row Level Security (RLS) on all tables
- Auto-generated ticket/order numbers
- SLA deadline calculation
- Inventory auto-deduction on orders/repairs

## Security Implementation

### Headers (next.config.ts)
- Strict-Transport-Security
- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection
- Referrer-Policy

### Authentication
- Strong password policy (8+ chars, uppercase, lowercase, number, special char)
- Rate limiting (60 req/min per user)
- Session management via Supabase

### Authorization
- Middleware-based route protection
- Role-based access control
- Server action authorization checks

## Important Files

### Configuration
- `.env.local` - Environment variables (DO NOT COMMIT)
- `next.config.ts` - Next.js config with security headers
- `tailwind.config.ts` - Tailwind configuration
- `components.json` - shadcn/ui configuration

### Supabase Clients
- `src/lib/supabase/client.ts` - Browser client
- `src/lib/supabase/server.ts` - Server component client
- `src/lib/supabase/admin.ts` - Service role client (admin ops)
- `src/lib/supabase/middleware.ts` - Middleware client

### Key Hooks
- `src/lib/hooks/use-user.ts` - User session & profile management

### Validation Schemas
- `src/lib/validations/auth.ts` - Login/register validation
- `src/lib/validations/index.ts` - All other validations

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx  # Server-side only, never expose!
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Coding Conventions

### TypeScript
- Use `as any` type assertion for Supabase queries to avoid complex typing issues
- Define interfaces for all data structures
- Use Zod schemas for runtime validation

### Components
- Use shadcn/ui components from `@/components/ui/`
- Client components must have `'use client'` directive
- Server components are default (no directive needed)

### Styling
- Use Tailwind CSS utility classes
- Theme colors use oklch color space (hue 250 for blue theme)
- Mobile-first responsive design

### File Naming
- Components: PascalCase (`UserActions.tsx`)
- Utilities: kebab-case (`format-date.ts`)
- Pages: lowercase (`page.tsx`)

## Common Patterns

### Server Actions
```typescript
// Use createSecureAction for protected operations
import { createSecureAction, createAdminAction } from '@/lib/auth/secure-action'

export const myAction = createAdminAction(
  myZodSchema,
  async (input, { user, supabase }) => {
    // Implementation
  }
)
```

### Data Fetching (Server Components)
```typescript
import { createClient } from '@/lib/supabase/server'

async function getData() {
  const supabase = await createClient()
  const { data, error } = await (supabase.from('table') as any)
    .select('*')
  return data
}
```

### Client-side Operations
```typescript
'use client'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data } = await supabase.from('table').select('*')
```

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Run ESLint
npx tsc --noEmit # Type check
```

## Deployment Checklist

1. Set all environment variables on hosting platform
2. Update Supabase Auth settings:
   - Site URL: `https://your-domain.com`
   - Redirect URLs: `https://your-domain.com/**`
3. Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only
4. Enable HTTPS

## Notes for AI Assistants

- Always use `as any` for Supabase queries to avoid type errors
- The profiles table syncs automatically with auth.users
- Check `src/lib/utils/constants.ts` for navigation items
- Toast notifications use `sonner` library
- Forms use controlled components with React state
