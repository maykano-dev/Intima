-- =============================================================================
-- INTIMA — Migration v2: Platform Settings, Shipping, Pricing, Security
-- =============================================================================
-- Adds: CNY pricing, sea/air shipping, banned users, platform rates, analytics
-- =============================================================================

-- 1. PRODUCTS — add CNY price and availability status
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_cny NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (price_cny >= 0);
ALTER TABLE products ADD COLUMN IF NOT EXISTS availability_status TEXT NOT NULL DEFAULT 'in_ghana' CHECK (availability_status IN ('in_ghana', 'pre_order'));

-- 2. SHIPPING OPTIONS — sea/air shipping methods
CREATE TABLE IF NOT EXISTS shipping_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  delivery_min_days INTEGER NOT NULL CHECK (delivery_min_days > 0),
  delivery_max_days INTEGER NOT NULL CHECK (delivery_max_days > 0),
  price_cny NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (price_cny >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ORDERS — add shipping option reference, shipping costs, and delivery tracking columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_option_id UUID REFERENCES shipping_options(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost_cny NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (shipping_cost_cny >= 0);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost_ghs NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (shipping_cost_ghs >= 0);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

-- 4. PLATFORM SETTINGS — exchange rate, single-row config
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exchange_rate_cny_to_ghs NUMERIC(10, 6) NOT NULL DEFAULT 0.280000 CHECK (exchange_rate_cny_to_ghs > 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- 5. BANNED USERS
CREATE TABLE IF NOT EXISTS banned_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  banned_by UUID REFERENCES auth.users(id),
  banned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 6. CUSTOMER NOTES — admin notes on customer accounts
CREATE TABLE IF NOT EXISTS customer_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. INDEXES
CREATE INDEX IF NOT EXISTS idx_products_availability ON products(availability_status);
CREATE INDEX IF NOT EXISTS idx_orders_shipping ON orders(shipping_option_id);
CREATE INDEX IF NOT EXISTS idx_banned_users_user ON banned_users(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_notes_user ON customer_notes(user_id);

-- 8. TRIGGERS
DROP TRIGGER IF EXISTS set_shipping_options_updated_at ON shipping_options;
CREATE TRIGGER set_shipping_options_updated_at
  BEFORE UPDATE ON shipping_options
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_platform_settings_updated_at ON platform_settings;
CREATE TRIGGER set_platform_settings_updated_at
  BEFORE UPDATE ON platform_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. RLS POLICIES
ALTER TABLE shipping_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE banned_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;

-- Public can view active shipping options
DROP POLICY IF EXISTS "Public can view active shipping options" ON shipping_options;
CREATE POLICY "Public can view active shipping options"
  ON shipping_options FOR SELECT
  USING (is_active = true);

-- Admins can manage shipping options
DROP POLICY IF EXISTS "Admins manage shipping options" ON shipping_options;
CREATE POLICY "Admins manage shipping options"
  ON shipping_options FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can view platform settings
DROP POLICY IF EXISTS "Admins view platform settings" ON platform_settings;
CREATE POLICY "Admins view platform settings"
  ON platform_settings FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins update platform settings" ON platform_settings;
CREATE POLICY "Admins update platform settings"
  ON platform_settings FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins manage banned users
DROP POLICY IF EXISTS "Admins manage banned users" ON banned_users;
CREATE POLICY "Admins manage banned users"
  ON banned_users FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins manage customer notes
DROP POLICY IF EXISTS "Admins manage customer notes" ON customer_notes;
CREATE POLICY "Admins manage customer notes"
  ON customer_notes FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 10. SEED DATA
-- Default shipping options
INSERT INTO shipping_options (name, description, delivery_min_days, delivery_max_days, price_cny, sort_order, is_active) VALUES
  ('Sea Freight', 'Most affordable option. Reliable and trackable.', 42, 56, 0, 1, true),
  ('Air Freight', 'Fastest delivery. Premium tracking included.', 10, 16, 0, 2, true)
ON CONFLICT (id) DO NOTHING;

-- Default platform settings (single row)
INSERT INTO platform_settings (exchange_rate_cny_to_ghs) VALUES (0.280000)
ON CONFLICT (id) DO NOTHING;

-- Seed price_cny for existing products (approximate CNY values based on GHS prices at ~0.28 rate)
UPDATE products SET price_cny = ROUND(price_ghs * 0.28) WHERE price_cny = 0 OR price_cny IS NULL;

-- 11. SALES ANALYTICS VIEW
CREATE OR REPLACE VIEW sales_summary AS
SELECT
  DATE_TRUNC('day', created_at)::DATE AS sale_date,
  COUNT(*)::INTEGER AS order_count,
  COALESCE(SUM(total), 0) AS revenue_ghs,
  COALESCE(SUM(SUM(total)) OVER (ORDER BY DATE_TRUNC('day', created_at)), 0) AS cumulative_revenue
FROM orders
WHERE status IN ('paid', 'processing', 'shipped', 'delivered')
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY sale_date DESC;

-- Monthly stats
CREATE OR REPLACE VIEW monthly_stats AS
SELECT
  DATE_TRUNC('month', created_at)::DATE AS month,
  COUNT(*)::INTEGER AS total_orders,
  COALESCE(SUM(total), 0) AS revenue_ghs,
  COUNT(*) FILTER (WHERE status = 'cancelled')::INTEGER AS cancelled_orders,
  COUNT(*) FILTER (WHERE status = 'delivered')::INTEGER AS delivered_orders,
  ROUND(
    AVG(EXTRACT(EPOCH FROM (COALESCE(delivered_at, NOW()) - created_at)) / 86400)::NUMERIC, 1
  ) AS avg_delivery_days
FROM orders
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
