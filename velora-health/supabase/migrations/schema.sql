-- =============================================================================
-- INTIMA — Full Supabase Database Schema
-- =============================================================================
-- Run this in the Supabase SQL Editor (or via `supabase migration up`)
-- to set up the complete database backend for the Intima e-commerce platform.
-- =============================================================================

-- 1. EXTENSIONS
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. ORDER ID SEQUENCE (for generating INT-XXXXXXXX order IDs)
-- =============================================================================
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 100001;

-- 3. TABLES
-- =============================================================================

-- 3a. PROFILES — extends Supabase Auth users with role & profile info
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3b. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3c. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  benefits TEXT,
  usage_guide TEXT,
  material TEXT,
  price_ghs NUMERIC(10, 2) NOT NULL CHECK (price_ghs >= 0),
  compare_price_ghs NUMERIC(10, 2) CHECK (compare_price_ghs IS NULL OR compare_price_ghs >= 0),
  images TEXT[] DEFAULT '{}',
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  rating NUMERIC(2, 1) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3d. CUSTOMER ADDRESSES — saved addresses linked to authenticated users
CREATE TABLE IF NOT EXISTS customer_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Home',
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT DEFAULT '',
  city TEXT NOT NULL DEFAULT 'Accra',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3e. ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Accra',
  notes TEXT DEFAULT '',
  total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_reference TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  discreet_packaging BOOLEAN NOT NULL DEFAULT true,
  tracking_number TEXT,
  estimated_delivery DATE,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3f. ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0)
);

-- 3g. REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3g. BLOG POSTS
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  excerpt TEXT,
  image TEXT,
  author TEXT NOT NULL DEFAULT 'Intima Wellness Team',
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3h. SUBSCRIBERS (newsletter)
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3i. CONTACT MESSAGES
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. INDEXES
-- =============================================================================
-- Products
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock) WHERE in_stock = true;
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin(name gin_trgm_ops);

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Order Items
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- Reviews
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(approved) WHERE approved = true;

-- Subscribers
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);

-- Contact Messages
CREATE INDEX IF NOT EXISTS idx_contact_read ON contact_messages(read);

-- Blog Posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at DESC);

-- Customer Addresses
CREATE INDEX IF NOT EXISTS idx_addresses_user ON customer_addresses(user_id);

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_tracking ON orders(tracking_number);

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 5. TRIGGER FUNCTIONS
-- =============================================================================

-- 5a. Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_customer_addresses_updated_at
  BEFORE UPDATE ON customer_addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5b. Auto-create profile on user signup (via Supabase Auth)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 5c. Generate order ID in format INT-XXXXXXXX
CREATE OR REPLACE FUNCTION generate_order_id()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := 'INT-';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 6. ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;

-- 6a. Public read access
CREATE POLICY "Public can view products"
  ON products FOR SELECT USING (true);

CREATE POLICY "Public can view categories"
  ON categories FOR SELECT USING (true);

CREATE POLICY "Public can view blog posts"
  ON blog_posts FOR SELECT USING (true);

CREATE POLICY "Public can view approved reviews"
  ON reviews FOR SELECT USING (approved = true);

-- 6b. Anonymous insert policies (for guest checkout, reviews, contact, subscribe)
CREATE POLICY "Anyone can submit reviews"
  ON reviews FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can submit contact messages"
  ON contact_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can subscribe"
  ON subscribers FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT WITH CHECK (true);

-- 6c. Order lookup by email (guests can view their own orders)
CREATE POLICY "Users can view their orders by email"
  ON orders FOR SELECT
  USING (customer_email = current_setting('request.jwt.claims', true)::json->>'email');

-- 6d. Admin access (users with role = 'admin' in profiles)
CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all subscribers"
  ON subscribers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all contact messages"
  ON contact_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update contact messages"
  ON contact_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage reviews"
  ON reviews FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all reviews"
  ON reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 6e. Users can view/update their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- 6f. Customer addresses policies
CREATE POLICY "Users can view own addresses"
  ON customer_addresses FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own addresses"
  ON customer_addresses FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own addresses"
  ON customer_addresses FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own addresses"
  ON customer_addresses FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all addresses"
  ON customer_addresses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 7. SEED DATA
-- =============================================================================

