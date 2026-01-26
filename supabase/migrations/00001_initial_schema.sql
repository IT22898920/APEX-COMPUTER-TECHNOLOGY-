-- ============================================================================
-- APEX COMPUTER TECHNOLOGY - DATABASE SCHEMA
-- Service & Sales Management System
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SEQUENCES
-- ============================================================================

CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- ============================================================================
-- TABLES
-- ============================================================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'staff', 'customer')),
  staff_type TEXT CHECK (staff_type IN ('technician', 'marketing', 'support') OR staff_type IS NULL),
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  company_name TEXT,
  address JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  cost_price DECIMAL(10,2) NOT NULL,
  selling_price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  reorder_level INTEGER DEFAULT 5,
  specifications JSONB,
  images JSONB[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Agreements table
CREATE TABLE IF NOT EXISTS service_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  agreement_type TEXT NOT NULL CHECK (agreement_type IN ('comprehensive', 'labour_only', 'on_call')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
  monthly_fee DECIMAL(10,2),
  response_time_hours INTEGER DEFAULT 3,
  coverage_details JSONB,
  devices_covered JSONB[],
  terms_conditions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Tickets table
CREATE TABLE IF NOT EXISTS service_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  agreement_id UUID REFERENCES service_agreements(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  device_info JSONB,
  problem_category TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'on_hold', 'resolved', 'closed', 'cancelled')),
  service_location JSONB,
  is_onsite BOOLEAN DEFAULT true,
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  sla_deadline TIMESTAMPTZ,
  sla_breached BOOLEAN DEFAULT false,
  estimated_cost DECIMAL(10,2),
  final_cost DECIMAL(10,2),
  is_billable BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ticket Notes table
CREATE TABLE IF NOT EXISTS ticket_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES service_tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'diagnosis', 'resolution', 'customer_feedback', 'internal')),
  content TEXT NOT NULL,
  attachments JSONB[],
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ticket Parts Used table
CREATE TABLE IF NOT EXISTS ticket_parts_used (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES service_tickets(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  is_billable BOOLEAN DEFAULT true,
  added_by UUID NOT NULL REFERENCES profiles(id),
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ticket History table
CREATE TABLE IF NOT EXISTS ticket_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES service_tickets(id) ON DELETE CASCADE,
  changed_by UUID NOT NULL REFERENCES profiles(id),
  field_changed TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  notes TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE,
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
  payment_method TEXT,
  delivery_address JSONB,
  delivery_notes TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory Logs table
CREATE TABLE IF NOT EXISTS inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL CHECK (change_type IN ('purchase', 'sale', 'repair_use', 'adjustment', 'return', 'damaged')),
  quantity_change INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  notes TEXT,
  performed_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'ticket', 'order')),
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_staff_type ON profiles(staff_type);
CREATE INDEX IF NOT EXISTS idx_service_agreements_customer ON service_agreements(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_agreements_status ON service_agreements(status);
CREATE INDEX IF NOT EXISTS idx_service_tickets_customer ON service_tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_tickets_assigned ON service_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_service_tickets_status ON service_tickets(status);
CREATE INDEX IF NOT EXISTS idx_service_tickets_priority ON service_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_service_tickets_sla ON service_tickets(sla_deadline) WHERE sla_breached = false;
CREATE INDEX IF NOT EXISTS idx_ticket_notes_ticket ON ticket_notes(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_history_ticket ON ticket_history(ticket_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_product ON inventory_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id) WHERE is_read = false;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

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

-- Check if user is staff (admin or staff)
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER FUNCTIONS
-- ============================================================================

-- Auto-generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := 'APX-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
      LPAD(NEXTVAL('ticket_number_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
      LPAD(NEXTVAL('order_number_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Calculate SLA deadline
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
    response_hours := 3;
  END IF;

  -- Set SLA deadline
  NEW.sla_deadline := NEW.reported_at + (response_hours || ' hours')::INTERVAL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Log ticket changes
CREATE OR REPLACE FUNCTION log_ticket_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO ticket_history (ticket_id, changed_by, field_changed, old_value, new_value)
    VALUES (NEW.id, auth.uid(), 'status', OLD.status, NEW.status);

    -- Update timestamp fields based on status
    IF NEW.status = 'assigned' AND OLD.status = 'pending' THEN
      NEW.assigned_at := NOW();
    ELSIF NEW.status = 'in_progress' AND NEW.started_at IS NULL THEN
      NEW.started_at := NOW();
      -- Check SLA breach
      IF NEW.started_at > NEW.sla_deadline THEN
        NEW.sla_breached := true;
      END IF;
    ELSIF NEW.status = 'resolved' THEN
      NEW.resolved_at := NOW();
    ELSIF NEW.status = 'closed' THEN
      NEW.closed_at := NOW();
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

-- Handle ticket part used - deduct from inventory
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

  -- Check reorder level and notify
  IF (current_stock - NEW.quantity) <= (
    SELECT reorder_level FROM products WHERE id = NEW.product_id
  ) THEN
    INSERT INTO notifications (user_id, title, message, type, link)
    SELECT id, 'Low Stock Alert',
           'Product "' || product_name || '" is below reorder level (' || (current_stock - NEW.quantity) || ' remaining)',
           'warning',
           '/staff/inventory/' || NEW.product_id
    FROM profiles WHERE role = 'admin' OR (role = 'staff' AND staff_type = 'marketing');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Handle order confirmation - deduct stock
CREATE OR REPLACE FUNCTION handle_order_confirmed()
RETURNS TRIGGER AS $$
DECLARE
  item RECORD;
  current_stock INTEGER;
  product_name TEXT;
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
    -- Loop through order items and deduct stock
    FOR item IN SELECT * FROM order_items WHERE order_id = NEW.id LOOP
      SELECT stock_quantity, name INTO current_stock, product_name
      FROM products WHERE id = item.product_id;

      -- Check stock
      IF current_stock < item.quantity THEN
        RAISE EXCEPTION 'Insufficient stock for %: Available %, Requested %',
          product_name, current_stock, item.quantity;
      END IF;

      -- Update stock
      UPDATE products
      SET stock_quantity = stock_quantity - item.quantity,
          updated_at = NOW()
      WHERE id = item.product_id;

      -- Log inventory change
      INSERT INTO inventory_logs (
        product_id, change_type, quantity_change,
        previous_quantity, new_quantity,
        reference_type, reference_id, performed_by
      ) VALUES (
        item.product_id, 'sale', -item.quantity,
        current_stock, current_stock - item.quantity,
        'order', NEW.id, COALESCE(NEW.created_by, auth.uid())
      );

      -- Check reorder level
      IF (current_stock - item.quantity) <= (
        SELECT reorder_level FROM products WHERE id = item.product_id
      ) THEN
        INSERT INTO notifications (user_id, title, message, type)
        SELECT id, 'Low Stock Alert',
               'Product "' || product_name || '" is below reorder level',
               'warning'
        FROM profiles WHERE role = 'admin' OR (role = 'staff' AND staff_type = 'marketing');
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Ticket number generation
DROP TRIGGER IF EXISTS trigger_generate_ticket_number ON service_tickets;
CREATE TRIGGER trigger_generate_ticket_number
  BEFORE INSERT ON service_tickets
  FOR EACH ROW EXECUTE FUNCTION generate_ticket_number();

-- Order number generation
DROP TRIGGER IF EXISTS trigger_generate_order_number ON orders;
CREATE TRIGGER trigger_generate_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- SLA deadline calculation
DROP TRIGGER IF EXISTS trigger_calculate_sla ON service_tickets;
CREATE TRIGGER trigger_calculate_sla
  BEFORE INSERT ON service_tickets
  FOR EACH ROW EXECUTE FUNCTION calculate_sla_deadline();

-- Ticket change logging
DROP TRIGGER IF EXISTS trigger_log_ticket_changes ON service_tickets;
CREATE TRIGGER trigger_log_ticket_changes
  BEFORE UPDATE ON service_tickets
  FOR EACH ROW EXECUTE FUNCTION log_ticket_changes();

-- Ticket parts inventory deduction
DROP TRIGGER IF EXISTS trigger_ticket_part_used ON ticket_parts_used;
CREATE TRIGGER trigger_ticket_part_used
  AFTER INSERT ON ticket_parts_used
  FOR EACH ROW EXECUTE FUNCTION handle_ticket_part_used();

-- Order confirmation inventory deduction
DROP TRIGGER IF EXISTS trigger_order_confirmed ON orders;
CREATE TRIGGER trigger_order_confirmed
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION handle_order_confirmed();

-- Updated_at triggers
DROP TRIGGER IF EXISTS trigger_profiles_updated ON profiles;
CREATE TRIGGER trigger_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_products_updated ON products;
CREATE TRIGGER trigger_products_updated
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_agreements_updated ON service_agreements;
CREATE TRIGGER trigger_agreements_updated
  BEFORE UPDATE ON service_agreements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_orders_updated ON orders;
CREATE TRIGGER trigger_orders_updated
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- New user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_parts_used ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =====================
-- PROFILES POLICIES
-- =====================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Staff can view all profiles" ON profiles;
CREATE POLICY "Staff can view all profiles"
  ON profiles FOR SELECT
  USING (is_staff());

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    -- Prevent users from changing their own role (only admin can)
    (role = (SELECT role FROM profiles WHERE id = auth.uid()) OR is_admin())
  );

DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "System can insert profiles" ON profiles;
CREATE POLICY "System can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================
-- SERVICE AGREEMENTS POLICIES
-- =====================

DROP POLICY IF EXISTS "Customers view own agreements" ON service_agreements;
CREATE POLICY "Customers view own agreements"
  ON service_agreements FOR SELECT
  USING (customer_id = auth.uid() OR is_staff());

DROP POLICY IF EXISTS "Staff manage agreements" ON service_agreements;
CREATE POLICY "Staff manage agreements"
  ON service_agreements FOR ALL
  USING (is_staff());

-- =====================
-- SERVICE TICKETS POLICIES
-- =====================

DROP POLICY IF EXISTS "Customers view own tickets" ON service_tickets;
CREATE POLICY "Customers view own tickets"
  ON service_tickets FOR SELECT
  USING (customer_id = auth.uid());

DROP POLICY IF EXISTS "Staff view all tickets" ON service_tickets;
CREATE POLICY "Staff view all tickets"
  ON service_tickets FOR SELECT
  USING (is_staff());

DROP POLICY IF EXISTS "Customers can create tickets" ON service_tickets;
CREATE POLICY "Customers can create tickets"
  ON service_tickets FOR INSERT
  WITH CHECK (customer_id = auth.uid() OR is_staff());

DROP POLICY IF EXISTS "Staff can update tickets" ON service_tickets;
CREATE POLICY "Staff can update tickets"
  ON service_tickets FOR UPDATE
  USING (is_staff());

DROP POLICY IF EXISTS "Customers can update own ticket status" ON service_tickets;
CREATE POLICY "Customers can update own ticket status"
  ON service_tickets FOR UPDATE
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

-- =====================
-- TICKET NOTES POLICIES
-- =====================

DROP POLICY IF EXISTS "Customers view non-internal notes on own tickets" ON ticket_notes;
CREATE POLICY "Customers view non-internal notes on own tickets"
  ON ticket_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM service_tickets
      WHERE id = ticket_notes.ticket_id AND customer_id = auth.uid()
    ) AND is_internal = false
  );

DROP POLICY IF EXISTS "Staff view all notes" ON ticket_notes;
CREATE POLICY "Staff view all notes"
  ON ticket_notes FOR SELECT
  USING (is_staff());

DROP POLICY IF EXISTS "Staff can add notes" ON ticket_notes;
CREATE POLICY "Staff can add notes"
  ON ticket_notes FOR INSERT
  WITH CHECK (is_staff());

DROP POLICY IF EXISTS "Customers can add notes to own tickets" ON ticket_notes;
CREATE POLICY "Customers can add notes to own tickets"
  ON ticket_notes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM service_tickets
      WHERE id = ticket_notes.ticket_id AND customer_id = auth.uid()
    ) AND is_internal = false
  );

-- =====================
-- TICKET PARTS USED POLICIES
-- =====================

DROP POLICY IF EXISTS "Staff manage ticket parts" ON ticket_parts_used;
CREATE POLICY "Staff manage ticket parts"
  ON ticket_parts_used FOR ALL
  USING (is_staff());

DROP POLICY IF EXISTS "Customers view parts on own tickets" ON ticket_parts_used;
CREATE POLICY "Customers view parts on own tickets"
  ON ticket_parts_used FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM service_tickets
      WHERE id = ticket_parts_used.ticket_id AND customer_id = auth.uid()
    )
  );

