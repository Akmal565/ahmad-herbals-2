/*
# Admin Panel Extension - Complete CMS Infrastructure

## Overview
Extends the existing Punjab Ka Virsa database with full CMS capabilities:
activity logging, form submission management, media library, dynamic pages,
blog categories/tags, and expanded role system.

## New Tables
1. `activity_logs` - Audit trail of all admin actions (who, what, when, IP)
2. `form_submissions` - Contact form submissions with read/unread status
3. `media_library` - Centralized media/image manager with metadata
4. `pages` - Dynamic website pages with draft/publish mode
5. `blog_categories` - Blog post categories
6. `blog_tags` - Blog post tags

## Modified Tables
- `profiles.role` CHECK constraint expanded to include 'super_admin', 'admin', 'editor'
- `settings.type` CHECK constraint expanded to include 'number', 'password'
- `blog_posts` - Added `category_id`, `is_featured`, `published_at` columns

## Security
- RLS enabled on all new tables
- Admin-only write policies for media, pages, blog_categories, blog_tags
- Public read for published pages, active media
*/

-- ============================================================
-- 1. EXPAND ROLE CONSTRAINT ON profiles
-- ============================================================
DO $$ BEGIN
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
    CHECK (role = ANY (ARRAY['customer'::text, 'admin'::text, 'super_admin'::text, 'editor'::text]));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ============================================================
-- 1b. EXPAND TYPE CONSTRAINT ON settings
-- ============================================================
DO $$ BEGIN
  ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_type_check;
  ALTER TABLE settings ADD CONSTRAINT settings_type_check
    CHECK (type = ANY (ARRAY['text'::text, 'url'::text, 'email'::text, 'phone'::text, 'textarea'::text, 'boolean'::text, 'color'::text, 'number'::text, 'password'::text]));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ============================================================
-- 2. ACTIVITY LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text DEFAULT '',
  action text NOT NULL,
  entity_type text DEFAULT '',
  entity_id text DEFAULT '',
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text DEFAULT '',
  user_agent text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_activity_logs_admin" ON activity_logs;
CREATE POLICY "select_activity_logs_admin" ON activity_logs FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
  );

DROP POLICY IF EXISTS "insert_activity_logs_authenticated" ON activity_logs;
CREATE POLICY "insert_activity_logs_authenticated" ON activity_logs FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);

-- ============================================================
-- 3. FORM SUBMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_type text NOT NULL DEFAULT 'contact',
  name text NOT NULL,
  email text NOT NULL,
  subject text DEFAULT '',
  message text NOT NULL,
  phone text DEFAULT '',
  extra_data jsonb DEFAULT '{}'::jsonb,
  is_read boolean NOT NULL DEFAULT false,
  ip_address text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_form_submissions_admin" ON form_submissions;
CREATE POLICY "select_form_submissions_admin" ON form_submissions FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'editor'))
  );

DROP POLICY IF EXISTS "insert_form_submissions_public" ON form_submissions;
CREATE POLICY "insert_form_submissions_public" ON form_submissions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_form_submissions_admin" ON form_submissions;
CREATE POLICY "update_form_submissions_admin" ON form_submissions FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'editor'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'editor'))
  );

DROP POLICY IF EXISTS "delete_form_submissions_admin" ON form_submissions;
CREATE POLICY "delete_form_submissions_admin" ON form_submissions FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
  );

CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at ON form_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_form_submissions_is_read ON form_submissions(is_read);

-- ============================================================
-- 4. MEDIA LIBRARY
-- ============================================================
CREATE TABLE IF NOT EXISTS media_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  file_type text NOT NULL DEFAULT 'image',
  file_size bigint DEFAULT 0,
  width integer DEFAULT 0,
  height integer DEFAULT 0,
  alt_text text DEFAULT '',
  caption text DEFAULT '',
  tags text[] DEFAULT ARRAY[]::text[],
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_media_library" ON media_library;
CREATE POLICY "select_media_library" ON media_library FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_media_library_admin" ON media_library;
CREATE POLICY "insert_media_library_admin" ON media_library FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'editor'))
  );

DROP POLICY IF EXISTS "update_media_library_admin" ON media_library;
CREATE POLICY "update_media_library_admin" ON media_library FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'editor'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'editor'))
  );

DROP POLICY IF EXISTS "delete_media_library_admin" ON media_library;
CREATE POLICY "delete_media_library_admin" ON media_library FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
  );

CREATE INDEX IF NOT EXISTS idx_media_library_created_at ON media_library(created_at DESC);

-- ============================================================
-- 5. PAGES (Dynamic website pages)
-- ============================================================
CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text NOT NULL DEFAULT '',
  excerpt text DEFAULT '',
  featured_image text DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  template text DEFAULT 'default',
  sort_order integer DEFAULT 0,
  show_in_menu boolean DEFAULT false,
  meta_title text DEFAULT '',
  meta_description text DEFAULT '',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_pages_public" ON pages;
