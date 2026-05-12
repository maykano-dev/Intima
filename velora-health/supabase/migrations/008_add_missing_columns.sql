-- Add missing columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS product_link TEXT;

-- Add missing columns to product_variants table
ALTER TABLE product_variants 
ADD COLUMN IF NOT EXISTS image TEXT;

-- Ensure price_cny exists (just in case)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS price_cny NUMERIC(10, 2) DEFAULT 0;

ALTER TABLE product_variants 
ADD COLUMN IF NOT EXISTS price_cny NUMERIC(10, 2) DEFAULT 0;
