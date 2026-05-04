-- Velora Health Database Schema
-- Run this in Supabase SQL Editor to set up your database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  benefits TEXT,
  usage_guide TEXT,
  material TEXT,
  price_ghs NUMERIC(10, 2) NOT NULL,
  compare_price_ghs NUMERIC(10, 2),
  images TEXT[] DEFAULT '{}',
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  in_stock BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  rating NUMERIC(2, 1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  city TEXT DEFAULT 'Accra',
  notes TEXT DEFAULT '',
  total NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_reference TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  discreet_packaging BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Posts
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  excerpt TEXT,
  image TEXT,
  author TEXT DEFAULT 'Velora Wellness Team',
  published_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscribers
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact Messages
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_in_stock ON products(in_stock) WHERE in_stock = true;
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_approved ON reviews(approved) WHERE approved = true;
CREATE INDEX idx_subscribers_email ON subscribers(email);

-- Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Public read access for products, categories, blog posts
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read blog" ON blog_posts FOR SELECT USING (true);

-- Authenticated users can insert reviews and contact messages
CREATE POLICY "Anyone can insert reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert contact" ON contact_messages FOR INSERT WITH CHECK (true);

-- Admin-only access (via service_role key) for orders and subscribers
CREATE POLICY "Admin all orders" ON orders FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Admin all order_items" ON order_items FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Admin all subscribers" ON subscribers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Admin all reviews" ON reviews FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Admin all contacts" ON contact_messages FOR ALL USING (auth.role() = 'service_role');

-- Allow service_role and anon to insert subscribers
CREATE POLICY "Anon insert subscribers" ON subscribers FOR INSERT WITH CHECK (true);

-- Seed data: Categories
INSERT INTO categories (id, name, slug, description) VALUES
  ('vibrators', 'Vibrators & Stimulators', 'vibrators', 'Premium vibrators and stimulators for every experience level.'),
  ('male-pleasure', 'Male Pleasure', 'male-pleasure', 'Designed for male pleasure and performance enhancement.'),
  ('couples', 'Couples Products', 'couples', 'Products to enhance intimacy for couples.'),
  ('lubricants', 'Lubricants & Enhancers', 'lubricants', 'Premium lubricants and arousal enhancers.'),
  ('anal', 'Anal Products', 'anal', 'Anal play products for beginners and advanced users.'),
  ('wellness', 'Wellness & Accessories', 'wellness', 'Essential accessories and wellness products.'),
  ('dildos', 'Dildos', 'dildos', 'A wide range of dildos in various materials and styles.');

-- Seed data: Products
INSERT INTO products (name, slug, description, benefits, usage_guide, material, price_ghs, compare_price_ghs, category_id, in_stock, is_featured, rating, review_count) VALUES
  ('Whisper Bullet Vibrator', 'whisper-bullet-vibrator', 'Compact and powerful, the Whisper Bullet is the perfect entry-level vibrator.', 'Discreet size perfect for beginners\nPowerful vibrations in a compact body\nEasy to use with intuitive single-button control\nBattery-powered for cordless play\nUltra-quiet motor for private enjoyment', 'Apply a small amount of water-based lubricant to the bullet head. Press the button to cycle through vibration modes. Clean thoroughly after each use.', 'Body-safe silicone over ABS plastic', 95, 130, 'vibrators', true, true, 4.6, 24),
  ('Pulse Wand Massager', 'pulse-wand-massager', 'Versatile wand massager perfect for full-body relaxation and targeted pleasure.', 'Full-body massager — also marketed as wellness device\nMultiple speed settings for customized experience\nFlexible neck for perfect positioning\nDeep, rumbling vibrations\nErgonomic handle for comfortable grip', 'Start on the lowest setting and gradually increase. Use externally for best results.', 'Medical-grade silicone head, ABS plastic body', 249, 320, 'vibrators', true, true, 4.8, 37),
  ('Aria Air-Pulse Stimulator', 'aria-air-pulse-stimulator', 'Premium air-pulse technology that uses gentle air waves for clitoral stimulation.', 'Air-pulse technology — no direct contact needed\nPremium sensation highly rated globally\nMultiple intensity levels\nRechargeable with USB-C\nWaterproof for shower use', 'Place the nozzle over the clitoris. Press power to start and cycle through intensity levels.', 'Body-safe silicone, ABS plastic, electronic components', 350, 450, 'vibrators', true, false, 4.9, 18),
  ('Sensual Stroker', 'sensual-stroker', 'Premium male masturbator with textured inner canal designed for realistic sensation.', 'Realistic textured inner canal\nDiscreet and portable design\nEasy to clean and maintain\nDurable and long-lasting material\nGreat value for regular use', 'Apply generous amount of lubricant inside the sleeve. Warm in warm water for 2 minutes for more realistic feel.', 'TPE (thermoplastic elastomer), ABS plastic casing', 110, 150, 'male-pleasure', true, true, 4.4, 21),
  ('Duo Vibrating Cock Ring', 'duo-vibrating-cock-ring', 'Dual-purpose vibrating cock ring that stimulates both partners during intercourse.', 'Stimulates both partners simultaneously\nEnhances erection quality and duration\nRemovable vibrator bullet\nComfortable stretchy silicone\nPerfect for couples play', 'Slide the ring over the penis before erection. Position the vibrator bulb against the clitoris during intercourse.', 'Body-safe silicone, electronic vibrator', 120, 160, 'male-pleasure', true, true, 4.5, 29),
  ('Premium Delay Spray', 'premium-delay-spray', 'Advanced desensitizing spray to help manage premature ejaculation.', 'Helps manage premature ejaculation\nFast-acting — works within minutes\nNatural active ingredients\nDiscreet pocket-sized bottle\nEach bottle lasts 40-60 uses', 'Spray 2-3 pumps onto the most sensitive areas 5-10 minutes before intimacy. Allow to absorb.', 'Water-based with lidocaine (5%), aloe vera, chamomile extract', 75, 100, 'male-pleasure', true, true, 4.3, 42),
  ('Water-Based Lubricant 200ml', 'water-based-lubricant-200ml', 'Premium water-based lubricant for comfortable, natural-feeling intimacy.', 'Compatible with all toy materials and condoms\nNatural-feeling glide, not sticky\nNon-staining and easy to wash off\nUnscented and flavor-free\nLong-lasting with a single application', 'Apply a small pump to the area of use. Reapply as needed. Add a drop of water to reactivate if it dries.', 'Water-based glycerin-free formula, pH balanced', 65, 85, 'lubricants', true, true, 4.7, 56),
  ('Toy Cleaner Spray 100ml', 'toy-cleaner-spray-100ml', 'Essential toy cleaning spray for hygienic pleasure.', 'Kills 99.9% of bacteria on contact\nGentle on all body-safe materials\nNo rinse formula — spray and wipe\nUnscented and non-irritating\nEssential for toy hygiene', 'Spray 2-3 pumps onto toy surface after use. Wipe clean with a soft cloth or rinse with water.', 'Water, benzalkonium chloride (0.13%), non-toxic surfactants', 55, 70, 'wellness', true, true, 4.5, 33),
  ('Essence Arousal Gel', 'essence-arousal-gel', 'Warming arousal gel designed to enhance sensitivity and pleasure for women.', 'Enhances natural arousal and sensitivity\nWarming sensation that responds to body heat\nWater-based and easy to wash off\nSafe to use with condoms', 'Apply a small amount to the clitoral area. Massage gently.', 'Water-based with natural warming agents, aloe vera, vitamin E', 80, 110, 'lubricants', true, false, 4.4, 19),
  ('Starter Butt Plug Kit', 'starter-butt-plug-kit', 'Three-piece silicone butt plug set for gradual exploration.', 'Three sizes for gradual progression\nBody-safe silicone — ultra smooth\nTapered tip for easy insertion\nWide flared base for safety\nPerfect for beginners', 'Start with the smallest size. Apply generous lubricant. Insert slowly and breathe deeply.', 'Body-safe silicone, ABS plastic base', 140, 180, 'anal', true, false, 4.6, 15),
  ('Couples Starter Bundle', 'couples-starter-bundle', 'The perfect starter bundle for couples exploring together.', 'Complete starter bundle for couples\nIncludes three essential products\nSaves 20% compared to individual purchase\nPerfect gift for partners\nEncourages open communication', 'Start with conversation cards to set the mood. Use lubricant for comfort.', 'Mixed materials — see individual products', 220, 275, 'couples', true, true, 4.7, 11),
  ('Herbal Vitality Supplement', 'herbal-vitality-supplement', 'Natural herbal supplement to support energy and vitality.', 'Supports natural energy and vitality\nTraditional West African herb formula\nEasy-to-take capsule form\nNo artificial ingredients\nSupports overall wellness', 'Take 2 capsules daily with a meal. Do not exceed recommended dosage.', 'Horny goat weed extract, ginseng, maca root, tribulus terrestris', 150, 200, 'wellness', true, false, 4.2, 27);
