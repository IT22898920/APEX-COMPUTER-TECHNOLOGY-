# APEX Computer Technology

A comprehensive Service & Sales Management System for a computer technology company in Sri Lanka. Built with Next.js 15, Supabase, and Tailwind CSS with stunning modern animations.

## Features

### Core Features
- **Multi-Role Authentication** - Admin, Staff (Technician, Marketing, Support), and Customer roles
- **Product Catalog** - Browse and purchase IT products with categories
- **Order Management** - Place orders with bank transfer payment
- **Service Tickets** - Create and track service/repair requests
- **Service Agreements** - Manage maintenance contracts (Comprehensive, Labour Only, On-Call)
- **Email Notifications** - Order confirmation emails via Resend
- **Real-time Updates** - Live data updates using Supabase subscriptions
- **Responsive Design** - Mobile-first design with Tailwind CSS

### Modern UI/UX
- **3D Animations** - Light Pillar 3D effect with WebGL shaders
- **Particle System** - Antigravity particles following mouse movement
- **Scroll Animations** - Parallax, fade, scale, stagger effects
- **Glassmorphism Header** - Floating header with magnetic hover effects
- **Brand Marquee** - Smooth scrolling brand showcase

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email + Google OAuth)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Animations**: Framer Motion + Three.js + React Three Fiber
- **Email**: Resend
- **Validation**: Zod + React Hook Form
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Resend account (for emails)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/apex-computer-technology.git
cd apex-computer-technology
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your credentials:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Email (Resend)
RESEND_API_KEY=re_your_api_key
```

5. Run database migrations in Supabase SQL Editor (files in `supabase/migrations/`)

6. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── admin/         # Admin panel
│   │   ├── staff/         # Staff panel
│   │   └── customer/      # Customer portal
│   └── (public)/          # Public pages
├── components/
│   ├── landing/           # Landing page sections
│   │   ├── home-v2.tsx    # Hero section with 3D effects
│   │   ├── products-section-v2.tsx
│   │   ├── services-section-v2.tsx
│   │   ├── testimonials.tsx
│   │   └── cta-section-v2.tsx
│   ├── layout/            # Layout components
│   │   ├── header.tsx     # Glassmorphism floating header
│   │   └── footer.tsx
│   ├── ui/                # shadcn/ui + custom components
│   │   ├── scroll-animations.tsx  # Scroll animation components
│   │   ├── light-pillar-3d.tsx    # WebGL light beam effect
│   │   ├── antigravity.tsx        # Particle system
│   │   └── glitch-text.tsx        # Text effects
│   └── sections/          # Other page sections
├── lib/
│   ├── supabase/          # Supabase clients
│   ├── email/             # Email utilities (Resend)
│   ├── hooks/             # Custom React hooks
│   ├── auth/              # Authentication helpers
│   ├── utils/             # Utility functions
│   └── validations/       # Zod schemas
└── types/                 # TypeScript definitions
```

## User Roles

| Role | Access |
|------|--------|
| **Admin** | Full system access, user management, reports |
| **Technician** | Service tickets, repairs |
| **Marketing** | Products, inventory, orders |
| **Support** | Customer service, tickets |
| **Customer** | View orders, create service tickets |

## Animation Components

### Light Pillar 3D
WebGL-powered volumetric light beam with customizable colors, intensity, and rotation.
```tsx
<LightPillar3D
  topColor="#3b82f6"
  bottomColor="#8b5cf6"
  intensity={0.3}
  rotationSpeed={0.2}
/>
```

### Antigravity Particles
Interactive particle system that follows mouse movement.
```tsx
<Antigravity
  count={150}
  magnetRadius={15}
  particleShape="sphere"
  color="#60a5fa"
/>
```

### Scroll Animations
Reusable animation components for scroll-triggered effects.
```tsx
<ScrollFade>Content</ScrollFade>
<Parallax speed={0.5}>Content</Parallax>
<StaggerContainer><StaggerItem>Item</StaggerItem></StaggerContainer>
<Magnetic strength={0.2}><Button>Hover me</Button></Magnetic>
```

## Database

### Core Tables

- `profiles` - User profiles (synced with auth.users)
- `products` - Product catalog
- `categories` - Product categories
- `services` - Service offerings
- `orders` - Customer orders
- `order_items` - Order line items
- `service_tickets` - Service/repair tickets
- `service_agreements` - Maintenance contracts
- `bank_accounts` - Payment bank details
- `payment_receipts` - Payment proofs
- `testimonials` - Customer reviews

### Running Migrations

Execute SQL files in `supabase/migrations/` in order via Supabase SQL Editor.

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
npx tsc --noEmit # Type check
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

- Update `NEXT_PUBLIC_SITE_URL` to your production URL
- Configure Supabase Auth settings (Site URL, Redirect URLs)
- Add Google OAuth credentials for Google login
- Verify email domain in Resend

## License

This project is proprietary software for APEX Computer Technology.

## Support

- Phone: +94 77 777 0003
- Email: apex@isplanka.lk
- WhatsApp: +94 77 777 0003
- Website: https://purelech.lk
