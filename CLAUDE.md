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

This is a Next.js 15 App Router application with Supabase backend for a computer technology company's service and sales management system. The frontend features modern animations using Three.js and Framer Motion.

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
- Google OAuth configured for social login

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

## Key Patterns

### Server Actions
```typescript
import { createAdminAction } from '@/lib/auth/secure-action'

export const myAction = createAdminAction(
  zodSchema,
  async (input, { user, supabase }) => { /* ... */ }
)
```

### Data Fetching in Server Components
```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data } = await (supabase.from('orders') as any).select('*')
```

### Server/Client Component Split for Animations
When fetching data that needs animations, split into server and client components:
```typescript
// services-section-v2.tsx (Server Component)
export async function ServicesSectionV2() {
  const { services } = await getActiveServices()
  return <ServiceAnimationWrapper services={services} />
}

// services-animation-wrapper.tsx (Client Component)
'use client'
export function ServiceAnimationWrapper({ services }) {
  return <ScrollFade>{/* animated content */}</ScrollFade>
}
```

## Animation Components

### Three.js Components (Dynamic Import Required)
Always use dynamic imports with `ssr: false` for Three.js components:
```typescript
const LightPillar3D = dynamic(() => import('@/components/ui/light-pillar-3d'), {
  ssr: false,
  loading: () => null
})
```

### Available Animation Components

**`src/components/ui/light-pillar-3d.tsx`** - WebGL volumetric light beam
```tsx
<LightPillar3D
  topColor="#3b82f6"
  bottomColor="#8b5cf6"
  intensity={0.3}
  rotationSpeed={0.2}
  pillarWidth={4}
  pillarHeight={0.3}
/>
```

**`src/components/ui/antigravity.tsx`** - Mouse-following particle system
```tsx
<Antigravity
  count={150}
  magnetRadius={15}
  particleShape="sphere"
  color="#60a5fa"
  autoAnimate={false}
/>
```

**`src/components/ui/scroll-animations.tsx`** - Scroll-triggered animations
- `ScrollFade` - Fade in on scroll
- `Parallax` - Parallax scrolling effect
- `TextReveal` - Word-by-word reveal
- `CharReveal` - Character-by-character reveal
- `ScaleOnScroll` - Scale animation on scroll
- `StaggerContainer/StaggerItem` - Staggered children animations
- `Marquee` - Infinite scrolling marquee
- `ScrollProgress` - Progress bar at top
- `Magnetic` - Magnetic hover effect

**`src/components/ui/glitch-text.tsx`** - Text effects
- `GlitchText` - Cyberpunk glitch effect
- `FlipText` - Character flip animation

### Header Component
The header (`src/components/layout/header.tsx`) features:
- Floating glassmorphism design
- Magnetic hover effects on nav links
- Scroll-aware background opacity
- Animated mobile menu

## UI Components

- shadcn/ui components in `src/components/ui/`
- Toast notifications via `sonner`
- Forms use `react-hook-form` with `@hookform/resolvers/zod`
- Icons from `lucide-react`

## Landing Page Structure

The home page (`src/app/(public)/page.tsx`) uses these components:
1. `HomeV2` - Hero section with 3D effects, stats, brands marquee
2. `ProductsSectionV2` - Featured products from database
3. `ServicesSectionV2` - Featured services from database
4. `Testimonials` - Customer reviews
5. `CTASectionV2` - Call-to-action section

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
- Company info: `COMPANY_INFO` in constants

## Common Issues & Solutions

### Three.js Hydration Errors
Always use dynamic imports with `ssr: false` for Three.js/React Three Fiber components.

### Header Not Clickable
Ensure 3D background elements have `pointer-events-none` class.

### Scroll Animations Not Triggering on Load
For hero content that should animate immediately, use `motion.div` with `initial/animate` props instead of `ScrollFade` which uses `useInView`.

### Logo Not Visible
The logo file is dark - wrap in a light background container or use appropriate filters.