-- =====================
-- TICKET HISTORY POLICIES
-- =====================

DROP POLICY IF EXISTS "Staff view all history" ON ticket_history;
CREATE POLICY "Staff view all history"
  ON ticket_history FOR SELECT
  USING (is_staff());

DROP POLICY IF EXISTS "Customers view own ticket history" ON ticket_history;
CREATE POLICY "Customers view own ticket history"
  ON ticket_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM service_tickets
      WHERE id = ticket_history.ticket_id AND customer_id = auth.uid()
    )
  );

-- =====================
-- CATEGORIES POLICIES
-- =====================

DROP POLICY IF EXISTS "Anyone can view active categories" ON categories;
CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT
  USING (is_active = true OR is_staff());

DROP POLICY IF EXISTS "Staff manage categories" ON categories;
CREATE POLICY "Staff manage categories"
  ON categories FOR ALL
  USING (is_admin() OR (is_staff() AND get_staff_type() = 'marketing'));

-- =====================
-- PRODUCTS POLICIES
-- =====================

DROP POLICY IF EXISTS "Anyone can view active products" ON products;
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (is_active = true OR is_staff());

DROP POLICY IF EXISTS "Marketing staff manage products" ON products;
CREATE POLICY "Marketing staff manage products"
  ON products FOR ALL
  USING (is_admin() OR (is_staff() AND get_staff_type() = 'marketing'));

