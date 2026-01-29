# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
npx tsc --noEmit # Type check without emitting files
```

## Architecture Overview

### Application Structure

This is a Next.js 15 App Router application with Supabase backend for a computer technology company's service and sales management system.

**Route Groups:**
- `(auth)` - Login/register pages (public)
- `(public)` - Public website pages (home, products, services, inquiry)
- `(dashboard)` - Protected routes split by role:
  - `/admin/*` - Full system management
  - `/staff/*` - Role-specific staff panels (technician, marketing, support)
  - `/customer/*` - Customer portal

### Supabase Client Usage

Four different Supabase clients exist for different contexts:

| Client | File | Use Case |
|--------|------|----------|
| Browser | `src/lib/supabase/client.ts` | Client components |
| Server | `src/lib/supabase/server.ts` | Server components, server actions |
| Admin | `src/lib/supabase/admin.ts` | Service role operations (bypasses RLS) |
| Middleware | `src/lib/supabase/middleware.ts` | Route protection |

**Important:** Always use `as any` type assertion for Supabase queries to avoid complex typing issues:
```typescript
const { data } = await (supabase.from('table') as any).select('*')
```

### Authentication & Authorization

- Middleware (`src/middleware.ts`) handles route protection
- Role-based access: `admin`, `staff` (with `staff_type`: technician/marketing/support), `customer`
- Server actions use `createSecureAction` or `createAdminAction` from `src/lib/auth/secure-action.ts`

### Email System

Uses Resend (`src/lib/email/resend.ts`) for transactional emails:
- Templates in `src/lib/email/templates/`
- Requires `RESEND_API_KEY` environment variable
- Domain verification needed for production

### Database

- All tables have Row Level Security (RLS) enabled
- Migrations in `supabase/migrations/` (run in Supabase SQL Editor)
- `profiles` table auto-syncs with `auth.users`
- Helper functions: `is_admin()`, `is_staff()` for RLS policies

### Key Patterns

**Server Actions:**
```typescript
import { createAdminAction } from '@/lib/auth/secure-action'

export const myAction = createAdminAction(
  zodSchema,
  async (input, { user, supabase }) => { /* ... */ }
)
```

**Data Fetching in Server Components:**
```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data } = await (supabase.from('orders') as any).select('*')
```

### UI Components

- shadcn/ui components in `src/components/ui/`
- Toast notifications via `sonner`
- Forms use `react-hook-form` with `@hookform/resolvers/zod`
- Icons from `lucide-react`

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx    # Server-side only
NEXT_PUBLIC_SITE_URL=http://localhost:3000
RESEND_API_KEY=re_xxx            # For email functionality
```

## Constants & Configuration

- Navigation items: `src/lib/utils/constants.ts`
- Currency/formatting: `src/lib/utils/format.ts`
- Validation schemas: `src/lib/validations/`
