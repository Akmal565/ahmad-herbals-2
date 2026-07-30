import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Tag, X, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';
import { formatPKR, getEffectivePrice } from '../lib/utils';
import { useState } from 'react';

const FREE_SHIPPING_THRESHOLD = 8000;
const FLAT_SHIPPING = 150;

export default function Cart() {
  const { items, removeFromCart, updateQuantity, subtotal, discount, couponCode, applyCoupon, removeCoupon, clearCart } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : (subtotal > 0 ? FLAT_SHIPPING : 0);
  const total = subtotal - discount + shippingCost;

  const handleApplyCoupon = async () => {
    setCouponError(''); setCouponSuccess('');
    if (!couponInput.trim()) return;
    const { data, error } = await supabase.from('coupons').select('*').eq('code', couponInput.toUpperCase()).eq('is_active', true).maybeSingle();
    if (error || !data) { setCouponError('Invalid coupon code.'); return; }
    if (data.min_order_amount && subtotal < data.min_order_amount) { setCouponError(`Minimum order of ${formatPKR(data.min_order_amount)} required.`); return; }
    if (data.valid_until && new Date(data.valid_until) < new Date()) { setCouponError('This coupon has expired.'); return; }
    let discountAmount = data.discount_type === 'percentage' ? Math.round((subtotal * data.discount_value) / 100) : data.discount_value;
    applyCoupon(data.code, discountAmount);
    setCouponSuccess(`Coupon applied! You saved ${formatPKR(discountAmount)}.`);
  };

  if (items.length === 0) {
    return (
      <div className="container-app py-20 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4"><ShoppingBag className="text-gray-400" size={36} /></div>
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">{t('emptyCart')}</h1>
        <p className="text-gray-500 mb-6">Browse our products and add items to your cart.</p>
        <Link to="/shop" className="btn-primary">{t('continueShopping')} <ArrowRight size={18} /></Link>
      </div>
    );
  }

  return (
    <div className="container-app py-6 lg:py-8 animate-fade-in">
      <h1 className="font-display text-2xl lg:text-3xl font-bold text-gray-900 mb-6">{t('cart')} <span className="text-gray-400 text-lg font-normal">({items.length} items)</span></h1>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => {
            const price = getEffectivePrice(item.product);
            return (
              <div key={item.product.id} className="card p-4 flex gap-4">
                <Link to={`/product/${item.product.slug}`} className="shrink-0"><div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-50"><img src={item.product.product_images?.[0]?.image_url || 'https://images.pexels.com/photos/4198015/pexels-photo-4198015.jpeg'} alt={item.product.name} className="w-full h-full object-cover" /></div></Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.product.slug}`}><h3 className="font-semibold text-gray-900 hover:text-primary-700 line-clamp-1">{item.product.name}</h3></Link>
                  <p className="text-sm text-gray-500 mt-0.5">{item.product.weight} • {item.product.brand}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-8 h-9 flex items-center justify-center hover:bg-gray-50 rounded-l-lg"><Minus size={14} /></button>
                      <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-8 h-9 flex items-center justify-center hover:bg-gray-50 rounded-r-lg"><Plus size={14} /></button>
                    </div>
                    <div className="flex items-center gap-3"><span className="font-bold text-primary-700">{formatPKR(price * item.quantity)}</span><button onClick={() => removeFromCart(item.product.id)} className="p-1.5 text-gray-400 hover:text-accent-600"><Trash2 size={18} /></button></div>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="flex items-center justify-between pt-2"><button onClick={clearCart} className="text-sm text-gray-500 hover:text-accent-600 flex items-center gap-1"><Trash2 size={16} /> Clear cart</button><Link to="/shop" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">{t('continueShopping')} <ArrowRight size={16} /></Link></div>
        </div>
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-24">
            <h2 className="font-display text-lg font-semibold mb-4">{t('orderSummary')}</h2>
            <div className="mb-4">
              {couponCode ? (
                <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"><div className="flex items-center gap-2"><Tag size={16} className="text-secondary-600" /><span className="text-sm font-medium text-secondary-700">{couponCode}</span></div><button onClick={removeCoupon} className="text-secondary-600 hover:text-secondary-800"><X size={16} /></button></div>
              ) : (
                <><div className="flex gap-2"><input type="text" value={couponInput} onChange={e => setCouponInput(e.target.value)} placeholder={t('couponCode')} className="input-field text-sm" /><button onClick={handleApplyCoupon} className="btn-secondary px-4 text-sm whitespace-nowrap">{t('applyCoupon')}</button></div>{couponError && <p className="text-xs text-accent-600 mt-1">{couponError}</p>}{couponSuccess && <p className="text-xs text-secondary-600 mt-1 flex items-center gap-1"><Check size={12} /> {couponSuccess}</p>}</>
              )}
            </div>
            <div className="space-y-2 text-sm border-t border-gray-100 pt-4"><div className="flex justify-between"><span className="text-gray-600">{t('subtotal')}</span><span className="font-semibold">{formatPKR(subtotal)}</span></div>{discount > 0 && <div className="flex justify-between text-secondary-600"><span>{t('discount')}</span><span className="font-semibold">-{formatPKR(discount)}</span></div>}<div className="flex justify-between"><span className="text-gray-600">{t('shipping')}</span><span className="font-semibold">{shippingCost === 0 ? 'FREE' : formatPKR(shippingCost)}</span></div>{shippingCost > 0 && <p className="text-xs text-primary-600 bg-primary-50 rounded-lg p-2">Add {formatPKR(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping!</p>}</div>
            <div className="flex justify-between items-baseline border-t border-gray-100 pt-4 mt-4"><span className="font-display text-lg font-semibold">{t('total')}</span><span className="font-display text-2xl font-bold text-primary-700">{formatPKR(total)}</span></div>
            <button onClick={() => navigate('/checkout')} className="btn-primary w-full mt-4">{t('proceedCheckout')} <ArrowRight size={18} /></button>
            <div className="mt-3 text-center text-xs text-gray-400">{t('securePayment')} • {t('codAvailable')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