-- =====================
-- ORDERS POLICIES
-- =====================

DROP POLICY IF EXISTS "Customers view own orders" ON orders;
CREATE POLICY "Customers view own orders"
  ON orders FOR SELECT
  USING (customer_id = auth.uid() OR is_staff());

DROP POLICY IF EXISTS "Staff manage orders" ON orders;
CREATE POLICY "Staff manage orders"
  ON orders FOR ALL
  USING (is_staff());

-- =====================
-- ORDER ITEMS POLICIES
-- =====================

DROP POLICY IF EXISTS "View order items with order access" ON order_items;
CREATE POLICY "View order items with order access"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE id = order_items.order_id AND (customer_id = auth.uid() OR is_staff())
    )
  );

DROP POLICY IF EXISTS "Staff manage order items" ON order_items;
CREATE POLICY "Staff manage order items"
  ON order_items FOR ALL
  USING (is_staff());

-- =====================
-- INVENTORY LOGS POLICIES
-- =====================

DROP POLICY IF EXISTS "Staff view inventory logs" ON inventory_logs;
CREATE POLICY "Staff view inventory logs"
  ON inventory_logs FOR SELECT
  USING (is_staff());

DROP POLICY IF EXISTS "Staff create inventory logs" ON inventory_logs;
CREATE POLICY "Staff create inventory logs"
  ON inventory_logs FOR INSERT
  WITH CHECK (is_staff());

-- =====================
-- NOTIFICATIONS POLICIES
-- =====================

DROP POLICY IF EXISTS "Users view own notifications" ON notifications;
CREATE POLICY "Users view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own notifications" ON notifications;
CREATE POLICY "Users update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can create notifications" ON notifications;
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- REALTIME PUBLICATIONS
-- ============================================================================

-- Enable realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE service_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE ticket_notes;

-- ============================================================================
-- SEED DATA (Optional - Default Categories)
-- ============================================================================

INSERT INTO categories (name, slug, description, display_order) VALUES
  ('Computer Hardware', 'computer-hardware', 'Desktops, laptops, and components', 1),
  ('Networking', 'networking', 'Routers, switches, cables, and accessories', 2),
  ('Storage', 'storage', 'Hard drives, SSDs, and USB drives', 3),
  ('Peripherals', 'peripherals', 'Keyboards, mice, monitors, and printers', 4),
  ('Software', 'software', 'Operating systems and applications', 5),
  ('Accessories', 'accessories', 'Cables, adapters, and misc items', 6)
ON CONFLICT (slug) DO NOTHING;
