import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { formatPKR, formatDate } from '../../../lib/utils';
import { useToast } from '../../../components/admin/Toast';
import Badge from '../../../components/admin/Badge';
import SearchBar from '../../../components/admin/SearchBar';
import Modal from '../../../components/admin/Modal';
import type { Order } from '../../../types';

export default function AdminOrders() {
  const toast = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  const fetch = async () => { setLoading(true); const { data } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }); if (data) setOrders(data as Order[]); setLoading(false); };
  useEffect(() => {
    fetch();
    const channel = supabase.channel('orders-realtime').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => fetch()).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, () => fetch()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateStatus = async (id: string, status: string) => { const { error } = await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id); if (error) { toast(error.message, 'error'); return; } toast('Order status updated'); fetch(); };
  const updatePaymentStatus = async (id: string, payment_status: string) => { const { error } = await supabase.from('orders').update({ payment_status }).eq('id', id); if (error) { toast(error.message, 'error'); return; } toast('Payment status updated'); fetch(); };

  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
  const paymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
  const filtered = orders.filter(o => (filterStatus === 'all' || o.status === filterStatus) && (!search || o.order_number.toLowerCase().includes(search.toLowerCase())));

  return (
    <div>
      <div className="flex items-center justify-between mb-5"><div className="flex-1 max-w-md"><SearchBar value={search} onChange={setSearch} placeholder="Search order number..." /></div><select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="ml-4 px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"><option value="all">All Status</option>{statuses.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}</select></div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">{loading ? <div className="p-12 text-center text-gray-400">Loading...</div> : filtered.length === 0 ? <div className="p-12 text-center text-gray-400">No orders found.</div> : (
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase"><th className="px-4 py-3 font-medium">Order #</th><th className="px-4 py-3 font-medium">Customer</th><th className="px-4 py-3 font-medium">Phone</th><th className="px-4 py-3 font-medium">Address</th><th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 font-medium">Items</th><th className="px-4 py-3 font-medium">Payment</th><th className="px-4 py-3 font-medium">Pay Status</th><th className="px-4 py-3 font-medium">Order Status</th><th className="px-4 py-3 font-medium text-right">Total</th><th className="px-4 py-3 font-medium">View</th></tr></thead><tbody>{filtered.map(order => (<tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50"><td className="px-4 py-3 font-medium text-gray-900">{order.order_number}</td><td className="px-4 py-3 text-gray-700">{order.shipping_address?.full_name || '-'}</td><td className="px-4 py-3 text-gray-700">{order.shipping_address?.phone || '-'}</td><td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{order.shipping_address ? `${order.shipping_address.address_line1}${order.shipping_address.address_line2 ? ', ' + order.shipping_address.address_line2 : ''}, ${order.shipping_address.city}` : '-'}</td><td className="px-4 py-3 text-gray-500">{formatDate(order.created_at)}</td><td className="px-4 py-3 text-gray-700">{order.order_items?.length || 0}</td><td className="px-4 py-3"><span className="text-xs text-gray-600 uppercase">{order.payment_method}</span></td><td className="px-4 py-3"><select value={order.payment_status} onChange={e => updatePaymentStatus(order.id, e.target.value)} className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500">{paymentStatuses.map(s => <option key={s} value={s}>{s}</option>)}</select></td><td className="px-4 py-3"><select value={order.status} onChange={e => updateStatus(order.id, e.target.value)} className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500">{statuses.map(s => <option key={s} value={s}>{s}</option>)}</select></td><td className="px-4 py-3 text-right font-semibold text-primary-700">{formatPKR(order.total)}</td><td className="px-4 py-3"><button onClick={() => setDetailOrder(order)} className="text-primary-600 text-xs font-medium hover:text-primary-700">Details</button></td></tr>))}</tbody></table></div>
      )}</div>
      <Modal open={!!detailOrder} onClose={() => setDetailOrder(null)} title={detailOrder ? `Order ${detailOrder.order_number}` : ''} size="lg">{detailOrder && (
        <div className="space-y-4"><div className="grid grid-cols-2 gap-4 text-sm"><div><p className="text-xs text-gray-400 uppercase">Status</p><Badge status={detailOrder.status} /></div><div><p className="text-xs text-gray-400 uppercase">Payment</p><Badge status={detailOrder.payment_status} /></div><div><p className="text-xs text-gray-400 uppercase">Method</p><p className="font-medium uppercase">{detailOrder.payment_method}</p></div><div><p className="text-xs text-gray-400 uppercase">Date</p><p className="font-medium">{formatDate(detailOrder.created_at)}</p></div></div>
          <div className="border-t border-gray-100 pt-4"><p className="text-xs text-gray-400 uppercase mb-2">Shipping Address</p>{detailOrder.shipping_address && <p className="text-sm text-gray-700">{detailOrder.shipping_address.full_name} • {detailOrder.shipping_address.phone}<br />{detailOrder.shipping_address.address_line1}{detailOrder.shipping_address.address_line2 && `, ${detailOrder.shipping_address.address_line2}`}<br />{detailOrder.shipping_address.city}, {detailOrder.shipping_address.province} {detailOrder.shipping_address.postal_code}</p>}</div>
          <div className="border-t border-gray-100 pt-4"><p className="text-xs text-gray-400 uppercase mb-2">Items</p><div className="space-y-2">{detailOrder.order_items?.map(item => (<div key={item.id} className="flex items-center gap-3">{item.product_image && <img src={item.product_image} alt="" className="w-10 h-10 rounded-lg object-cover" />}<div className="flex-1"><p className="text-sm font-medium text-gray-900">{item.product_name}</p><p className="text-xs text-gray-500">Qty: {item.quantity} • {item.weight}</p></div><span className="text-sm font-semibold">{formatPKR(item.price * item.quantity)}</span></div>))}</div></div>
          <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-2 text-sm"><div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatPKR(detailOrder.subtotal)}</span></div><div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{formatPKR(detailOrder.shipping_cost)}</span></div>{detailOrder.discount > 0 && <div className="flex justify-between text-secondary-600"><span>Discount</span><span>-{formatPKR(detailOrder.discount)}</span></div>}<div className="flex justify-between font-bold text-primary-700"><span>Total</span><span>{formatPKR(detailOrder.total)}</span></div></div>
          {detailOrder.customer_notes && <div className="border-t border-gray-100 pt-4"><p className="text-xs text-gray-400 uppercase mb-1">Customer Notes</p><p className="text-sm text-gray-600">{detailOrder.customer_notes}</p></div>}
          <div className="border-t border-gray-100 pt-4">
            <a href={`https://wa.me/923483617905?text=${encodeURIComponent(`Assalam o Alaikum! Regarding your order ${detailOrder.order_number} on Ahmad Herbals.\n\nOrder Status: ${detailOrder.status}\nTotal: ${formatPKR(detailOrder.total)}\n\nThank you for shopping with us!`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#25D366] text-white text-sm font-semibold rounded-lg hover:bg-[#1da851] transition-colors"><MessageCircle size={16} /> Send WhatsApp Message</a>
          </div>
        </div>
      )}</Modal>
    </div>
  );
}
