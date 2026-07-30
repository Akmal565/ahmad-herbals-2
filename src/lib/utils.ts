export function formatPKR(amount: number): string {
  return 'Rs. ' + amount.toLocaleString('en-PK');
}
export function getEffectivePrice(p: { price: number; sale_price: number }): number {
  return p.sale_price > 0 ? p.sale_price : p.price;
}
export function getDiscountPercent(p: { price: number; sale_price: number }): number {
  if (p.sale_price <= 0) return 0;
  return Math.round(((p.price - p.sale_price) / p.price) * 100);
}
export function getFirstImage(p: { product_images?: Array<{ image_url: string }> }): string {
  return p.product_images?.[0]?.image_url ?? 'https://images.pexels.com/photos/4198015/pexels-photo-4198015.jpeg';
}
export function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-PK', { year:'numeric', month:'short', day:'numeric' });
}
export function generateOrderNumber(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  const r = Math.random().toString(36).substring(2,7).toUpperCase();
  return `PKV-${ymd}-${r}`;
}
