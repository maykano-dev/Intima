-- 1. Create platform_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exchange_rate_cny_to_ghs NUMERIC(10, 4) NOT NULL DEFAULT 0.2800,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Admin policies for settings
DROP POLICY IF EXISTS "Admins can manage settings" ON platform_settings;
CREATE POLICY "Admins can manage settings"
  ON platform_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Public can view settings (for price conversion on frontend)
DROP POLICY IF EXISTS "Public can view settings" ON platform_settings;
CREATE POLICY "Public can view settings"
  ON platform_settings FOR SELECT USING (true);

-- 2. Add price_cny to products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS price_cny NUMERIC(10, 2) DEFAULT 0;

-- 3. Add price_cny to product_variants
ALTER TABLE product_variants 
ADD COLUMN IF NOT EXISTS price_cny NUMERIC(10, 2) DEFAULT 0;

-- 4. Add admin_reply to reviews
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS admin_reply TEXT,
ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ;

-- 5. Add admin_reply to contact_messages
ALTER TABLE contact_messages 
ADD COLUMN IF NOT EXISTS admin_reply TEXT,
ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ;
