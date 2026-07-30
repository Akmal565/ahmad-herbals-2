/*
# Add Banners and Settings Tables for Admin Panel

## New Tables
1. banners - Hero sliders and promotional banners with title, subtitle, image, CTA link, sort order, active flag
2. settings - Key-value store for website configuration (site name, contact info, social links, etc.)

## Security
- banners: public read (anon+authenticated), admin-only write
- settings: admin-only read+write (config should not be exposed publicly)
*/

-- BANNERS TABLE
CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  subtitle text DEFAULT '',
  description text DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  cta_text text DEFAULT '',
  cta_link text DEFAULT '',
  badge_text text DEFAULT '',
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_banners" ON banners;
CREATE POLICY "public_read_banners" ON banners FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_banners" ON banners;
CREATE POLICY "admin_insert_banners" ON banners FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "admin_update_banners" ON banners;
CREATE POLICY "admin_update_banners" ON banners FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "admin_delete_banners" ON banners;
CREATE POLICY "admin_delete_banners" ON banners FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- SETTINGS TABLE
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text DEFAULT '',
  label text DEFAULT '',
  type text DEFAULT 'text' CHECK (type IN ('text','url','email','phone','textarea','boolean','color')),
  group_name text DEFAULT 'general',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_settings" ON settings;
CREATE POLICY "admin_read_settings" ON settings FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "admin_insert_settings" ON settings;
CREATE POLICY "admin_insert_settings" ON settings FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "admin_update_settings" ON settings;
CREATE POLICY "admin_update_settings" ON settings FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- SEED BANNERS
INSERT INTO banners (title, subtitle, description, image_url, cta_text, cta_link, badge_text, sort_order) VALUES
  ('Pure Organic Foods', 'From the Heart of Punjab', 'Stone-ground flours, premium dry fruits, pure honey & authentic spices delivered fresh.', 'https://images.pexels.com/photos/5234982/pexels-photo-5234982.jpeg', 'Shop Now', '/shop', 'New Arrivals', 1),
  ('Traditional Stone-Grinding', 'Chakki Fresh Atta', 'Experience the authentic taste of traditionally stone-ground flour, preserving all natural nutrients.', 'https://images.pexels.com/photos/6495017/pexels-photo-6495017.jpeg', 'Explore Flours', '/shop?category=multi-grain-flour', 'Best Seller', 2),
  ('Premium Dry Fruits', 'Hand-Picked Quality', 'Almonds, cashews, walnuts, pistachios & dates sourced from the finest orchards.', 'https://images.pexels.com/photos/3360358/pexels-photo-3360358.jpeg', 'Shop Dry Fruits', '/shop?category=dry-fruits', 'Premium', 3)
ON CONFLICT DO NOTHING;

-- SEED SETTINGS
INSERT INTO settings (key, value, label, type, group_name) VALUES
  ('site_name', 'Punjab Ka Virsa', 'Site Name', 'text', 'general'),
  ('site_tagline', 'Organic & Traditional Foods', 'Site Tagline', 'text', 'general'),
  ('site_email', 'info@punjabkavirsa.com', 'Contact Email', 'email', 'general'),
  ('site_phone', '+92 300 1234567', 'Contact Phone', 'phone', 'general'),
  ('site_address', '123 Main Boulevard, Gulberg III, Lahore, Punjab, Pakistan', 'Address', 'textarea', 'general'),
  ('site_whatsapp', '+923001234567', 'WhatsApp Number', 'text', 'general'),
  ('currency_symbol', 'Rs.', 'Currency Symbol', 'text', 'general'),
  ('free_shipping_threshold', '3000', 'Free Shipping Above (Rs.)', 'text', 'shipping'),
  ('flat_shipping_cost', '150', 'Flat Shipping Cost (Rs.)', 'text', 'shipping'),
  ('cod_enabled', 'true', 'Cash on Delivery Enabled', 'boolean', 'payment'),
  ('min_order_amount', '0', 'Minimum Order Amount (Rs.)', 'text', 'payment'),
  ('facebook_url', 'https://facebook.com/punjabkavirsa', 'Facebook URL', 'url', 'social'),
  ('instagram_url', 'https://instagram.com/punjabkavirsa', 'Instagram URL', 'url', 'social'),
  ('youtube_url', 'https://youtube.com/punjabkavirsa', 'YouTube URL', 'url', 'social'),
  ('meta_title', 'Punjab Ka Virsa - Organic & Traditional Foods', 'Default Meta Title', 'text', 'seo'),
  ('meta_description', 'Buy premium organic flours, dry fruits, honey, and spices online. Punjab Ka Virsa delivers authentic traditional foods across Pakistan.', 'Default Meta Description', 'textarea', 'seo'),
  ('admin_email', 'admin@punjabkavirsa.com', 'Admin Email', 'email', 'admin'),
  ('orders_per_page', '20', 'Orders Per Page', 'text', 'admin')
ON CONFLICT (key) DO NOTHING;