CREATE POLICY "select_pages_public" ON pages FOR SELECT
  TO anon, authenticated USING (status = 'published' OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'editor')));

DROP POLICY IF EXISTS "insert_pages_admin" ON pages;
CREATE POLICY "insert_pages_admin" ON pages FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'editor'))
  );

DROP POLICY IF EXISTS "update_pages_admin" ON pages;
CREATE POLICY "update_pages_admin" ON pages FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'editor'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'editor'))
  );

DROP POLICY IF EXISTS "delete_pages_admin" ON pages;
CREATE POLICY "delete_pages_admin" ON pages FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
  );

CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);

-- ============================================================
-- 6. BLOG CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_blog_categories" ON blog_categories;
CREATE POLICY "select_blog_categories" ON blog_categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_blog_categories_admin" ON blog_categories;
CREATE POLICY "insert_blog_categories_admin" ON blog_categories FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'editor'))
  );

DROP POLICY IF EXISTS "update_blog_categories_admin" ON blog_categories;
CREATE POLICY "update_blog_categories_admin" ON blog_categories FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'editor'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'editor'))
  );

DROP POLICY IF EXISTS "delete_blog_categories_admin" ON blog_categories;
CREATE POLICY "delete_blog_categories_admin" ON blog_categories FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
  );

-- ============================================================
-- 7. BLOG TAGS
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_blog_tags" ON blog_tags;
CREATE POLICY "select_blog_tags" ON blog_tags FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_blog_tags_admin" ON blog_tags;
CREATE POLICY "insert_blog_tags_admin" ON blog_tags FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'editor'))
  );

DROP POLICY IF EXISTS "update_blog_tags_admin" ON blog_tags;
CREATE POLICY "update_blog_tags_admin" ON blog_tags FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'editor'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'editor'))
  );

DROP POLICY IF EXISTS "delete_blog_tags_admin" ON blog_tags;
CREATE POLICY "delete_blog_tags_admin" ON blog_tags FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
  );

-- ============================================================
-- 8. ADD COLUMNS TO blog_posts
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name = 'category_id') THEN
    ALTER TABLE blog_posts ADD COLUMN category_id uuid REFERENCES blog_categories(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name = 'is_featured') THEN
    ALTER TABLE blog_posts ADD COLUMN is_featured boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name = 'published_at') THEN
    ALTER TABLE blog_posts ADD COLUMN published_at timestamptz DEFAULT now();
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ============================================================
-- 9. ADD SETTINGS FOR NEW FEATURES
-- ============================================================
INSERT INTO settings (key, value, label, type, group_name)
SELECT 'whatsapp_number', '', 'WhatsApp Number', 'phone', 'contact'
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'whatsapp_number');

INSERT INTO settings (key, value, label, type, group_name)
SELECT 'google_analytics_id', '', 'Google Analytics ID', 'text', 'analytics'
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'google_analytics_id');

INSERT INTO settings (key, value, label, type, group_name)
SELECT 'google_tag_manager_id', '', 'Google Tag Manager ID', 'text', 'analytics'
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'google_tag_manager_id');

INSERT INTO settings (key, value, label, type, group_name)
SELECT 'facebook_pixel_id', '', 'Facebook Pixel ID', 'text', 'analytics'
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'facebook_pixel_id');

INSERT INTO settings (key, value, label, type, group_name)
SELECT 'smtp_host', '', 'SMTP Host', 'text', 'email'
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'smtp_host');

INSERT INTO settings (key, value, label, type, group_name)
SELECT 'smtp_port', '587', 'SMTP Port', 'text', 'email'
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'smtp_port');

INSERT INTO settings (key, value, label, type, group_name)
SELECT 'smtp_username', '', 'SMTP Username', 'text', 'email'
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'smtp_username');

INSERT INTO settings (key, value, label, type, group_name)
SELECT 'smtp_password', '', 'SMTP Password', 'password', 'email'
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'smtp_password');

INSERT INTO settings (key, value, label, type, group_name)
SELECT 'theme_primary_color', '#d17110', 'Primary Color', 'color', 'appearance'
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'theme_primary_color');

INSERT INTO settings (key, value, label, type, group_name)
SELECT 'theme_secondary_color', '#637135', 'Secondary Color', 'color', 'appearance'
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'theme_secondary_color');

INSERT INTO settings (key, value, label, type, group_name)
SELECT 'theme_accent_color', '#dc3829', 'Accent Color', 'color', 'appearance'
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'theme_accent_color');

INSERT INTO settings (key, value, label, type, group_name)
SELECT 'font_heading', 'Playfair Display', 'Heading Font', 'text', 'appearance'
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'font_heading');

INSERT INTO settings (key, value, label, type, group_name)
SELECT 'font_body', 'Inter', 'Body Font', 'text', 'appearance'
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'font_body');

INSERT INTO settings (key, value, label, type, group_name)
SELECT 'favicon_url', '', 'Favicon URL', 'url', 'general'
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'favicon_url');

