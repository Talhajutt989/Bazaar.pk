-- ===================================================
-- Supabase SQL Schema for Bazaar.pk E-Commerce Platform
-- Copy & Paste this into Supabase SQL Editor and click RUN
-- ===================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  whatsapp TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'CUSTOMER', -- 'ADMIN' | 'VENDOR' | 'CUSTOMER'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Stores Table
CREATE TABLE IF NOT EXISTS public.stores (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  brand_address TEXT NOT NULL,
  city TEXT NOT NULL,
  area TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  commission_rate DOUBLE PRECISION DEFAULT 0.10,
  status TEXT DEFAULT 'ACTIVE', -- 'PENDING_KYC' | 'UNDER_REVIEW' | 'ACTIVE' | 'SUSPENDED'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

-- 4. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  store_id TEXT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES public.categories(id),
  title TEXT NOT NULL,
  brand TEXT,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  base_price DOUBLE PRECISION NOT NULL,
  images TEXT NOT NULL, -- JSON stringified array of URLs
  is_active BOOLEAN DEFAULT TRUE,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Product Variants Table
CREATE TABLE IF NOT EXISTS public.product_variants (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT UNIQUE NOT NULL,
  variant_name TEXT NOT NULL,
  price DOUBLE PRECISION NOT NULL,
  stock INT DEFAULT 10,
  attributes TEXT -- JSON stringified attributes
);

-- 6. Customer Addresses Table
CREATE TABLE IF NOT EXISTS public.addresses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  street TEXT NOT NULL,
  area TEXT NOT NULL,
  city TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_default BOOLEAN DEFAULT FALSE
);

-- 7. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  customer_id TEXT NOT NULL REFERENCES public.users(id),
  shipping_address_id TEXT NOT NULL REFERENCES public.addresses(id),
  total_amount DOUBLE PRECISION NOT NULL,
  payment_method TEXT NOT NULL, -- 'COD' | 'JAZZCASH' | 'EASYPAISA' | 'SADAPAY' | 'BANK_TRANSFER'
  payment_status TEXT DEFAULT 'UNPAID', -- 'UNPAID' | 'PAID' | 'FAILED' | 'REFUNDED'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SubOrders Table (Per Store)
CREATE TABLE IF NOT EXISTS public.sub_orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  store_id TEXT NOT NULL REFERENCES public.stores(id),
  status TEXT DEFAULT 'PENDING', -- 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
  subtotal DOUBLE PRECISION NOT NULL,
  platform_fee DOUBLE PRECISION NOT NULL,
  vendor_earnings DOUBLE PRECISION NOT NULL,
  rider_name TEXT,
  rider_phone TEXT,
  rider_latitude DOUBLE PRECISION,
  rider_longitude DOUBLE PRECISION,
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  sub_order_id TEXT NOT NULL REFERENCES public.sub_orders(id) ON DELETE CASCADE,
  variant_id TEXT NOT NULL REFERENCES public.product_variants(id),
  quantity INT NOT NULL,
  unit_price DOUBLE PRECISION NOT NULL,
  total_price DOUBLE PRECISION NOT NULL
);

-- 10. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  order_item_id TEXT UNIQUE REFERENCES public.order_items(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating_stars INT NOT NULL CHECK (rating_stars >= 1 AND rating_stars <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) & Public Read Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- Allow Public Read for Catalog Data
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Read Stores" ON public.stores FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public Read Variants" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Public Read Reviews" ON public.reviews FOR SELECT USING (true);

-- Service Role Key has full access to all tables automatically