-- 7a. Categories
INSERT INTO categories (id, name, slug, description, image) VALUES
  ('vibrators',    'Vibrators & Stimulators',  'vibrators',    'Premium vibrators and stimulators for every experience level.',      '/images/category-vibrators.jpg'),
  ('male-pleasure','Male Pleasure',             'male-pleasure','Designed for male pleasure and performance enhancement.',            '/images/category-male.jpg'),
  ('couples',      'Couples Products',          'couples',      'Products to enhance intimacy for couples.',                          '/images/category-couples.jpg'),
  ('lubricants',   'Lubricants & Enhancers',    'lubricants',   'Premium lubricants and arousal enhancers.',                          '/images/category-lubricants.jpg'),
  ('anal',         'Anal Products',             'anal',         'Anal play products for beginners and advanced users.',               '/images/category-anal.jpg'),
  ('wellness',     'Wellness & Accessories',    'wellness',     'Essential accessories and wellness products.',                       '/images/category-wellness.jpg'),
  ('dildos',       'Dildos',                    'dildos',       'A wide range of dildos in various materials and styles.',            '/images/category-dildos.jpg')
ON CONFLICT (id) DO NOTHING;

-- 7b. Products
INSERT INTO products (name, slug, description, benefits, usage_guide, material, price_ghs, compare_price_ghs, images, category_id, in_stock, is_featured, rating, review_count) VALUES
  (
    'Whisper Bullet Vibrator',
    'whisper-bullet-vibrator',
    'Compact and powerful, the Whisper Bullet is the perfect entry-level vibrator. Its compact size makes it ideal for discreet storage and travel, while delivering surprisingly strong vibrations.',
    'Discreet size perfect for beginners\nPowerful vibrations in a compact body\nEasy to use with intuitive single-button control\nBattery-powered for cordless play\nUltra-quiet motor for private enjoyment',
    'Apply a small amount of water-based lubricant to the bullet head for enhanced sensation. Press the button to cycle through vibration modes. Clean thoroughly after each use with toy cleaner.',
    'Body-safe silicone over ABS plastic',
    95, 130,
    ARRAY['https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&h=600&fit=crop'],
    'vibrators', true, true, 4.6, 24
  ),
  (
    'Pulse Wand Massager',
    'pulse-wand-massager',
    'Versatile wand massager perfect for full-body relaxation and targeted pleasure. Features multiple speed settings and a flexible neck for precise positioning.',
    'Full-body massager — also marketed as wellness device\nMultiple speed settings for customized experience\nFlexible neck for perfect positioning\nDeep, rumbling vibrations\nErgonomic handle for comfortable grip',
    'Start on the lowest setting and gradually increase. Use externally for best results. The flexible head contours to your body naturally. Clean with warm water and toy cleaner after use.',
    'Medical-grade silicone head, ABS plastic body',
    249, 320,
    ARRAY['https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&h=600&fit=crop'],
    'vibrators', true, true, 4.8, 37
  ),
  (
    'Aria Air-Pulse Stimulator',
    'aria-air-pulse-stimulator',
    'Premium air-pulse technology that uses gentle air waves for clitoral stimulation without direct contact. Award-winning design for intense, satisfying results.',
    'Air-pulse technology — no direct contact needed\nPremium sensation highly rated globally\nMultiple intensity levels\nRechargeable with USB-C\nWaterproof for shower use',
    'Place the nozzle over the clitoris. Press power to start and cycle through intensity levels. Use a drop of lubricant around the opening for best seal. Rinse and dry after use.',
    'Body-safe silicone, ABS plastic, electronic components',
    350, 450,
    ARRAY['https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&h=600&fit=crop'],
    'vibrators', true, false, 4.9, 18
  ),
  (
    'Sensual Stroker',
    'sensual-stroker',
    'Premium male masturbator with textured inner canal designed for realistic sensation. Discreet, portable, and easy to clean.',
    'Realistic textured inner canal\nDiscreet and portable design\nEasy to clean and maintain\nDurable and long-lasting material\nGreat value for regular use',
    'Apply generous amount of lubricant inside the sleeve. Warm the sleeve in warm water for 2 minutes for a more realistic feel. Clean thoroughly after each use with toy cleaner and pat dry.',
    'TPE (thermoplastic elastomer), ABS plastic casing',
    110, 150,
    ARRAY['https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&h=600&fit=crop'],
    'male-pleasure', true, true, 4.4, 21
  ),
  (
    'Duo Vibrating Cock Ring',
    'duo-vibrating-cock-ring',
    'Dual-purpose vibrating cock ring that stimulates both partners during intercourse. The vibrating bullet targets the clitoris while the ring enhances erection firmness.',
    'Stimulates both partners simultaneously\nEnhances erection quality and duration\nRemovable vibrator bullet\nComfortable stretchy silicone\nPerfect for couples play',
    'Slide the ring over the penis before erection. Position the vibrator bulb against the clitoris during intercourse. Use plenty of water-based lubricant. Remove vibrator for cleaning.',
    'Body-safe silicone, electronic vibrator',
    120, 160,
    ARRAY['https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&h=600&fit=crop'],
    'male-pleasure', true, true, 4.5, 29
  ),
  (
    'Premium Delay Spray',
    'premium-delay-spray',
    'Advanced desensitizing spray to help manage premature ejaculation. Fast-acting formula with natural ingredients. Discreet pump bottle.',
    'Helps manage premature ejaculation\nFast-acting — works within minutes\nNatural active ingredients\nDiscreet pocket-sized bottle\nEach bottle lasts 40-60 uses',
    'Spray 2-3 pumps onto the most sensitive areas 5-10 minutes before intimacy. Allow to absorb. Wash off after 10 minutes if desensitization is too strong. Start with fewer pumps to gauge sensitivity.',
    'Water-based with lidocaine (5%), aloe vera, chamomile extract',
    75, 100,
    ARRAY['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop'],
    'male-pleasure', true, true, 4.3, 42
  ),
  (
    'Water-Based Lubricant 200ml',
    'water-based-lubricant-200ml',
    'Premium water-based lubricant for comfortable, natural-feeling intimacy. Compatible with all materials including silicone toys and condoms.',
    'Compatible with all toy materials and condoms\nNatural-feeling glide, not sticky\nNon-staining and easy to wash off\nUnscented and flavor-free — no irritation\nLong-lasting with a single application',
    'Apply a small pump to the area of use. Reapply as needed. Add a drop of water to reactivate if it dries during play. Clean with warm water and mild soap.',
    'Water-based glycerin-free formula, pH balanced',
    65, 85,
    ARRAY['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop'],
    'lubricants', true, true, 4.7, 56
  ),
  (
    'Toy Cleaner Spray 100ml',
    'toy-cleaner-spray-100ml',
    'Essential toy cleaning spray for hygienic pleasure. Kills 99.9% of bacteria while being gentle on all body-safe materials.',
    'Kills 99.9% of bacteria on contact\nGentle on all body-safe materials\nNo rinse formula — spray and wipe\nUnscented and non-irritating\nEssential for toy hygiene and longevity',
    'Spray 2-3 pumps onto toy surface after use. Wipe clean with a soft cloth or rinse with water. Allow to air dry before storing.',
    'Water, benzalkonium chloride (0.13%), non-toxic surfactants',
    55, 70,
    ARRAY['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=600&fit=crop'],
    'wellness', true, true, 4.5, 33
  ),
  (
    'Essence Arousal Gel',
    'essence-arousal-gel',
    'Warming arousal gel designed to enhance sensitivity and pleasure for women. Tingling sensation increases with intimacy and body heat.',
    'Enhances natural arousal and sensitivity\nWarming sensation that responds to body heat\nWater-based and easy to wash off\nSafe to use with condoms\nDiscreet packaging and fast delivery',
    'Apply a small amount to the clitoral area. Massage gently. The warming sensation activates with body heat and movement. Use additional lubricant if needed.',
    'Water-based with natural warming agents, aloe vera, vitamin E',
    80, 110,
    ARRAY['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop'],
    'lubricants', true, false, 4.4, 19
  ),
  (
    'Starter Butt Plug Kit',
    'starter-butt-plug-kit',
    'Three-piece silicone butt plug set for gradual exploration. Small, medium, and large sizes allow comfortable progression.',
    'Three sizes for gradual progression\nBody-safe silicone — ultra smooth\nTapered tip for easy insertion\nWide flared base for safety\nPerfect for beginners',
    'Start with the smallest size. Apply generous lubricant. Insert slowly and breathe deeply. Only move to larger size when completely comfortable. Always use more lubricant than you think you need.',
    'Body-safe silicone, ABS plastic base',
    140, 180,
    ARRAY['https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&h=600&fit=crop'],
    'anal', true, false, 4.6, 15
  ),
  (
    'Couples Starter Bundle',
    'couples-starter-bundle',
    'The perfect starter bundle for couples exploring together. Includes vibrating cock ring, water-based lubricant, and erotic conversation cards.',
    'Complete starter bundle for couples\nIncludes three essential products\nSaves 20% compared to individual purchase\nPerfect gift for partners\nEncourages open communication',
    'Start with the conversation cards to set the mood. Use the lubricant for comfortable intimacy. Add the vibrating ring when both partners are ready.',
    'Mixed materials — see individual products',
    220, 275,
    ARRAY['https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&h=600&fit=crop'],
    'couples', true, true, 4.7, 11
  ),
  (
    'Herbal Vitality Supplement',
    'herbal-vitality-supplement',
    'Natural herbal supplement to support energy and vitality. Formulated with traditional West African herbs known for their energizing properties.',
    'Supports natural energy and vitality\nTraditional West African herb formula\nEasy-to-take capsule form\nNo artificial ingredients\nSupports overall wellness',
    'Take 2 capsules daily with a meal. Do not exceed recommended dosage. Consult your healthcare provider if you have any medical conditions or take prescription medication.',
    'Horny goat weed extract, ginseng, maca root, tribulus terrestris — vegetarian capsules',
    150, 200,
    ARRAY['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=600&fit=crop'],
    'wellness', true, false, 4.2, 27
  )
