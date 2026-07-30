import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, CreditCard, Truck, Wallet, Banknote, ArrowRight, ArrowLeft, MapPin, ShoppingBag, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';
import { formatPKR, getEffectivePrice, generateOrderNumber } from '../lib/utils';
import type { Address } from '../types';

const FREE_SHIPPING_THRESHOLD = 8000;
const FLAT_SHIPPING = 150;

export default function Checkout() {
  const { items, subtotal, discount, couponCode, clearCart } = useCart();
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [customerNotes, setCustomerNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [orderNum, setOrderNum] = useState('');
  const [error, setError] = useState('');
  const [newAddr, setNewAddr] = useState({ full_name: profile?.full_name || '', phone: profile?.phone || '', address_line1: '', address_line2: '', city: '', province: 'Punjab', postal_code: '' });

  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  const total = subtotal - discount + shippingCost;

  useEffect(() => {
    if (!user) { navigate('/login?redirect=/checkout'); return; }
    (async () => {
      const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (data) { setAddresses(data as Address[]); const def = data.find(a => a.is_default); setSelectedAddressId(def?.id || data[0]?.id || ''); }
    })();
  }, [user, navigate]);

  const handleSaveAddress = async () => {
    if (!user) return;
    const { data, error } = await supabase.from('addresses').insert({ ...newAddr, user_id: user.id }).select().single();
    if (!error && data) { setAddresses(prev => [data as Address, ...prev]); setSelectedAddressId(data.id); setStep(2); }
  };

  const handlePlaceOrder = async () => {
    if (!user || !selectedAddressId) { setError('Please select a shipping address.'); return; }
    setProcessing(true); setError('');
    const addr = addresses.find(a => a.id === selectedAddressId);
    if (!addr) { setError('Invalid address selected.'); setProcessing(false); return; }
    const newOrderNum = generateOrderNumber();
    const estDate = new Date(); estDate.setDate(estDate.getDate() + 5);
    const { data: orderData, error: orderError } = await supabase.from('orders').insert({
      user_id: user.id, order_number: newOrderNum, status: 'pending', payment_method: paymentMethod, payment_status: 'pending',
      subtotal, discount, shipping_cost: shippingCost, total, coupon_code: couponCode || '',
      shipping_address: { full_name: addr.full_name, phone: addr.phone, address_line1: addr.address_line1, address_line2: addr.address_line2, city: addr.city, province: addr.province, postal_code: addr.postal_code },
      billing_address: { full_name: addr.full_name, phone: addr.phone, address_line1: addr.address_line1, address_line2: addr.address_line2, city: addr.city, province: addr.province, postal_code: addr.postal_code },
      customer_notes: customerNotes, estimated_delivery: estDate.toISOString().split('T')[0],
    }).select().single();
    if (orderError) { setError(orderError.message); setProcessing(false); return; }
    const orderItems = items.map(item => ({ order_id: orderData.id, product_id: item.product.id, product_name: item.product.name, product_image: item.product.product_images?.[0]?.image_url || '', price: getEffectivePrice(item.product), quantity: item.quantity, weight: item.product.weight }));
    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) { setError(itemsError.message); setProcessing(false); return; }
    setOrderNum(newOrderNum); clearCart(); setProcessing(false); setStep(4);
  };

  if (items.length === 0 && step !== 4) return <div className="container-app py-20 text-center"><ShoppingBag className="text-gray-400 mx-auto mb-4" size={48} /><h1 className="font-display text-2xl font-bold mb-2">{t('emptyCart')}</h1><Link to="/shop" className="btn-primary mt-4">{t('continueShopping')}</Link></div>;

  if (step === 4) return (
    <div className="container-app py-12 lg:py-20 text-center animate-fade-in"><div className="max-w-md mx-auto">
      <div className="w-20 h-20 rounded-full bg-secondary-100 flex items-center justify-center mx-auto mb-4"><Check className="text-secondary-600" size={40} /></div>
      <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
      <p className="text-gray-500 mb-6">Thank you for your order. We will process it shortly.</p>
      <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6 text-left"><div className="flex justify-between mb-3"><span className="text-gray-500 text-sm">Order Number</span><span className="font-semibold text-gray-900">{orderNum}</span></div><div className="flex justify-between mb-3"><span className="text-gray-500 text-sm">Payment Method</span><span className="font-semibold text-gray-900 uppercase">{paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod}</span></div><div className="flex justify-between border-t border-gray-100 pt-3"><span className="text-gray-500 text-sm">Total Amount</span><span className="font-bold text-primary-700 text-lg">{formatPKR(total)}</span></div></div>
      <a href={`https://wa.me/923483617905?text=${encodeURIComponent(`Assalam o Alaikum! I just placed an order on Ahmad Herbals.\n\nOrder Number: ${orderNum}\nPayment Method: ${paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod}\nTotal Amount: ${formatPKR(total)}\n\nPlease confirm my order. Thank you!`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 w-full justify-center px-5 py-3 bg-[#25D366] text-white text-sm font-semibold rounded-lg hover:bg-[#1da851] transition-colors mb-3"><MessageCircle size={18} /> Send Order on WhatsApp</a>
      <div className="flex gap-3 justify-center"><Link to="/dashboard?tab=orders" className="btn-primary">{t('myOrders')}</Link><Link to="/shop" className="btn-outline">{t('continueShopping')}</Link></div>
    </div></div>
  );

  const steps = ['Shipping', 'Payment', 'Review'];
  return (
    <div className="container-app py-6 lg:py-8 animate-fade-in">
      <h1 className="font-display text-2xl lg:text-3xl font-bold text-gray-900 mb-6">Checkout</h1>
      <div className="flex items-center gap-2 mb-8">{steps.map((label, i) => <div key={i} className="flex items-center gap-2"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step > i+1 ? 'bg-secondary-500 text-white' : step === i+1 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'}`}>{step > i+1 ? <Check size={16} /> : i+1}</div><span className={`text-sm font-medium hidden sm:block ${step >= i+1 ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>{i < steps.length-1 && <div className={`w-8 h-0.5 ${step > i+1 ? 'bg-secondary-500' : 'bg-gray-200'}`} />}</div>)}</div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {step === 1 && (
            <div className="card p-6 animate-fade-in">
              <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2"><MapPin size={20} className="text-primary-600" /> Shipping Address</h2>
              {addresses.length > 0 && <div className="space-y-3 mb-6">{addresses.map(addr => <label key={addr.id} className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}><div className="flex items-start gap-3"><input type="radio" name="address" value={addr.id} checked={selectedAddressId === addr.id} onChange={e => setSelectedAddressId(e.target.value)} className="mt-1" /><div className="flex-1"><p className="font-semibold text-sm text-gray-900">{addr.full_name} • {addr.phone}</p><p className="text-sm text-gray-600 mt-0.5">{addr.address_line1}{addr.address_line2 && `, ${addr.address_line2}`}</p><p className="text-sm text-gray-600">{addr.city}, {addr.province} {addr.postal_code}</p></div></div></label>)}</div>}
              <div className="space-y-3"><h3 className="font-semibold text-sm text-gray-700">{addresses.length > 0 ? 'Or add a new address:' : 'Add your shipping address:'}</h3>
                <div className="grid sm:grid-cols-2 gap-3"><input type="text" placeholder="Full Name" value={newAddr.full_name} onChange={e => setNewAddr(a => ({ ...a, full_name: e.target.value }))} className="input-field" /><input type="text" placeholder="Phone Number" value={newAddr.phone} onChange={e => setNewAddr(a => ({ ...a, phone: e.target.value }))} className="input-field" /></div>
                <input type="text" placeholder="Address Line 1" value={newAddr.address_line1} onChange={e => setNewAddr(a => ({ ...a, address_line1: e.target.value }))} className="input-field" />
                <input type="text" placeholder="Address Line 2 (optional)" value={newAddr.address_line2} onChange={e => setNewAddr(a => ({ ...a, address_line2: e.target.value }))} className="input-field" />
                <div className="grid sm:grid-cols-3 gap-3"><input type="text" placeholder="City" value={newAddr.city} onChange={e => setNewAddr(a => ({ ...a, city: e.target.value }))} className="input-field" /><select value={newAddr.province} onChange={e => setNewAddr(a => ({ ...a, province: e.target.value }))} className="input-field"><option>Punjab</option><option>Sindh</option><option>Khyber Pakhtunkhwa</option><option>Balochistan</option><option>Islamabad Capital Territory</option><option>Gilgit-Baltistan</option><option>Azad Jammu & Kashmir</option></select><input type="text" placeholder="Postal Code" value={newAddr.postal_code} onChange={e => setNewAddr(a => ({ ...a, postal_code: e.target.value }))} className="input-field" /></div>
              </div>
              <div className="flex justify-between mt-6"><Link to="/cart" className="btn-outline"><ArrowLeft size={18} /> Back to Cart</Link><button onClick={() => { if (selectedAddressId) setStep(2); else if (newAddr.full_name && newAddr.phone && newAddr.address_line1 && newAddr.city) handleSaveAddress(); }} className="btn-primary" disabled={!selectedAddressId && (!newAddr.full_name || !newAddr.phone || !newAddr.address_line1 || !newAddr.city)}>Continue <ArrowRight size={18} /></button></div>
            </div>
          )}
          {step === 2 && (
            <div className="card p-6 animate-fade-in">
              <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2"><Wallet size={20} className="text-primary-600" /> Payment Method</h2>
              <div className="space-y-3">
                {[{ id: 'cod', label: 'Cash on Delivery (COD)', desc: 'Pay when you receive your order', icon: Banknote }, { id: 'easypaisa', label: 'Easypaisa', desc: 'Pay via Easypaisa mobile wallet', icon: Wallet }, { id: 'jazzcash', label: 'JazzCash', desc: 'Pay via JazzCash mobile wallet', icon: Wallet }, { id: 'stripe', label: 'Credit/Debit Card (Stripe)', desc: 'Visa, Mastercard, Amex', icon: CreditCard }].map(method => <label key={method.id} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === method.id ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}><input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id} onChange={e => setPaymentMethod(e.target.value)} /><method.icon className="text-primary-600" size={22} /><div className="flex-1"><p className="font-semibold text-sm text-gray-900">{method.label}</p><p className="text-xs text-gray-500">{method.desc}</p></div></label>)}
              </div>
              {paymentMethod === 'easypaisa' && <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl"><p className="text-sm font-semibold text-green-800 mb-1">Easypaisa Payment</p><p className="text-sm text-green-700">Send your payment to: <span className="font-bold">03483617905</span></p><p className="text-xs text-green-600 mt-1">Please send a screenshot of the payment confirmation via WhatsApp after placing your order.</p></div>}
              <div className="mt-6"><label className="block text-sm font-medium text-gray-700 mb-1">Order Notes (optional)</label><textarea value={customerNotes} onChange={e => setCustomerNotes(e.target.value)} placeholder="Any special instructions for delivery..." rows={3} className="input-field resize-none" /></div>
              <div className="flex justify-between mt-6"><button onClick={() => setStep(1)} className="btn-outline"><ArrowLeft size={18} /> Back</button><button onClick={() => setStep(3)} className="btn-primary">Review Order <ArrowRight size={18} /></button></div>
            </div>
          )}
          {step === 3 && (
            <div className="card p-6 animate-fade-in">
              <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2"><Check size={20} className="text-primary-600" /> Review Your Order</h2>
              <div className="space-y-3 mb-6">{items.map(item => <div key={item.product.id} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0"><img src={item.product.product_images?.[0]?.image_url || 'https://images.pexels.com/photos/4198015/pexels-photo-4198015.jpeg'} alt={item.product.name} className="w-14 h-14 rounded-lg object-cover" /><div className="flex-1"><p className="font-semibold text-sm text-gray-900">{item.product.name}</p><p className="text-xs text-gray-500">{item.product.weight} • Qty: {item.quantity}</p></div><span className="font-semibold text-primary-700">{formatPKR(getEffectivePrice(item.product) * item.quantity)}</span></div>)}</div>
              {selectedAddressId && <div className="bg-gray-50 rounded-xl p-4 mb-4"><p className="text-xs font-semibold text-gray-500 uppercase mb-1">Shipping Address</p>{(() => { const addr = addresses.find(a => a.id === selectedAddressId); if (!addr) return null; return <p className="text-sm text-gray-700">{addr.full_name} • {addr.phone}<br />{addr.address_line1}{addr.address_line2 && `, ${addr.address_line2}`}<br />{addr.city}, {addr.province} {addr.postal_code}</p>; })()}</div>}
              <div className="bg-gray-50 rounded-xl p-4 mb-6"><p className="text-xs font-semibold text-gray-500 uppercase mb-1">Payment Method</p><p className="text-sm text-gray-700 font-medium uppercase">{paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod}</p></div>
              {error && <div className="p-3 bg-accent-50 text-accent-700 rounded-lg text-sm mb-4">{error}</div>}
              <div className="flex justify-between"><button onClick={() => setStep(2)} className="btn-outline"><ArrowLeft size={18} /> Back</button><button onClick={handlePlaceOrder} disabled={processing} className="btn-primary">{processing ? 'Placing Order...' : <>Place Order <Check size={18} /></>}</button></div>
            </div>
          )}
        </div>
        <div className="lg:col-span-1"><div className="card p-5 sticky top-24">
          <h2 className="font-display text-lg font-semibold mb-4">{t('orderSummary')}</h2>
          <div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-gray-600">{t('subtotal')}</span><span className="font-semibold">{formatPKR(subtotal)}</span></div>{discount > 0 && <div className="flex justify-between text-secondary-600"><span>{t('discount')}</span><span className="font-semibold">-{formatPKR(discount)}</span></div>}<div className="flex justify-between"><span className="text-gray-600">{t('shipping')}</span><span className="font-semibold">{shippingCost === 0 ? 'FREE' : formatPKR(shippingCost)}</span></div></div>
          <div className="flex justify-between items-baseline border-t border-gray-100 pt-4 mt-4"><span className="font-display text-lg font-semibold">{t('total')}</span><span className="font-display text-2xl font-bold text-primary-700">{formatPKR(total)}</span></div>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-400"><Truck size={14} /> Estimated delivery: 3-5 business days</div>
        </div></div>
      </div>
    </div>
  );
}
