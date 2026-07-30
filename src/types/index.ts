export interface Category {
  id: string; name: string; slug: string; description: string;
  image_url: string; icon_name: string; parent_id: string | null;
  sort_order: number; is_active: boolean; created_at: string;
}
export interface ProductImage {
  id: string; product_id: string; image_url: string; alt_text: string; sort_order: number;
}
export interface Product {
  id: string; name: string; slug: string; sku: string; description: string;
  short_description: string; category_id: string; price: number; sale_price: number;
  weight: string; stock: number; is_active: boolean; is_featured: boolean;
  is_bestseller: boolean; is_new_arrival: boolean; is_flash_sale: boolean;
  flash_sale_ends_at: string | null; ingredients: string; nutrition: string;
  benefits: string; how_to_use: string; meta_title: string; meta_description: string;
  rating: number; review_count: number; brand: string;
  created_at: string; updated_at: string;
  category?: Category; product_images?: ProductImage[];
}
export interface Review {
  id: string; product_id: string; user_id: string | null; user_name: string;
  rating: number; title: string; body: string; is_approved: boolean; created_at: string;
}
export interface Address {
  id: string; user_id: string; full_name: string; phone: string;
  address_line1: string; address_line2: string; city: string;
  province: string; postal_code: string; is_default: boolean; created_at: string;
}
export interface Order {
  id: string; user_id: string; order_number: string; status: string;
  payment_method: string; payment_status: string; subtotal: number;
  discount: number; shipping_cost: number; total: number; coupon_code: string;
  shipping_address: Record<string,string>; billing_address: Record<string,string>;
  customer_notes: string; estimated_delivery: string | null;
  created_at: string; updated_at: string; order_items?: OrderItem[];
}
export interface OrderItem {
  id: string; order_id: string; product_id: string | null; product_name: string;
  product_image: string; price: number; quantity: number; weight: string;
}
export interface Coupon {
  id: string; code: string; description: string; discount_type: string;
  discount_value: number; min_order_amount: number; max_uses: number;
  uses_count: number; is_active: boolean; valid_from: string; valid_until: string | null;
}
export interface BlogPost {
  id: string; title: string; slug: string; excerpt: string; content: string;
  image_url: string; author: string; category: string; tags: string;
  is_published: boolean; is_featured: boolean; meta_title: string; meta_description: string;
  category_id: string | null; published_at: string;
  created_at: string; updated_at: string;
}
export interface BlogCategory {
  id: string; name: string; slug: string; description: string; created_at: string;
}
export interface BlogTag {
  id: string; name: string; slug: string; created_at: string;
}
export interface ActivityLog {
  id: string; user_id: string | null; user_email: string; action: string;
  entity_type: string; entity_id: string; details: Record<string, unknown>;
  ip_address: string; user_agent: string; created_at: string;
}
export interface FormSubmission {
  id: string; form_type: string; name: string; email: string; subject: string;
  message: string; phone: string; extra_data: Record<string, unknown>;
  is_read: boolean; ip_address: string; created_at: string;
}
export interface MediaItem {
  id: string; name: string; url: string; file_type: string; file_size: number;
  width: number; height: number; alt_text: string; caption: string;
  tags: string[]; uploaded_by: string | null; created_at: string;
}
export interface Page {
  id: string; title: string; slug: string; content: string; excerpt: string;
  featured_image: string; status: string; template: string; sort_order: number;
  show_in_menu: boolean; meta_title: string; meta_description: string;
  created_by: string | null; updated_by: string | null;
  created_at: string; updated_at: string;
}
export interface Profile {
  id: string; email: string; full_name: string; phone: string;
  role: string; avatar_url: string; created_at: string; updated_at: string;
}
export interface CartItem { product: Product; quantity: number; }
export interface Banner {
  id: string; title: string; subtitle: string; description: string;
  image_url: string; cta_text: string; cta_link: string; badge_text: string;
  sort_order: number; is_active: boolean; created_at: string; updated_at: string;
}
export interface Setting {
  id: string; key: string; value: string; label: string; type: string; group_name: string;
}