ON CONFLICT (slug) DO NOTHING;

-- 7c. Blog posts
INSERT INTO blog_posts (title, slug, excerpt, content, image, author, published_at) VALUES
  (
    'A Beginner''s Guide to Choosing Your First Vibrator',
    'beginners-guide-choosing-first-vibrator',
    'Not sure where to start? Our comprehensive guide walks you through everything you need to know about choosing your first vibrator — from types and materials to features and budget.',
    'Choosing your first vibrator can feel overwhelming with so many options available. This guide breaks down everything you need to know about types, materials, features, and how to choose what is right for you. Whether you are looking for clitoral stimulation, G-spot pleasure, or full-body relaxation, there is a perfect toy out there waiting for you.',
    '/images/blog-beginners-guide.jpg',
    'Intima Wellness Team',
    '2025-04-15'
  ),
  (
    '5 Ways to Improve Intimacy in Your Relationship',
    '5-ways-improve-intimacy-relationship',
    'Building deeper intimacy doesn''t have to be complicated. Here are five practical ways to strengthen your connection with your partner starting today.',
    'Intimacy is about more than physical connection. It is about feeling seen, heard, and valued by your partner. From scheduled date nights to exploring new experiences together, discover five actionable ways to deepen the bond with your significant other.',
    '/images/blog-intimacy.jpg',
    'Intima Wellness Team',
    '2025-04-08'
  ),
  (
    'Understanding Lubricants: Water-Based vs Silicone',
    'understanding-lubricants-water-based-vs-silicone',
    'Not all lubricants are created equal. Learn the differences between water-based and silicone lubricants to find the best option for your needs.',
    'Choosing the right lubricant can make a significant difference in your comfort and enjoyment. Water-based lubes are versatile, condom-compatible, and easy to clean. Silicone lubes last longer and are perfect for water play. Learn which one suits your needs and how to get the most out of each type.',
    '/images/blog-lubricants.jpg',
    'Intima Wellness Team',
    '2025-03-25'
  )
ON CONFLICT (slug) DO NOTHING;

-- 8. SETUP INSTRUCTIONS (for the developer)
-- =============================================================================
-- After running this schema in Supabase:
--
-- 1. Create an admin user via Supabase Auth dashboard or:
--    INSERT INTO auth.users (email, password) VALUES ('admin@intima.com', 'your-strong-password');
--    Then update the profile role:
--    UPDATE profiles SET role = 'admin' WHERE email = 'admin@intima.com';
--
-- 2. Your .env.local should use:
--    NEXT_PUBLIC_SUPABASE_URL=<your-project-url>
--    NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
--    SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