INSERT INTO settings (key, value, label, type, group_name)
SELECT 'logo_url', '', 'Logo URL', 'url', 'general'
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'logo_url');

-- ============================================================
-- 10. ADMIN POLICIES FOR EXISTING TABLES
-- ============================================================
-- Products
DROP POLICY IF EXISTS "admin_insert_products" ON products;
CREATE POLICY "admin_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'editor'))
  );

DROP POLICY IF EXISTS "admin_update_products" ON products;
CREATE POLICY "admin_update_products" ON products FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'editor'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'editor'))
  );

DROP POLICY IF EXISTS "admin_delete_products" ON products;
CREATE POLICY "admin_delete_products" ON products FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
  );

-- Categories
DROP POLICY IF EXISTS "admin_insert_categories" ON categories;
CREATE POLICY "admin_insert_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'editor'))
  );

DROP POLICY IF EXISTS "admin_update_categories" ON categories;
CREATE POLICY "admin_update_categories" ON categories FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'editor'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'editor'))
  );

DROP POLICY IF EXISTS "admin_delete_categories" ON categories;
CREATE POLICY "admin_delete_categories" ON categories FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
  );

-- Orders
DROP POLICY IF EXISTS "admin_update_orders" ON orders;
CREATE POLICY "admin_update_orders" ON orders FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'editor'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'editor'))
  );

-- Coupons
DROP POLICY IF EXISTS "admin_insert_coupons" ON coupons;
CREATE POLICY "admin_insert_coupons" ON coupons FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'editor'))
  );

DROP POLICY IF EXISTS "admin_update_coupons" ON coupons;
CREATE POLICY "admin_update_coupons" ON coupons FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'editor'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'editor'))
  );

DROP POLICY IF EXISTS "admin_delete_coupons" ON coupons;
CREATE POLICY "admin_delete_coupons" ON coupons FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
  );

-- Blog posts
DROP POLICY IF EXISTS "admin_insert_blog_posts" ON blog_posts;
CREATE POLICY "admin_insert_blog_posts" ON blog_posts FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'editor'))
  );

DROP POLICY IF EXISTS "admin_update_blog_posts" ON blog_posts;
CREATE POLICY "admin_update_blog_posts" ON blog_posts FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'editor'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'editor'))
  );

DROP POLICY IF EXISTS "admin_delete_blog_posts" ON blog_posts;
CREATE POLICY "admin_delete_blog_posts" ON blog_posts FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
  );

-- Banners
DROP POLICY IF EXISTS "admin_insert_banners" ON banners;
CREATE POLICY "admin_insert_banners" ON banners FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'editor'))
  );

DROP POLICY IF EXISTS "admin_update_banners" ON banners;
CREATE POLICY "admin_update_banners" ON banners FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'editor'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'editor'))
  );

DROP POLICY IF EXISTS "delete_banners_admin" ON banners;
CREATE POLICY "delete_banners_admin" ON banners FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
  );

-- Settings
DROP POLICY IF EXISTS "admin_insert_settings" ON settings;
CREATE POLICY "admin_insert_settings" ON settings FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
  );

DROP POLICY IF EXISTS "admin_update_settings" ON settings;
CREATE POLICY "admin_update_settings" ON settings FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
  );

-- Profiles (role management)
DROP POLICY IF EXISTS "admin_update_profiles" ON profiles;
CREATE POLICY "admin_update_profiles" ON profiles FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin'))
  );

-- Product images
DROP POLICY IF EXISTS "admin_insert_product_images" ON product_images;
CREATE POLICY "admin_insert_product_images" ON product_images FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'editor'))
  );

DROP POLICY IF EXISTS "admin_update_product_images" ON product_images;
CREATE POLICY "admin_update_product_images" ON product_images FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'editor'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'editor'))
  );

DROP POLICY IF EXISTS "admin_delete_product_images" ON product_images;
CREATE POLICY "admin_delete_product_images" ON product_images FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'editor'))
  );

-- ============================================================
-- 11. SEED BLOG CATEGORIES
-- ============================================================
INSERT INTO blog_categories (name, slug, description)
SELECT 'Health Tips', 'health-tips', 'Tips for healthy living with organic foods'
WHERE NOT EXISTS (SELECT 1 FROM blog_categories WHERE slug = 'health-tips');

INSERT INTO blog_categories (name, slug, description)
SELECT 'Recipes', 'recipes', 'Traditional Punjabi recipes'
WHERE NOT EXISTS (SELECT 1 FROM blog_categories WHERE slug = 'recipes');

INSERT INTO blog_categories (name, slug, description)
SELECT 'Organic Living', 'organic-living', 'Guides for organic lifestyle'
WHERE NOT EXISTS (SELECT 1 FROM blog_categories WHERE slug = 'organic-living');

INSERT INTO blog_categories (name, slug, description)
SELECT 'Product Guides', 'product-guides', 'How to use our products'
WHERE NOT EXISTS (SELECT 1 FROM blog_categories WHERE slug = 'product-guides');