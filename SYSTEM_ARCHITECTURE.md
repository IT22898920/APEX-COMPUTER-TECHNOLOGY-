# Apex Computer Technology
## System Design & Architectural Blueprint
### Service & Sales Management System

---

## Table of Contents
1. [System Overview](#1-system-overview)
2. [Database Schema Design](#2-database-schema-design)
3. [Row Level Security (RLS) Policies](#3-row-level-security-rls-policies)
4. [Next.js App Structure & Routing](#4-nextjs-app-structure--routing)
5. [Core Feature Logic & Workflows](#5-core-feature-logic--workflows)
6. [UI/UX Strategy](#6-uiux-strategy)
7. [Real-time Features](#7-real-time-features)
8. [Security Considerations](#8-security-considerations)

---

## 1. System Overview

### 1.1 Business Context
Apex Computer Technology provides:
- Computer hardware maintenance & repairs
- Networking solutions
- IT product sales
- **SLA-bound incident response (2-3 hours)**

### 1.2 Tech Stack
```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │     Next.js 14+ (App Router) + Tailwind CSS     │   │
│  │              shadcn/ui Components               │   │
│  │           PWA (Service Worker + Manifest)       │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   SUPABASE LAYER                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │     Auth     │ │  PostgreSQL  │ │   Realtime   │    │
│  │ (Magic Link/ │ │  + RLS       │ │ Subscriptions│    │
│  │  Password)   │ │              │ │              │    │
│  └──────────────┘ └──────────────┘ └──────────────┘    │
│  ┌──────────────┐ ┌──────────────┐                     │
│  │   Storage    │ │    Edge      │                     │
│  │ (Documents/  │ │  Functions   │                     │
│  │   Images)    │ │              │                     │
│  └──────────────┘ └──────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

### 1.3 User Roles Hierarchy
```
┌─────────────────────────────────────────┐
│              ADMIN                       │
│  (Directors/Managers)                    │
│  - Full system access                    │
│  - User management                       │
│  - Reports & Analytics                   │
└───────────────────┬─────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌───────────────────┐   ┌───────────────────┐
│   STAFF           │   │   STAFF           │
│   (Technician)    │   │   (Marketing)     │
│   - Service Jobs  │   │   - Inventory     │
│   - Job Updates   │   │   - Sales Orders  │
│   - Repair Notes  │   │   - Product Mgmt  │
└───────────────────┘   └───────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │      CUSTOMER         │
        │  - Service Requests   │
        │  - Track Repairs      │
        │  - View Agreements    │
        │  - Service History    │
        └───────────────────────┘
```

---

## 2. Database Schema Design

### 2.1 Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE SCHEMA                                     │
└─────────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐         ┌──────────────────────┐
    │   auth.users     │         │      profiles        │
    │   (Supabase)     │────────▶│                      │
    │                  │   1:1   │  id (FK → auth.users)│
    │  id (UUID)       │         │  role                │
    │  email           │         │  full_name           │
    │  ...             │         │  phone               │
    └──────────────────┘         │  avatar_url          │
                                 │  company_name        │
                                 │  address             │
                                 │  staff_type          │
                                 │  is_active           │
                                 └──────────┬───────────┘
                                            │
              ┌─────────────────────────────┼─────────────────────────────┐
              │                             │                             │
              ▼                             ▼                             ▼
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│  service_agreements  │     │   service_tickets    │     │      products        │
│                      │     │                      │     │                      │
│  id                  │     │  id                  │     │  id                  │
│  customer_id (FK)    │◀────│  customer_id (FK)    │     │  name                │
│  agreement_type      │     │  agreement_id (FK)   │     │  sku                 │
│  start_date          │     │  assigned_to (FK)    │     │  category_id (FK)    │
│  end_date            │     │  priority            │     │  description         │
│  status              │     │  status              │     │  cost_price          │
│  monthly_fee         │     │  title               │     │  selling_price       │
│  response_time_hours │     │  description         │     │  stock_quantity      │
│  coverage_details    │     │  device_info         │     │  reorder_level       │
│  created_at          │     │  location            │     │  is_active           │
└──────────────────────┘     │  reported_at         │     └──────────┬───────────┘
                             │  assigned_at         │                │
                             │  resolved_at         │                │
                             │  sla_deadline        │                │
                             └──────────┬───────────┘                │
                                        │                            │
                    ┌───────────────────┼────────────────┐           │
                    │                   │                │           │
                    ▼                   ▼                ▼           │
       ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐│
       │  ticket_notes    │ │ ticket_parts_used│ │ ticket_history   ││
       │                  │ │                  │ │                  ││
       │  id              │ │  id              │ │  id              ││
       │  ticket_id (FK)  │ │  ticket_id (FK)  │ │  ticket_id (FK)  ││
       │  author_id (FK)  │ │  product_id (FK) │◀┼──────────────────┘│
       │  note_type       │ │  quantity        │ │  changed_by (FK) │
       │  content         │ │  unit_price      │ │  old_status      │
       │  is_internal     │ │  added_at        │ │  new_status      │
       │  created_at      │ └──────────────────┘ │  notes           │
       └──────────────────┘                      │  changed_at      │
                                                 └──────────────────┘

       ┌──────────────────┐         ┌──────────────────┐
       │    categories    │         │      orders      │
       │                  │         │                  │
       │  id              │         │  id              │
       │  name            │         │  customer_id (FK)│
       │  description     │         │  order_number    │
       │  parent_id (FK)  │         │  status          │
       │  is_active       │         │  subtotal        │
       └──────────────────┘         │  tax             │
                                    │  discount        │
                                    │  total           │
       ┌──────────────────┐         │  payment_status  │
       │   order_items    │         │  notes           │
       │                  │         │  created_at      │
       │  id              │         └──────────┬───────┘
       │  order_id (FK)   │◀───────────────────┘
       │  product_id (FK) │
       │  quantity        │
       │  unit_price      │
       │  total_price     │
       └──────────────────┘

       ┌──────────────────┐         ┌──────────────────┐
       │ inventory_logs   │         │  notifications   │
       │                  │         │                  │
       │  id              │         │  id              │
       │  product_id (FK) │         │  user_id (FK)    │
       │  change_type     │         │  title           │
       │  quantity_change │         │  message         │
       │  reference_type  │         │  type            │
       │  reference_id    │         │  is_read         │
       │  notes           │         │  link            │
       │  performed_by    │         │  created_at      │
       │  created_at      │         └──────────────────┘
       └──────────────────┘
```

### 2.2 Detailed Table Definitions

#### **profiles**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'staff', 'customer')),
  staff_type TEXT CHECK (staff_type IN ('technician', 'marketing', 'support', NULL)),
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  company_name TEXT,
  address JSONB, -- {street, city, postal_code, country}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **service_agreements**
```sql
CREATE TABLE service_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  agreement_type TEXT NOT NULL CHECK (
    agreement_type IN ('comprehensive', 'labour_only', 'on_call')
  ),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
  monthly_fee DECIMAL(10,2),
  response_time_hours INTEGER DEFAULT 3, -- SLA response time
  coverage_details JSONB, -- {hardware: true, software: true, network: true, ...}
  devices_covered JSONB[], -- Array of device info
  terms_conditions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agreement Types:
-- comprehensive: Full coverage (parts + labour + emergency response)
-- labour_only: Labour covered, customer pays for parts
-- on_call: Pay per service, no monthly fee
```

#### **service_tickets**
```sql
CREATE TABLE service_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL, -- Auto-generated: APX-2024-00001
  customer_id UUID NOT NULL REFERENCES profiles(id),
  agreement_id UUID REFERENCES service_agreements(id),
  assigned_to UUID REFERENCES profiles(id), -- Technician

  -- Ticket Details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  device_info JSONB, -- {type, brand, model, serial_number, ...}
  problem_category TEXT, -- hardware, software, network, other

  -- Priority & Status
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  status TEXT DEFAULT 'pending' CHECK (
    status IN ('pending', 'assigned', 'in_progress', 'on_hold', 'resolved', 'closed', 'cancelled')
  ),

  -- Location
  service_location JSONB, -- {address, contact_person, contact_phone}
  is_onsite BOOLEAN DEFAULT true,

  -- Timestamps & SLA
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  sla_deadline TIMESTAMPTZ, -- Calculated based on agreement
  sla_breached BOOLEAN DEFAULT false,

  -- Financials
  estimated_cost DECIMAL(10,2),
  final_cost DECIMAL(10,2),
  is_billable BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-generate ticket_number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ticket_number := 'APX-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
    LPAD(NEXTVAL('ticket_number_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### **ticket_notes**
```sql
CREATE TABLE ticket_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES service_tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id),
  note_type TEXT DEFAULT 'general' CHECK (
    note_type IN ('general', 'diagnosis', 'resolution', 'customer_feedback', 'internal')
  ),
  content TEXT NOT NULL,
  attachments JSONB[], -- [{url, filename, type}]
  is_internal BOOLEAN DEFAULT false, -- Internal notes not visible to customer
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **ticket_parts_used**
```sql
CREATE TABLE ticket_parts_used (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES service_tickets(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL, -- Price at time of use
  is_billable BOOLEAN DEFAULT true, -- Covered under agreement?
  added_by UUID NOT NULL REFERENCES profiles(id),
  added_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **ticket_history**
```sql
CREATE TABLE ticket_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES service_tickets(id) ON DELETE CASCADE,
  changed_by UUID NOT NULL REFERENCES profiles(id),
  field_changed TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  notes TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **products**
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id),

  -- Pricing
  cost_price DECIMAL(10,2) NOT NULL,
  selling_price DECIMAL(10,2) NOT NULL,

  -- Inventory
  stock_quantity INTEGER DEFAULT 0,
  reorder_level INTEGER DEFAULT 5,

  -- Metadata
  specifications JSONB, -- {brand, model, warranty_months, ...}
  images JSONB[], -- [{url, alt, is_primary}]
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **categories**
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id), -- For nested categories
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **orders** (Sales)
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL, -- ORD-2024-00001
  customer_id UUID REFERENCES profiles(id),

  -- Customer info (for non-registered customers)
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,

  status TEXT DEFAULT 'pending' CHECK (
    status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
  ),

  -- Financials
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,

  payment_status TEXT DEFAULT 'pending' CHECK (
    payment_status IN ('pending', 'partial', 'paid', 'refunded')
  ),
  payment_method TEXT,

  -- Delivery
  delivery_address JSONB,
  delivery_notes TEXT,

  notes TEXT,
  created_by UUID REFERENCES profiles(id), -- Staff who created
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **order_items**
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **inventory_logs**
```sql
CREATE TABLE inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  change_type TEXT NOT NULL CHECK (
    change_type IN ('purchase', 'sale', 'repair_use', 'adjustment', 'return', 'damaged')
  ),
  quantity_change INTEGER NOT NULL, -- Positive for additions, negative for deductions
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  reference_type TEXT, -- 'order', 'ticket', 'manual'
  reference_id UUID, -- order_id or ticket_id
  notes TEXT,
  performed_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **notifications**
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'ticket', 'order')),
  is_read BOOLEAN DEFAULT false,
  link TEXT, -- URL to navigate to
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. Row Level Security (RLS) Policies

### 3.1 RLS Policy Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    RLS DECISION FLOW                            │
└─────────────────────────────────────────────────────────────────┘

                    ┌─────────────────┐
                    │  Incoming Query │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Get User Role   │
                    │ from JWT/Session│
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │  ADMIN   │  │  STAFF   │  │ CUSTOMER │
        │ Full     │  │ Limited  │  │ Own Data │
        │ Access   │  │ Access   │  │ Only     │
        └──────────┘  └──────────┘  └──────────┘
```

### 3.2 Helper Functions

```sql
-- Get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Get current user's staff type
CREATE OR REPLACE FUNCTION get_staff_type()
RETURNS TEXT AS $$
  SELECT staff_type FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user is staff
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  );
$$ LANGUAGE sql SECURITY DEFINER;
```

### 3.3 Table-Specific RLS Policies

#### **profiles**
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Staff can view all profiles (for customer lookup)
CREATE POLICY "Staff can view all profiles"
  ON profiles FOR SELECT
  USING (is_staff());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Only admins can update role/staff_type
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (is_admin());

-- Only admins can create staff accounts
CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (is_admin() OR auth.uid() = id);
```

#### **service_tickets**
```sql
ALTER TABLE service_tickets ENABLE ROW LEVEL SECURITY;

-- Customers see only their own tickets
CREATE POLICY "Customers view own tickets"
  ON service_tickets FOR SELECT
  USING (
    customer_id = auth.uid() OR
    is_staff()
  );

-- Technicians see assigned tickets + all if admin
CREATE POLICY "Technicians view assigned or admin sees all"
  ON service_tickets FOR SELECT
  USING (
    is_admin() OR
    assigned_to = auth.uid() OR
    (is_staff() AND get_staff_type() = 'support')
  );

-- Customers can create tickets
CREATE POLICY "Customers can create tickets"
  ON service_tickets FOR INSERT
  WITH CHECK (customer_id = auth.uid() OR is_staff());

-- Staff can update assigned tickets
CREATE POLICY "Staff can update tickets"
  ON service_tickets FOR UPDATE
  USING (
    is_admin() OR
    assigned_to = auth.uid() OR
    (is_staff() AND get_staff_type() = 'support')
  );
```

#### **service_agreements**
```sql
ALTER TABLE service_agreements ENABLE ROW LEVEL SECURITY;

-- Customers see their own agreements
CREATE POLICY "Customers view own agreements"
  ON service_agreements FOR SELECT
  USING (customer_id = auth.uid() OR is_staff());

-- Only staff can manage agreements
CREATE POLICY "Staff manage agreements"
  ON service_agreements FOR ALL
  USING (is_staff());
```

#### **products**
```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Everyone can view active products
CREATE POLICY "Public read active products"
  ON products FOR SELECT
  USING (is_active = true OR is_staff());

-- Only marketing staff can manage products
CREATE POLICY "Marketing staff manage products"
  ON products FOR ALL
  USING (
    is_admin() OR
    (is_staff() AND get_staff_type() = 'marketing')
  );
```

#### **orders**
```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Customers see their own orders
CREATE POLICY "Customers view own orders"
  ON orders FOR SELECT
  USING (customer_id = auth.uid() OR is_staff());

-- Staff can manage all orders
CREATE POLICY "Staff manage orders"
  ON orders FOR ALL
  USING (is_staff());
```

#### **ticket_notes**
```sql
ALTER TABLE ticket_notes ENABLE ROW LEVEL SECURITY;

-- Customers see non-internal notes on their tickets
CREATE POLICY "Customers view non-internal notes"
  ON ticket_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM service_tickets
      WHERE id = ticket_notes.ticket_id
      AND customer_id = auth.uid()
    ) AND is_internal = false
  );

-- Staff see all notes
CREATE POLICY "Staff view all notes"
  ON ticket_notes FOR SELECT
  USING (is_staff());

-- Staff can add notes
CREATE POLICY "Staff can add notes"
  ON ticket_notes FOR INSERT
  WITH CHECK (is_staff());

-- Customers can add notes to their tickets
CREATE POLICY "Customers can add notes to own tickets"
  ON ticket_notes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM service_tickets
      WHERE id = ticket_notes.ticket_id
      AND customer_id = auth.uid()
    ) AND is_internal = false
  );
```

#### **notifications**
```sql
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users see only their notifications
CREATE POLICY "Users see own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Users can update (mark as read) their notifications
CREATE POLICY "Users update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- System can create notifications (via service role)
CREATE POLICY "System creates notifications"
  ON notifications FOR INSERT
  WITH CHECK (true); -- Controlled via service role key
```

---

## 4. Next.js App Structure & Routing

### 4.1 Project Folder Structure

```
apex-computer-technology/
├── app/
│   ├── (public)/                    # Public pages (no auth)
│   │   ├── layout.tsx               # Public layout with nav
│   │   ├── page.tsx                 # Landing/Home page
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── services/
│   │   │   └── page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx             # Product listing
│   │   │   └── [slug]/
│   │   │       └── page.tsx         # Product detail
│   │   └── contact/
│   │       └── page.tsx
│   │
│   ├── (auth)/                      # Auth pages
│   │   ├── layout.tsx               # Minimal auth layout
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   └── verify/
│   │       └── page.tsx             # Email verification
│   │
│   ├── (dashboard)/                 # Protected dashboard area
│   │   ├── layout.tsx               # Dashboard shell with sidebar
│   │   │
│   │   ├── dashboard/               # Main dashboard (role-based redirect)
│   │   │   └── page.tsx
│   │   │
│   │   ├── admin/                   # Admin-only routes
│   │   │   ├── layout.tsx           # Admin sub-layout
│   │   │   ├── page.tsx             # Admin overview
│   │   │   ├── users/
│   │   │   │   ├── page.tsx         # User management
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx     # User detail/edit
│   │   │   ├── reports/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── sales/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── services/
│   │   │   │       └── page.tsx
│   │   │   ├── agreements/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   │
│   │   ├── staff/                   # Staff routes
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx             # Staff overview
│   │   │   │
│   │   │   ├── tickets/             # Technician: Service tickets
│   │   │   │   ├── page.tsx         # My assigned tickets
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx     # Ticket detail/update
│   │   │   │
│   │   │   ├── inventory/           # Marketing: Inventory
│   │   │   │   ├── page.tsx
│   │   │   │   ├── add/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   └── orders/              # Marketing: Sales orders
│   │   │       ├── page.tsx
│   │   │       ├── create/
│   │   │       │   └── page.tsx
│   │   │       └── [id]/
│   │   │           └── page.tsx
│   │   │
│   │   └── customer/                # Customer routes
│   │       ├── layout.tsx
│   │       ├── page.tsx             # Customer dashboard
│   │       ├── service-requests/
│   │       │   ├── page.tsx         # My service requests
│   │       │   ├── new/
│   │       │   │   └── page.tsx     # Create new request
│   │       │   └── [id]/
│   │       │       └── page.tsx     # Track request
│   │       ├── agreements/
│   │       │   ├── page.tsx         # My agreements
│   │       │   └── [id]/
│   │       │       └── page.tsx
│   │       ├── history/
│   │       │   └── page.tsx         # Service history
│   │       └── profile/
│   │           └── page.tsx         # Edit profile
│   │
│   ├── api/                         # API routes (if needed)
│   │   ├── webhooks/
│   │   │   └── supabase/
│   │   │       └── route.ts         # Supabase webhooks
│   │   └── cron/
│   │       └── sla-check/
│   │           └── route.ts         # SLA monitoring cron
│   │
│   ├── layout.tsx                   # Root layout
│   ├── globals.css                  # Global styles
│   ├── loading.tsx                  # Root loading
│   ├── error.tsx                    # Root error
│   └── not-found.tsx                # 404 page
│
├── components/
│   ├── ui/                          # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   └── ...
│   │
│   ├── layout/                      # Layout components
│   │   ├── header.tsx               # Public header/nav
│   │   ├── footer.tsx               # Public footer
│   │   ├── sidebar.tsx              # Dashboard sidebar
│   │   ├── dashboard-header.tsx     # Dashboard top bar
│   │   └── mobile-nav.tsx           # Mobile navigation
│   │
│   ├── landing/                     # Landing page sections
│   │   ├── hero.tsx
│   │   ├── services-section.tsx
│   │   ├── about-section.tsx
│   │   ├── testimonials.tsx
│   │   ├── stats-section.tsx
│   │   └── cta-section.tsx
│   │
│   ├── tickets/                     # Ticket components
│   │   ├── ticket-card.tsx
│   │   ├── ticket-form.tsx
│   │   ├── ticket-timeline.tsx
│   │   ├── ticket-status-badge.tsx
│   │   └── ticket-notes-list.tsx
│   │
│   ├── products/                    # Product components
│   │   ├── product-card.tsx
│   │   ├── product-grid.tsx
│   │   └── product-form.tsx
│   │
│   ├── orders/                      # Order components
│   │   ├── order-form.tsx
│   │   ├── order-items-table.tsx
│   │   └── order-status-badge.tsx
│   │
│   ├── dashboard/                   # Dashboard widgets
│   │   ├── stats-cards.tsx
│   │   ├── recent-tickets.tsx
│   │   ├── revenue-chart.tsx
│   │   ├── sla-monitor.tsx
│   │   └── activity-feed.tsx
│   │
│   └── shared/                      # Shared components
│       ├── data-table.tsx           # Reusable data table
│       ├── page-header.tsx
│       ├── empty-state.tsx
│       ├── loading-skeleton.tsx
│       ├── search-input.tsx
│       └── status-badge.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                # Browser client
│   │   ├── server.ts                # Server client
│   │   ├── middleware.ts            # Auth middleware helper
│   │   └── admin.ts                 # Admin/service role client
│   │
│   ├── utils/
│   │   ├── cn.ts                    # Class name utility
│   │   ├── format.ts                # Date/currency formatters
│   │   ├── validators.ts            # Zod schemas
│   │   └── constants.ts             # App constants
│   │
│   └── hooks/
│       ├── use-user.ts              # Current user hook
│       ├── use-realtime.ts          # Realtime subscription hook
│       └── use-notifications.ts     # Notifications hook
│
├── types/
│   ├── database.ts                  # Supabase generated types
│   ├── index.ts                     # Custom types
│   └── enums.ts                     # Enum definitions
│
├── middleware.ts                    # Next.js middleware
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

### 4.2 Middleware Strategy

```typescript
// middleware.ts - Route Protection Strategy

/**
 * MIDDLEWARE FLOW
 * ================
 *
 * Request → Check Auth → Check Role → Allow/Redirect
 *
 *     ┌─────────────┐
 *     │   Request   │
 *     └──────┬──────┘
 *            │
 *            ▼
 *     ┌─────────────┐     ┌─────────────┐
 *     │ Is Public   │─Yes→│   Allow     │
 *     │   Route?    │     └─────────────┘
 *     └──────┬──────┘
 *            │ No
 *            ▼
 *     ┌─────────────┐     ┌─────────────┐
 *     │ Has Valid   │─No─→│  Redirect   │
 *     │  Session?   │     │  to /login  │
 *     └──────┬──────┘     └─────────────┘
 *            │ Yes
 *            ▼
 *     ┌─────────────┐     ┌─────────────┐
 *     │ Has Role    │─No─→│  Redirect   │
 *     │ Permission? │     │  to /403    │
 *     └──────┬──────┘     └─────────────┘
 *            │ Yes
 *            ▼
 *     ┌─────────────┐
 *     │   Allow     │
 *     └─────────────┘
 */

// Route Configuration
const routeConfig = {
  public: ['/', '/about', '/services', '/products', '/contact'],
  auth: ['/login', '/register', '/forgot-password', '/verify'],
  admin: ['/admin'],
  staff: ['/staff'],
  customer: ['/customer'],
  dashboard: ['/dashboard'] // Redirects based on role
};

// Role-based redirects from /dashboard
const dashboardRedirects = {
  admin: '/admin',
  staff: '/staff',
  customer: '/customer'
};

// Staff type restrictions
const staffRouteAccess = {
  technician: ['/staff/tickets'],
  marketing: ['/staff/inventory', '/staff/orders'],
  support: ['/staff/tickets', '/staff/orders'] // Can access both
};
```

### 4.3 Route Protection Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ROUTE ACCESS MATRIX                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Route                      │ Public │ Customer │ Staff │ Admin │          │
│  ─────────────────────────────────────────────────────────────────          │
│  /                          │   ✓    │    ✓     │   ✓   │   ✓   │          │
│  /about, /services          │   ✓    │    ✓     │   ✓   │   ✓   │          │
│  /products                  │   ✓    │    ✓     │   ✓   │   ✓   │          │
│  /contact                   │   ✓    │    ✓     │   ✓   │   ✓   │          │
│  ─────────────────────────────────────────────────────────────────          │
│  /login, /register          │   ✓    │    ─     │   ─   │   ─   │          │
│  ─────────────────────────────────────────────────────────────────          │
│  /dashboard                 │   ✗    │    →     │   →   │   →   │ Redirect │
│  ─────────────────────────────────────────────────────────────────          │
│  /customer/*                │   ✗    │    ✓     │   ✗   │   ✓   │          │
│  /staff/*                   │   ✗    │    ✗     │   ✓   │   ✓   │          │
│  /admin/*                   │   ✗    │    ✗     │   ✗   │   ✓   │          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

Legend: ✓ = Access Allowed | ✗ = Access Denied | → = Redirect to role dashboard
```

---

## 5. Core Feature Logic & Workflows

### 5.1 Service Ticket Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        SERVICE TICKET LIFECYCLE                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

  CUSTOMER                    ADMIN/SUPPORT                    TECHNICIAN
     │                             │                               │
     │  ┌─────────────────┐       │                               │
     │  │ 1. REPORT FAULT │       │                               │
     │  │                 │       │                               │
     │  │ - Fill form     │       │                               │
     │  │ - Device info   │       │                               │
     │  │ - Description   │       │                               │
     │  │ - Location      │       │                               │
     │  └────────┬────────┘       │                               │
     │           │                │                               │
     │           ▼                │                               │
     │    ┌──────────────┐       │                               │
     │    │   PENDING    │───────┼──────────────────────────────▶│
     │    │              │       │    Real-time notification      │
     │    │  SLA Timer   │       │                               │
     │    │   Starts     │       │                               │
     │    └──────────────┘       │                               │
     │           │                │                               │
     │           │                ▼                               │
     │           │         ┌─────────────────┐                   │
     │           │         │ 2. REVIEW &     │                   │
     │           │         │    ASSIGN       │                   │
     │           │         │                 │                   │
     │           │         │ - Check SLA     │                   │
     │           │         │ - Set priority  │                   │
     │           │         │ - Assign tech   │                   │
     │           │         └────────┬────────┘                   │
     │           │                  │                             │
     │           ▼                  ▼                             │
     │    ┌──────────────┐  ┌──────────────┐                     │
     │◀───│   ASSIGNED   │──│ Notification │─────────────────────▶│
     │    │              │  │   to Tech    │                     │
     │    └──────────────┘  └──────────────┘                     │
     │           │                                                │
     │           │                                                ▼
     │           │                                         ┌─────────────────┐
     │           │                                         │ 3. START WORK   │
     │           │                                         │                 │
     │           │                                         │ - Travel to     │
     │           │                                         │   location      │
     │           │                                         │ - Begin repair  │
     │           │                                         └────────┬────────┘
     │           │                                                  │
     │           ▼                                                  ▼
     │    ┌──────────────┐                                  ┌──────────────┐
     │◀───│ IN_PROGRESS  │◀─────────────────────────────────│ Update Status│
     │    │              │                                  │              │
     │    │ Real-time    │                                  │ - Add notes  │
     │    │ tracking     │                                  │ - Use parts  │
     │    └──────────────┘                                  └──────────────┘
     │           │                                                  │
     │           │                                                  │
     │           │         ┌────────────────────────┐              │
     │           │         │    ON_HOLD (Optional)  │◀─────────────┘
     │           │         │                        │   Waiting for
     │           │         │  - Waiting for parts   │   parts/info
     │           │         │  - Need customer info  │
     │           │         └────────────────────────┘
     │           │                     │
     │           │                     │ Parts arrived
     │           ▼                     ▼
     │    ┌──────────────┐      ┌─────────────────┐
     │    │   RESOLVED   │◀─────│ 4. COMPLETE     │
     │◀───│              │      │    REPAIR       │
     │    │ Pending      │      │                 │
     │    │ confirmation │      │ - Final notes   │
     │    └──────────────┘      │ - Parts used    │
     │           │              │ - Time logged   │
     │           │              └─────────────────┘
     │           │
     │           ▼
     │  ┌────────────────┐
     │  │ 5. CUSTOMER    │
     │  │    FEEDBACK    │
     │  │                │
     │  │ - Confirm fix  │
     │  │ - Rate service │
     │  └───────┬────────┘
     │          │
     │          ▼
     │   ┌──────────────┐
     │   │    CLOSED    │
     │   │              │
     │   │  - Invoice   │
     │   │    generated │
     │   │  - History   │
     │   │    updated   │
     │   └──────────────┘
     │
     ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                    SLA MONITORING                            │
  │                                                              │
  │  ┌─────────┐    ┌─────────────┐    ┌────────────────────┐  │
  │  │ Ticket  │───▶│ Check SLA   │───▶│ 2hr Warning        │  │
  │  │ Created │    │ Every 15min │    │ Alert to Admin     │  │
  │  └─────────┘    └─────────────┘    └────────────────────┘  │
  │                        │                                    │
  │                        ▼           ┌────────────────────┐  │
  │                 ┌─────────────┐    │ SLA BREACHED       │  │
  │                 │ 3hr Limit   │───▶│ - Flag ticket      │  │
  │                 │ Reached     │    │ - Escalate         │  │
  │                 └─────────────┘    │ - Notify director  │  │
  │                                    └────────────────────┘  │
  └─────────────────────────────────────────────────────────────┘
```

### 5.2 Ticket Status State Machine

```
┌─────────────────────────────────────────────────────────────────┐
│                   TICKET STATUS TRANSITIONS                      │
└─────────────────────────────────────────────────────────────────┘

                         ┌──────────────┐
                         │   PENDING    │ (Initial state)
                         └──────┬───────┘
                                │
                                │ Admin assigns technician
                                ▼
                         ┌──────────────┐
                    ┌───▶│   ASSIGNED   │◀───┐
                    │    └──────┬───────┘    │
                    │           │            │
                    │           │ Tech       │ Re-assign
                    │           │ starts     │
                    │           ▼            │
                    │    ┌──────────────┐    │
                    │    │ IN_PROGRESS  │────┤
                    │    └──────┬───────┘    │
                    │           │            │
         Waiting    │           │            │
         resolved   │    ┌──────┴──────┐     │
                    │    │             │     │
                    │    ▼             ▼     │
              ┌──────────────┐  ┌──────────────┐
              │   ON_HOLD    │  │   RESOLVED   │
              │              │  │              │
              │ - Needs parts│  │ - Awaiting   │
              │ - Needs info │  │   customer   │
              └──────┬───────┘  │   confirm    │
                     │          └──────┬───────┘
                     │                 │
                     │ Parts           │ Customer
                     │ arrived         │ confirms
                     │                 ▼
                     │          ┌──────────────┐
                     └─────────▶│    CLOSED    │
                                │              │
                                │  - Complete  │
                                │  - Invoiced  │
                                └──────────────┘
                                       │
                                       │ Issue recurs
                                       ▼
                                ┌──────────────┐
                                │  RE-OPENED   │──────▶ Back to ASSIGNED
                                └──────────────┘

        Special:
                         ┌──────────────┐
        Any state ──────▶│  CANCELLED   │
        (except CLOSED)  └──────────────┘
```

### 5.3 Inventory System Logic

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         INVENTORY MANAGEMENT SYSTEM                              │
└─────────────────────────────────────────────────────────────────────────────────┘

                    ┌──────────────────────────────────────┐
                    │           INVENTORY STOCK            │
                    │                                      │
                    │    Product: RAM DDR4 8GB            │
                    │    Current Stock: 25 units          │
                    │    Reorder Level: 10 units          │
                    │                                      │
                    └────────────────┬─────────────────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
              ▼                      ▼                      ▼
    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
    │   STOCK IN      │    │  REPAIR USE     │    │   DIRECT SALE   │
    │                 │    │                 │    │                 │
    │ + Purchase      │    │ - Service       │    │ - Customer      │
    │ + Return        │    │   ticket uses   │    │   order         │
    │ + Adjustment    │    │   parts         │    │                 │
    └────────┬────────┘    └────────┬────────┘    └────────┬────────┘
             │                      │                      │
             ▼                      ▼                      ▼
    ┌─────────────────────────────────────────────────────────────────┐
    │                      INVENTORY LOG ENTRY                         │
    │                                                                  │
    │  {                                                              │
    │    product_id: "xxx",                                           │
    │    change_type: "purchase" | "repair_use" | "sale",             │
    │    quantity_change: +50 | -1 | -2,                              │
    │    reference_type: "manual" | "ticket" | "order",               │
    │    reference_id: <ticket_id> | <order_id>,                      │
    │    performed_by: <staff_id>,                                    │
    │    notes: "Purchased from supplier ABC"                         │
    │  }                                                              │
    └─────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
                    ┌────────────────────────────────────┐
                    │         UPDATE PRODUCT STOCK       │
                    │                                    │
                    │   new_quantity = old + change      │
                    └────────────────┬───────────────────┘
                                     │
                                     ▼
                    ┌────────────────────────────────────┐
                    │       CHECK REORDER LEVEL          │
                    │                                    │
                    │   IF stock <= reorder_level:       │
                    │     → Send alert to admin          │
                    │     → Create notification          │
                    └────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────┐
│                    REPAIR USE vs DIRECT SALE COMPARISON                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  SCENARIO A: Part Used in Repair                                                │
│  ────────────────────────────────                                               │
│                                                                                  │
│    Service Ticket #APX-2024-00042                                               │
│    │                                                                            │
│    ├─▶ Technician adds part to ticket                                          │
│    │     └─▶ ticket_parts_used record created                                  │
│    │           - ticket_id: xxx                                                │
│    │           - product_id: RAM DDR4                                          │
│    │           - quantity: 1                                                   │
│    │           - is_billable: depends on agreement                             │
│    │                                                                            │
│    ├─▶ inventory_logs entry created                                            │
│    │     - change_type: "repair_use"                                           │
│    │     - reference_type: "ticket"                                            │
│    │     - reference_id: ticket_id                                             │
│    │                                                                            │
│    └─▶ products.stock_quantity decremented                                     │
│                                                                                  │
│    Billing Logic:                                                               │
│    ┌─────────────────────────────────────────────────────────────┐             │
│    │ Agreement Type    │ Part Billing                           │             │
│    ├───────────────────┼────────────────────────────────────────┤             │
│    │ Comprehensive     │ NOT billed (covered)                   │             │
│    │ Labour Only       │ BILLED to customer                     │             │
│    │ On-Call           │ BILLED to customer                     │             │
│    └─────────────────────────────────────────────────────────────┘             │
│                                                                                  │
│                                                                                  │
│  SCENARIO B: Direct Sale                                                        │
│  ───────────────────────                                                        │
│                                                                                  │
│    Order #ORD-2024-00089                                                        │
│    │                                                                            │
│    ├─▶ Marketing staff creates order                                           │
│    │     └─▶ order_items record created                                        │
│    │           - order_id: xxx                                                 │
│    │           - product_id: RAM DDR4                                          │
│    │           - quantity: 2                                                   │
│    │           - unit_price: 8500.00                                           │
│    │                                                                            │
│    ├─▶ inventory_logs entry created                                            │
│    │     - change_type: "sale"                                                 │
│    │     - reference_type: "order"                                             │
│    │     - reference_id: order_id                                              │
│    │                                                                            │
│    └─▶ products.stock_quantity decremented by 2                                │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 5.4 Database Triggers & Functions

```sql
-- ═══════════════════════════════════════════════════════════════════
-- INVENTORY DEDUCTION TRIGGER (On ticket_parts_used INSERT)
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION handle_ticket_part_used()
RETURNS TRIGGER AS $$
DECLARE
  current_stock INTEGER;
  product_name TEXT;
BEGIN
  -- Get current stock
  SELECT stock_quantity, name INTO current_stock, product_name
  FROM products WHERE id = NEW.product_id;

  -- Check if enough stock
  IF current_stock < NEW.quantity THEN
    RAISE EXCEPTION 'Insufficient stock for %: Available %, Requested %',
      product_name, current_stock, NEW.quantity;
  END IF;

  -- Update product stock
  UPDATE products
  SET stock_quantity = stock_quantity - NEW.quantity,
      updated_at = NOW()
  WHERE id = NEW.product_id;

  -- Create inventory log
  INSERT INTO inventory_logs (
    product_id, change_type, quantity_change,
    previous_quantity, new_quantity,
    reference_type, reference_id, performed_by
  ) VALUES (
    NEW.product_id, 'repair_use', -NEW.quantity,
    current_stock, current_stock - NEW.quantity,
    'ticket', NEW.ticket_id, NEW.added_by
  );

  -- Check reorder level
  IF (current_stock - NEW.quantity) <= (
    SELECT reorder_level FROM products WHERE id = NEW.product_id
  ) THEN
    -- Notify admins about low stock
    INSERT INTO notifications (user_id, title, message, type)
    SELECT id, 'Low Stock Alert',
           'Product "' || product_name || '" is below reorder level',
           'warning'
    FROM profiles WHERE role = 'admin';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ticket_part_used
  AFTER INSERT ON ticket_parts_used
  FOR EACH ROW EXECUTE FUNCTION handle_ticket_part_used();


-- ═══════════════════════════════════════════════════════════════════
-- ORDER STOCK DEDUCTION (On order status → 'confirmed')
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION handle_order_confirmed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
    -- Deduct stock for all order items
    INSERT INTO inventory_logs (
      product_id, change_type, quantity_change,
      previous_quantity, new_quantity,
      reference_type, reference_id, performed_by
    )
    SELECT
      oi.product_id,
      'sale',
      -oi.quantity,
      p.stock_quantity,
      p.stock_quantity - oi.quantity,
      'order',
      NEW.id,
      NEW.created_by
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = NEW.id;

    -- Update all product quantities
    UPDATE products p
    SET stock_quantity = p.stock_quantity - oi.quantity,
        updated_at = NOW()
    FROM order_items oi
    WHERE oi.order_id = NEW.id AND p.id = oi.product_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_order_confirmed
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION handle_order_confirmed();


-- ═══════════════════════════════════════════════════════════════════
-- SLA DEADLINE CALCULATOR (On ticket INSERT)
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION calculate_sla_deadline()
RETURNS TRIGGER AS $$
DECLARE
  response_hours INTEGER;
BEGIN
  -- Get response time from agreement, default to 3 hours
  SELECT COALESCE(sa.response_time_hours, 3) INTO response_hours
  FROM service_agreements sa
  WHERE sa.id = NEW.agreement_id AND sa.status = 'active';

  IF response_hours IS NULL THEN
    response_hours := 3; -- Default for on-call
  END IF;

  -- Set SLA deadline
  NEW.sla_deadline := NEW.reported_at + (response_hours || ' hours')::INTERVAL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_sla
  BEFORE INSERT ON service_tickets
  FOR EACH ROW EXECUTE FUNCTION calculate_sla_deadline();


-- ═══════════════════════════════════════════════════════════════════
-- TICKET HISTORY LOGGER (On ticket UPDATE)
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION log_ticket_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO ticket_history (ticket_id, changed_by, field_changed, old_value, new_value)
    VALUES (NEW.id, auth.uid(), 'status', OLD.status, NEW.status);

    -- Update timestamp fields
    CASE NEW.status
      WHEN 'assigned' THEN NEW.assigned_at := NOW();
      WHEN 'in_progress' THEN NEW.started_at := NOW();
      WHEN 'resolved' THEN NEW.resolved_at := NOW();
      WHEN 'closed' THEN NEW.closed_at := NOW();
      ELSE NULL;
    END CASE;

    -- Check SLA breach
    IF NEW.started_at IS NOT NULL AND NEW.started_at > NEW.sla_deadline THEN
      NEW.sla_breached := true;
    END IF;
  END IF;

  -- Log assignment changes
  IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
    INSERT INTO ticket_history (ticket_id, changed_by, field_changed, old_value, new_value)
    VALUES (NEW.id, auth.uid(), 'assigned_to', OLD.assigned_to::TEXT, NEW.assigned_to::TEXT);
  END IF;

  -- Log priority changes
  IF OLD.priority IS DISTINCT FROM NEW.priority THEN
    INSERT INTO ticket_history (ticket_id, changed_by, field_changed, old_value, new_value)
    VALUES (NEW.id, auth.uid(), 'priority', OLD.priority, NEW.priority);
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_ticket_changes
  BEFORE UPDATE ON service_tickets
  FOR EACH ROW EXECUTE FUNCTION log_ticket_changes();
```

---

## 6. UI/UX Strategy

### 6.1 Landing Page Structure

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          APEX COMPUTER TECHNOLOGY                                │
│                           LANDING PAGE WIREFRAME                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│ HEADER / NAVIGATION                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │  [LOGO]    Home | About | Services | Products | Contact    [Login] [Portal]│ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│ HERO SECTION                                                                    │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │                                                                             │ │
│ │    "Professional IT Solutions                                               │ │
│ │     for Your Business"                                                      │ │
│ │                                                                             │ │
│ │    [2-3 Hour Response Time Guarantee]                                       │ │
│ │                                                                             │ │
│ │    [Request Service]     [View Products]                                    │ │
│ │                                                                             │ │
│ │    ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │ │
│ │    │ 500+     │  │ 24/7     │  │ 10+      │  │ 98%      │                 │ │
│ │    │ Clients  │  │ Support  │  │ Years    │  │ Uptime   │                 │ │
│ │    └──────────┘  └──────────┘  └──────────┘  └──────────┘                 │ │
│ │                                                                             │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│ SERVICES SECTION                                                                │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │                         Our Services                                        │ │
│ │                                                                             │ │
│ │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │ │
│ │  │ 🔧 Hardware     │  │ 🌐 Networking   │  │ 💻 Software     │            │ │
│ │  │    Repairs      │  │    Solutions    │  │    Support      │            │ │
│ │  │                 │  │                 │  │                 │            │ │
│ │  │ Computer,       │  │ LAN/WAN setup,  │  │ OS installation,│            │ │
│ │  │ laptop, server  │  │ WiFi, security  │  │ troubleshooting │            │ │
│ │  │ repairs & maint │  │                 │  │                 │            │ │
│ │  └─────────────────┘  └─────────────────┘  └─────────────────┘            │ │
│ │                                                                             │ │
│ │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │ │
│ │  │ 📦 IT Product   │  │ 🛡️ Maintenance  │  │ 🚨 Emergency    │            │ │
│ │  │    Sales        │  │    Contracts    │  │    Response     │            │ │
│ │  │                 │  │                 │  │                 │            │ │
│ │  │ Hardware,       │  │ Comprehensive,  │  │ 2-3 hour        │            │ │
│ │  │ peripherals,    │  │ Labour Only,    │  │ guaranteed      │            │ │
│ │  │ accessories     │  │ On-Call plans   │  │ response        │            │ │
│ │  └─────────────────┘  └─────────────────┘  └─────────────────┘            │ │
│ │                                                                             │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│ SERVICE AGREEMENTS SECTION                                                      │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │                    Service Agreement Plans                                  │ │
│ │                                                                             │ │
│ │  ┌─────────────────────────────────────────────────────────────────────┐   │ │
│ │  │                                                                     │   │ │
│ │  │   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐       │   │ │
│ │  │   │   ON-CALL     │   │  LABOUR ONLY  │   │ COMPREHENSIVE │       │   │ │
│ │  │   │               │   │               │   │   ⭐ POPULAR  │       │   │ │
│ │  │   │ Pay per       │   │ Monthly fee   │   │               │       │   │ │
│ │  │   │ service       │   │               │   │ Full coverage │       │   │ │
│ │  │   │               │   │ Labour free   │   │               │       │   │ │
│ │  │   │ No commitment │   │ Parts billed  │   │ Parts + Labour│       │   │ │
│ │  │   │               │   │               │   │ Priority resp │       │   │ │
│ │  │   │ 3hr response  │   │ 3hr response  │   │ 2hr response  │       │   │ │
│ │  │   │               │   │               │   │               │       │   │ │
│ │  │   │ [Contact Us]  │   │ [Get Quote]   │   │ [Get Quote]   │       │   │ │
│ │  │   └───────────────┘   └───────────────┘   └───────────────┘       │   │ │
│ │  │                                                                     │   │ │
│ │  └─────────────────────────────────────────────────────────────────────┘   │ │
│ │                                                                             │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│ ABOUT / WHY CHOOSE US                                                           │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │                                                                             │ │
│ │   [Company Image]        Why Choose Apex Computer Technology?               │ │
│ │                                                                             │ │
│ │                          ✓ 2-3 Hour Guaranteed Response Time                │ │
│ │                          ✓ Certified IT Professionals                       │ │
│ │                          ✓ Transparent Pricing                              │ │
│ │                          ✓ Real-time Service Tracking                       │ │
│ │                          ✓ Comprehensive Service Agreements                 │ │
│ │                                                                             │ │
│ │                          [Learn More About Us]                              │ │
│ │                                                                             │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│ TESTIMONIALS                                                                    │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │                      What Our Clients Say                                   │ │
│ │                                                                             │ │
│ │  ┌────────────────────────┐  ┌────────────────────────┐                    │ │
│ │  │ "Fastest response      │  │ "They've been our IT   │                    │ │
│ │  │  time I've ever        │  │  partner for 5 years.  │                    │ │
│ │  │  experienced!"         │  │  Highly recommend."    │                    │ │
│ │  │                        │  │                        │                    │ │
│ │  │  ⭐⭐⭐⭐⭐             │  │  ⭐⭐⭐⭐⭐             │                    │ │
│ │  │  - ABC Company         │  │  - XYZ Corporation     │                    │ │
│ │  └────────────────────────┘  └────────────────────────┘                    │ │
│ │                                                                             │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│ CTA SECTION                                                                     │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │                                                                             │ │
│ │              Need IT Support? We're Here to Help.                          │ │
│ │                                                                             │ │
│ │         [📞 Call Now: +94 XX XXX XXXX]    [📧 Email Us]                   │ │
│ │                                                                             │ │
│ │                 [🔧 Report an Issue - Get Help Now]                        │ │
│ │                                                                             │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│ FOOTER                                                                          │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │                                                                             │ │
│ │  APEX COMPUTER           Quick Links       Services        Contact         │ │
│ │  TECHNOLOGY                                                                 │ │
│ │                          Home              Hardware        123 Main St     │ │
│ │  Your trusted IT         About             Networking      Colombo, LK     │ │
│ │  solutions partner       Products          Software                        │ │
│ │                          Portal            Sales           +94 XX XXX XXX  │ │
│ │  [Social Media Icons]                                      info@apex.lk    │ │
│ │                                                                             │ │
│ │  ────────────────────────────────────────────────────────────────────────  │ │
│ │  © 2024 Apex Computer Technology. All rights reserved.                     │ │
│ │                                                                             │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Dashboard Layouts

#### Desktop Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        DASHBOARD - DESKTOP LAYOUT                                │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│  [LOGO]  Apex Computer Technology                    🔔 3  👤 John Doe  [▼]    │
└──────────────────────────────────────────────────────────────────────────────────┘

┌─────────┬────────────────────────────────────────────────────────────────────────┐
│         │                                                                        │
│  SIDE   │   MAIN CONTENT AREA                                                   │
│  BAR    │                                                                        │
│         │   ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐        │
│ ┌─────┐ │   │ Open       │ │ In Progress│ │ SLA Alert  │ │ Completed  │        │
│ │ 📊  │ │   │ Tickets    │ │ Tickets    │ │            │ │ Today      │        │
│ │Dash │ │   │    12      │ │     8      │ │     2      │ │    15      │        │
│ └─────┘ │   └────────────┘ └────────────┘ └────────────┘ └────────────┘        │
│         │                                                                        │
│ ┌─────┐ │   ┌────────────────────────────────────────────────────────────────┐ │
│ │ 🎫  │ │   │                                                                │ │
│ │Tick │ │   │   RECENT TICKETS                              [View All →]    │ │
│ │ets  │ │   │                                                                │ │
│ └─────┘ │   │   #APX-2024-00142  ABC Corp     In Progress   ⏱️ 1h 23m       │ │
│         │   │   #APX-2024-00141  XYZ Ltd      Assigned      ⏱️ 2h 05m       │ │
│ ┌─────┐ │   │   #APX-2024-00140  DEF Inc      Pending       ⚠️ SLA Risk     │ │
│ │ 📦  │ │   │                                                                │ │
│ │Inv  │ │   └────────────────────────────────────────────────────────────────┘ │
│ │ent  │ │                                                                        │
│ └─────┘ │   ┌──────────────────────────────┐ ┌──────────────────────────────┐  │
│         │   │                              │ │                              │  │
│ ┌─────┐ │   │  REVENUE CHART               │ │  TICKET STATUS BREAKDOWN     │  │
│ │ 📋  │ │   │  (Last 30 days)              │ │                              │  │
│ │Ord  │ │   │                              │ │      ┌───┐                   │  │
│ │ers  │ │   │    📈 ───────────────        │ │  ────│   │────               │  │
│ └─────┘ │   │                              │ │      └───┘                   │  │
│         │   │                              │ │  ■ Pending  ■ In Progress   │  │
│ ┌─────┐ │   │  Sales: Rs. 450,000          │ │  ■ On Hold  ■ Resolved      │  │
│ │ 📄  │ │   │  Services: Rs. 280,000       │ │                              │  │
│ │Rep  │ │   │                              │ │                              │  │
│ │orts │ │   └──────────────────────────────┘ └──────────────────────────────┘  │
│ └─────┘ │                                                                        │
│         │   ┌────────────────────────────────────────────────────────────────┐ │
│ ┌─────┐ │   │                                                                │ │
│ │ ⚙️  │ │   │   LOW STOCK ALERTS                            [Manage →]      │ │
│ │Sett │ │   │                                                                │ │
│ │ings │ │   │   ⚠️ RAM DDR4 8GB (3 left)  ⚠️ SSD 256GB (5 left)            │ │
│ └─────┘ │   │                                                                │ │
│         │   └────────────────────────────────────────────────────────────────┘ │
│         │                                                                        │
└─────────┴────────────────────────────────────────────────────────────────────────┘
```

#### Mobile Dashboard Layout (PWA)

```
┌───────────────────────────────────────┐
│        DASHBOARD - MOBILE             │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│  ☰  APEX          🔔 3    👤         │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│                                       │
│  Welcome back, John                   │
│                                       │
│  ┌─────────────┐  ┌─────────────┐    │
│  │ 🎫 Open     │  │ ⚠️ SLA      │    │
│  │    12       │  │    2        │    │
│  └─────────────┘  └─────────────┘    │
│                                       │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│  MY TICKETS                [View All] │
│  ─────────────────────────────────    │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │ #APX-2024-00142                 │ │
│  │ ABC Corporation                 │ │
│  │ Server not responding           │ │
│  │                                 │ │
│  │ 🟡 In Progress    ⏱️ 1h 23m    │ │
│  └─────────────────────────────────┘ │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │ #APX-2024-00141                 │ │
│  │ XYZ Limited                     │ │
│  │ Network connectivity issue      │ │
│  │                                 │ │
│  │ 🔵 Assigned       ⏱️ 2h 05m    │ │
│  └─────────────────────────────────┘ │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │ #APX-2024-00140                 │ │
│  │ DEF Inc                         │ │
│  │ Printer malfunction             │ │
│  │                                 │ │
│  │ ⚪ Pending        ⚠️ SLA Risk   │ │
│  └─────────────────────────────────┘ │
│                                       │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│  QUICK ACTIONS                        │
│                                       │
│  ┌─────────┐  ┌─────────┐            │
│  │ + New   │  │ 📍 Map  │            │
│  │ Ticket  │  │ View    │            │
│  └─────────┘  └─────────┘            │
│                                       │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│                                       │
│   🏠      🎫      ➕      📦     👤   │
│  Home   Tickets  New   Products  Me   │
│                                       │
└───────────────────────────────────────┘

(Bottom Navigation for Mobile)
```

### 6.3 Color Scheme & Design Tokens

```
┌─────────────────────────────────────────────────────────────────┐
│                    DESIGN SYSTEM TOKENS                          │
└─────────────────────────────────────────────────────────────────┘

BRAND COLORS (Suggested - Professional IT Theme)
────────────────────────────────────────────────
Primary:        #0066CC (Trust Blue)
Primary Dark:   #004499
Primary Light:  #E6F0FA

Secondary:      #10B981 (Success Green)
Accent:         #F59E0B (Warning Amber)
Danger:         #EF4444 (Error Red)

NEUTRAL PALETTE
────────────────
Gray 900:       #111827 (Text Primary)
Gray 700:       #374151 (Text Secondary)
Gray 500:       #6B7280 (Text Muted)
Gray 200:       #E5E7EB (Borders)
Gray 100:       #F3F4F6 (Background Alt)
White:          #FFFFFF (Background)

STATUS COLORS
────────────────
Pending:        #6B7280 (Gray)
Assigned:       #3B82F6 (Blue)
In Progress:    #F59E0B (Amber)
On Hold:        #EF4444 (Red)
Resolved:       #10B981 (Green)
Closed:         #111827 (Dark)

PRIORITY COLORS
────────────────
Critical:       #DC2626 (Red 600) + Pulse Animation
High:           #F97316 (Orange 500)
Medium:         #FBBF24 (Amber 400)
Low:            #6B7280 (Gray 500)

TYPOGRAPHY (Tailwind Classes)
────────────────────────────────
Headings:       font-bold tracking-tight
  H1:           text-3xl md:text-4xl
  H2:           text-2xl md:text-3xl
  H3:           text-xl md:text-2xl

Body:           font-normal
  Large:        text-lg
  Base:         text-base
  Small:        text-sm
  XSmall:       text-xs

SPACING SYSTEM
────────────────
Page Padding:   p-4 md:p-6 lg:p-8
Card Padding:   p-4 md:p-6
Gap (items):    gap-4 md:gap-6
Section Gap:    space-y-8 md:space-y-12

BORDER RADIUS
────────────────
Small:          rounded
Default:        rounded-md
Large:          rounded-lg
XLarge:         rounded-xl
Full:           rounded-full (avatars, badges)

SHADOWS (for Cards/Modals)
────────────────
Card:           shadow-sm
Card Hover:     shadow-md
Modal:          shadow-xl
Dropdown:       shadow-lg
```

### 6.4 Component Specifications

```
┌─────────────────────────────────────────────────────────────────┐
│                  KEY COMPONENT SPECS                             │
└─────────────────────────────────────────────────────────────────┘

TICKET CARD COMPONENT
─────────────────────
┌─────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │  #APX-2024-00142                              [⚡ Critical]  │ │
│ │  ───────────────────────────────────────────────────────    │ │
│ │                                                             │ │
│ │  📍 ABC Corporation                                         │ │
│ │  Server not responding - Production down                    │ │
│ │                                                             │ │
│ │  ┌────────────┐ ┌────────────┐ ┌────────────┐             │ │
│ │  │ 👤 Assigned│ │ ⏱️ Created │ │ 🎯 SLA     │             │ │
│ │  │ John Doe   │ │ 2h ago     │ │ 45min left │             │ │
│ │  └────────────┘ └────────────┘ └────────────┘             │ │
│ │                                                             │ │
│ │  [🟡 In Progress ▼]                          [View Details] │ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

States:
- Default: border-gray-200, bg-white
- Hover: shadow-md, border-primary-200
- SLA Warning: border-amber-300, bg-amber-50
- SLA Breached: border-red-300, bg-red-50


STATUS BADGE COMPONENT
──────────────────────
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│ ⚪ Pending     │  │ 🔵 Assigned    │  │ 🟡 In Progress │
│ bg-gray-100    │  │ bg-blue-100    │  │ bg-amber-100   │
│ text-gray-700  │  │ text-blue-700  │  │ text-amber-700 │
└────────────────┘  └────────────────┘  └────────────────┘

┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│ 🔴 On Hold     │  │ 🟢 Resolved    │  │ ⚫ Closed      │
│ bg-red-100     │  │ bg-green-100   │  │ bg-gray-800    │
│ text-red-700   │  │ text-green-700 │  │ text-white     │
└────────────────┘  └────────────────┘  └────────────────┘


STATS CARD COMPONENT
────────────────────
┌─────────────────────────┐
│                         │
│   📊  Open Tickets      │
│                         │
│        12               │  ← Large number (text-3xl font-bold)
│                         │
│   ↑ 3 from yesterday    │  ← Trend indicator (text-sm text-muted)
│                         │
└─────────────────────────┘

Variants:
- Default: bg-white border
- Highlight: bg-primary-50 border-primary-200
- Warning: bg-amber-50 border-amber-200
- Danger: bg-red-50 border-red-200


TIMELINE COMPONENT (Ticket History)
───────────────────────────────────
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ● ──── Ticket Created                              10:30 AM   │
│  │      Customer reported: "Server not responding"             │
│  │                                                              │
│  ● ──── Assigned to John Doe                        10:35 AM   │
│  │      Priority set to Critical                               │
│  │                                                              │
│  ● ──── Status: In Progress                         10:50 AM   │
│  │      Technician en route                                    │
│  │                                                              │
│  ● ──── Note Added                                  11:15 AM   │
│  │      "Arrived on site. Diagnosing issue..."                 │
│  │                                                              │
│  ○ ──── Current                                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Real-time Features

### 7.1 Supabase Realtime Implementation

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        REAL-TIME ARCHITECTURE                                    │
└─────────────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────────────────┐
                    │         SUPABASE REALTIME           │
                    │                                     │
                    │  ┌─────────────────────────────┐   │
                    │  │    PostgreSQL Changes       │   │
                    │  │    (Publication: realtime)  │   │
                    │  └─────────────┬───────────────┘   │
                    │                │                    │
                    │                ▼                    │
                    │  ┌─────────────────────────────┐   │
                    │  │   Broadcast to Channels     │   │
                    │  └─────────────┬───────────────┘   │
                    │                │                    │
                    └────────────────┼────────────────────┘
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           │                         │                         │
           ▼                         ▼                         ▼
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│   ADMIN DASHBOARD    │  │   TECHNICIAN APP     │  │   CUSTOMER PORTAL    │
│                      │  │                      │  │                      │
│ Subscribes to:       │  │ Subscribes to:       │  │ Subscribes to:       │
│ - All tickets        │  │ - Assigned tickets   │  │ - Own tickets        │
│ - All orders         │  │ - Notifications      │  │ - Notifications      │
│ - SLA alerts         │  │                      │  │                      │
│ - System metrics     │  │ Channel:             │  │ Channel:             │
│                      │  │ `tickets:user_id`    │  │ `tickets:customer_id`│
│ Channel:             │  │                      │  │                      │
│ `admin:all`          │  │                      │  │                      │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘


REALTIME SUBSCRIPTION CHANNELS
──────────────────────────────

1. Ticket Updates Channel
   ┌─────────────────────────────────────────────────────────────┐
   │  Channel: `tickets`                                         │
   │  Filter: Based on role (admin=all, tech=assigned, cust=own)│
   │                                                             │
   │  Events:                                                    │
   │  - INSERT: New ticket created                              │
   │  - UPDATE: Status change, assignment, notes added          │
   │  - DELETE: Ticket cancelled                                │
   │                                                             │
   │  Payload: { ticket_id, status, assigned_to, updated_at }   │
   └─────────────────────────────────────────────────────────────┘

2. Notifications Channel
   ┌─────────────────────────────────────────────────────────────┐
   │  Channel: `notifications:user_id`                           │
   │  Filter: user_id = current user                            │
   │                                                             │
   │  Events:                                                    │
   │  - INSERT: New notification                                │
   │                                                             │
   │  Payload: { id, title, message, type, link }               │
   └─────────────────────────────────────────────────────────────┘

3. Inventory Alerts Channel (Admin/Marketing Only)
   ┌─────────────────────────────────────────────────────────────┐
   │  Channel: `inventory:alerts`                                │
   │  Filter: stock_quantity <= reorder_level                   │
   │                                                             │
   │  Events:                                                    │
   │  - UPDATE: Stock level changed                             │
   │                                                             │
   │  Payload: { product_id, name, stock_quantity, reorder }    │
   └─────────────────────────────────────────────────────────────┘
```

### 7.2 Notification System

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        NOTIFICATION TRIGGERS                                     │
└─────────────────────────────────────────────────────────────────────────────────┘

AUTOMATIC NOTIFICATIONS (Database Triggers)
───────────────────────────────────────────

Event                          │ Recipients        │ Message
──────────────────────────────────────────────────────────────
New ticket created             │ Admins            │ "New service request from {customer}"
Ticket assigned                │ Technician        │ "New ticket #{number} assigned to you"
Ticket status → In Progress    │ Customer          │ "Technician is working on your request"
Ticket status → Resolved       │ Customer          │ "Your service request has been resolved"
SLA warning (30min before)     │ Admin, Technician │ "⚠️ SLA deadline approaching for #{number}"
SLA breached                   │ Admin, Director   │ "🚨 SLA BREACHED: Ticket #{number}"
Low stock alert                │ Admin, Marketing  │ "Low stock: {product} ({qty} remaining)"
New order placed               │ Marketing         │ "New order #{number} - Rs. {total}"
Agreement expiring (7 days)    │ Admin, Customer   │ "Service agreement expires in 7 days"


NOTIFICATION DELIVERY METHODS
────────────────────────────
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1. IN-APP (Real-time)                                     │
│     └─▶ Supabase Realtime → Bell icon badge update         │
│                                                             │
│  2. BROWSER PUSH (PWA)                                     │
│     └─▶ Service Worker → Push notification                 │
│                                                             │
│  3. EMAIL (Optional - via Supabase Edge Functions)         │
│     └─▶ Critical alerts, daily digest                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Security Considerations

### 8.1 Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        SECURITY LAYERS                                           │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                            CLIENT LAYER                                          │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  • HTTPS Only (SSL/TLS)                                                    │ │
│  │  • HttpOnly Cookies for tokens                                             │ │
│  │  • CSRF Protection                                                         │ │
│  │  • Input Sanitization (client-side validation)                            │ │
│  │  • Content Security Policy (CSP) headers                                  │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           MIDDLEWARE LAYER                                       │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  • Route Protection (Next.js Middleware)                                   │ │
│  │  • Session Validation                                                      │ │
│  │  • Role-based Access Control (RBAC)                                       │ │
│  │  • Rate Limiting (per IP/user)                                            │ │
│  │  • Request Logging                                                        │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           SUPABASE LAYER                                         │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  AUTHENTICATION                                                            │ │
│  │  • Magic Link (passwordless)                                              │ │
│  │  • Email/Password with email verification                                 │ │
│  │  • JWT tokens with refresh rotation                                       │ │
│  │  • Session management                                                     │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  DATABASE SECURITY                                                         │ │
│  │  • Row Level Security (RLS) on ALL tables                                 │ │
│  │  • Column-level permissions                                               │ │
│  │  • Prepared statements (SQL injection prevention)                         │ │
│  │  • Encrypted connections                                                  │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  API SECURITY                                                              │ │
│  │  • anon key (public, limited by RLS)                                      │ │
│  │  • service_role key (server-side only, bypasses RLS)                      │ │
│  │  • API rate limiting                                                      │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION FLOWS                                      │
└─────────────────────────────────────────────────────────────────────────────────┘

MAGIC LINK FLOW (Recommended for Customers)
───────────────────────────────────────────

    User                    Next.js App                Supabase Auth
     │                          │                           │
     │  1. Enter email          │                           │
     │─────────────────────────▶│                           │
     │                          │                           │
     │                          │  2. signInWithOtp(email)  │
     │                          │──────────────────────────▶│
     │                          │                           │
     │                          │  3. Magic link sent       │
     │◀─────────────────────────│◀──────────────────────────│
     │  "Check your email"      │                           │
     │                          │                           │
     │  4. Click link in email  │                           │
     │─────────────────────────────────────────────────────▶│
     │                          │                           │
     │                          │  5. Session created       │
     │◀─────────────────────────│◀──────────────────────────│
     │  Redirected to dashboard │                           │
     │                          │                           │


PASSWORD FLOW (For Staff)
─────────────────────────

    User                    Next.js App                Supabase Auth
     │                          │                           │
     │  1. Email + Password     │                           │
     │─────────────────────────▶│                           │
     │                          │                           │
     │                          │  2. signInWithPassword()  │
     │                          │──────────────────────────▶│
     │                          │                           │
     │                          │  3. Validate credentials  │
     │                          │                           │
     │                          │  4. Return session + JWT  │
     │◀─────────────────────────│◀──────────────────────────│
     │  Set HttpOnly cookie     │                           │
     │  Redirect to dashboard   │                           │


SESSION MANAGEMENT
──────────────────
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Access Token:  Short-lived (1 hour)                           │
│                 Stored in memory                                │
│                                                                 │
│  Refresh Token: Long-lived (1 week)                            │
│                 Stored in HttpOnly cookie                       │
│                                                                 │
│  Token Refresh: Automatic via Supabase client                  │
│                 Silent refresh before expiry                    │
│                                                                 │
│  Logout:        Clear all tokens                               │
│                 Invalidate session on server                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 8.3 Data Protection

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        DATA PROTECTION MEASURES                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

SENSITIVE DATA HANDLING
───────────────────────
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  Data Type               │ Protection Method                        │
│  ────────────────────────────────────────────────────────────────   │
│  Passwords               │ Handled by Supabase (bcrypt hashing)     │
│  Email addresses         │ RLS (users see only own/assigned)        │
│  Phone numbers           │ RLS (restricted access)                  │
│  Addresses               │ RLS + encrypted at rest (Supabase)       │
│  Payment info            │ NOT STORED (use payment provider)        │
│  Service history         │ RLS (customer sees own only)             │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

AUDIT LOGGING
─────────────
All sensitive operations are logged:
- User authentication events (login, logout, failed attempts)
- Role/permission changes
- Ticket status changes (via ticket_history table)
- Data exports
- Admin actions

BACKUP & RECOVERY
─────────────────
- Supabase automatic daily backups
- Point-in-time recovery (PITR) available
- Manual backup exports for compliance
```

---

## 9. Implementation Phases (Recommended)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        IMPLEMENTATION ROADMAP                                    │
└─────────────────────────────────────────────────────────────────────────────────┘

PHASE 1: FOUNDATION
───────────────────
□ Project setup (Next.js, Tailwind, shadcn/ui)
□ Supabase project creation
□ Database schema implementation
□ RLS policies setup
□ Authentication system
□ Basic routing structure

PHASE 2: CORE FEATURES
──────────────────────
□ Landing page (public)
□ Customer portal
  □ Service request form
  □ Ticket tracking
  □ Service history
□ Admin dashboard
  □ User management
  □ Ticket management
  □ Assignment system

PHASE 3: STAFF FEATURES
───────────────────────
□ Technician portal
  □ Assigned tickets view
  □ Status updates
  □ Notes & parts tracking
□ Inventory management
  □ Product CRUD
  □ Stock tracking
  □ Low stock alerts

PHASE 4: SALES & ORDERS
───────────────────────
□ Product catalog (public)
□ Order management
□ Invoice generation
□ Sales reports

PHASE 5: ADVANCED FEATURES
──────────────────────────
□ Real-time notifications
□ PWA implementation
□ SLA monitoring & alerts
□ Analytics dashboard
□ Email notifications (optional)

PHASE 6: OPTIMIZATION
─────────────────────
□ Performance optimization
□ SEO implementation
□ Accessibility audit
□ Security audit
□ Load testing
```

---

## 10. File Checklist

```
DOCUMENTS TO CREATE BEFORE CODING
─────────────────────────────────
✓ SYSTEM_ARCHITECTURE.md (this document)
□ DATABASE_SCHEMA.sql (ready-to-run SQL)
□ API_DOCUMENTATION.md (endpoints, payloads)
□ COMPONENT_LIBRARY.md (UI component specs)
□ TESTING_STRATEGY.md (test cases)

CONFIGURATION FILES NEEDED
──────────────────────────
□ .env.local (Supabase keys)
□ next.config.js (PWA, images)
□ tailwind.config.js (design tokens)
□ middleware.ts (route protection)
□ manifest.json (PWA)
```

---

*Document Version: 1.0*
*Created for: Apex Computer Technology*
*Tech Stack: Next.js 14+ | Supabase | Tailwind CSS | shadcn/ui*
