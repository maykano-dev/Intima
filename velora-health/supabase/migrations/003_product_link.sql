-- Add product_link column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_link TEXT;
