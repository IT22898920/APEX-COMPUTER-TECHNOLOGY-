-- ============================================================================
-- SERVICES TABLE - For dynamic services management
-- ============================================================================

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon TEXT DEFAULT 'Monitor',
  image_url TEXT,
  features JSONB DEFAULT '[]',
  is_featured BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for ordering
CREATE INDEX IF NOT EXISTS idx_services_display_order ON services(display_order);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_featured ON services(is_featured) WHERE is_featured = true;

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Policies for services
DROP POLICY IF EXISTS "Anyone can view active services" ON services;
CREATE POLICY "Anyone can view active services"
  ON services FOR SELECT
  USING (is_active = true OR is_staff());

DROP POLICY IF EXISTS "Admins manage services" ON services;
CREATE POLICY "Admins manage services"
  ON services FOR ALL
  USING (is_admin());

-- Updated_at trigger
DROP TRIGGER IF EXISTS trigger_services_updated ON services;
CREATE TRIGGER trigger_services_updated
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed with APEX Computer Technology actual services
INSERT INTO services (title, slug, description, icon, features, display_order, is_featured) VALUES
  (
    'Computer & Laptop Sales',
    'computer-laptop-sales',
    'Sales of all branded computers, laptops and printers. Also non-branded assembled customized computers at competitive prices.',
    'Monitor',
    '["Branded Computers & Laptops", "Assembled/Customized PCs", "Printers", "Competitive Prices"]',
    1,
    true
  ),
  (
    'Hardware Maintenance',
    'hardware-maintenance',
    'Professional maintenance of computers, printers, monitors, UPS and other IT equipment.',
    'Wrench',
    '["Computer Maintenance", "Printer Service", "Monitor Repairs", "UPS Service"]',
    2,
    true
  ),
  (
    'Printer Sales & Repairs',
    'printer-sales-repairs',
    'Low cost repairs on HP, Epson, Canon & Lexmark printers. New printer sales with warranty.',
    'Printer',
    '["HP Printers", "Epson Printers", "Canon Printers", "Lexmark Printers"]',
    3,
    true
  ),
  (
    'RAM & Memory Sales',
    'ram-memory-sales',
    'Sales of Kingston RAMs, Memory modules and storage devices at competitive prices.',
    'HardDrive',
    '["Kingston RAM", "Memory Modules", "SSD/HDD", "Competitive Prices"]',
    4,
    true
  ),
  (
    'Network Cables & Accessories',
    'network-cables-accessories',
    'High quality Cat5e and Cat6 network cables at unbeatable prices. Computer and network accessories.',
    'Cable',
    '["Cat5e Cables", "Cat6 Cables", "Network Accessories", "Computer Accessories"]',
    5,
    true
  ),
  (
    'Consumables & Cartridges',
    'consumables-cartridges',
    'Supply of HP, Canon, Epson & Lexmark original toners, ink and ribbon cartridges. ASTA compatible cartridges available.',
    'Package',
    '["Original Toners", "Ink Cartridges", "Ribbon Cartridges", "ASTA Compatible"]',
    6,
    true
  ),
  (
    'Network & Power Cabling',
    'network-power-cabling',
    'Professional network and power cabling services for new or existing office buildings.',
    'Network',
    '["Office Cabling", "Network Setup", "Power Cabling", "Building Wiring"]',
    7,
    true
  ),
  (
    'Computer/Laptop Rental',
    'computer-laptop-rental',
    'Short-term and long-term computer and laptop rental services for businesses and events.',
    'Laptop',
    '["Short-term Rental", "Long-term Rental", "Event Equipment", "Business Solutions"]',
    8,
    true
  ),
  (
    'Service Agreements',
    'service-agreements',
    'Flexible maintenance contracts: Comprehensive, Labour Only, and On-Call basis plans.',
    'FileText',
    '["Comprehensive Plan", "Labour Only Plan", "On-Call Basis", "Priority Support"]',
    9,
    true
  )
ON CONFLICT (slug) DO NOTHING;
