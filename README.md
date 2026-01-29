# APEX Computer Technology

A comprehensive Service & Sales Management System for a computer technology company in Sri Lanka. Built with Next.js 15, Supabase, and Tailwind CSS.

## Features

- **Multi-Role Authentication** - Admin, Staff (Technician, Marketing, Support), and Customer roles
- **Product Catalog** - Browse and purchase IT products
- **Order Management** - Place orders with bank transfer payment
- **Service Tickets** - Create and track service/repair requests
- **Service Agreements** - Manage maintenance contracts (Comprehensive, Labour Only, On-Call)
- **Email Notifications** - Order confirmation emails via Resend
- **Real-time Updates** - Live data updates using Supabase subscriptions
- **Responsive Design** - Mobile-first design with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Email**: Resend
- **Validation**: Zod
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
│   ├── layout/            # Layout components
│   ├── ui/                # shadcn/ui components
│   └── sections/          # Page sections
├── lib/
│   ├── supabase/          # Supabase clients
│   ├── email/             # Email utilities (Resend)
│   ├── hooks/             # Custom React hooks
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

## Email Configuration

The system uses [Resend](https://resend.com) for sending emails.

### Setup

1. Create a Resend account at https://resend.com
2. Get your API key from https://resend.com/api-keys
3. Add `RESEND_API_KEY` to your `.env.local`

### Domain Verification (Production)

For production, verify your domain at https://resend.com/domains to send emails to any recipient.

**Free Plan Limits:**
- 100 emails/day
- 3,000 emails/month

## Database

### Core Tables

- `profiles` - User profiles
- `products` - Product catalog
- `categories` - Product categories
- `orders` - Customer orders
- `order_items` - Order line items
- `service_tickets` - Service/repair tickets
- `service_agreements` - Maintenance contracts
- `bank_accounts` - Payment bank details
- `payment_receipts` - Payment proofs

### Running Migrations

Execute SQL files in `supabase/migrations/` in order:
1. `00001_initial_schema.sql`
2. `00002_services_and_products.sql`
3. `00003_payment_system.sql`

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

- Update `NEXT_PUBLIC_SITE_URL` to your production URL
- Update Supabase Auth settings (Site URL, Redirect URLs)
- Verify email domain in Resend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is proprietary software for APEX Computer Technology.

## Support

- Phone: +94 77 777 0003
- Email: apex@isplanka.lk
- WhatsApp: +94 77 777 0003
