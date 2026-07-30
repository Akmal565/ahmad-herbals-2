import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { formatPKR, formatDate } from '../../../lib/utils';
import { useToast } from '../../../components/admin/Toast';
import SearchBar from '../../../components/admin/SearchBar';
import type { Profile, Order } from '../../../types';

export default function AdminCustomers() {
  const toast = useToast();
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetch = async () => { setLoading(true); const [custRes, orderRes] = await Promise.all([supabase.from('profiles').select('*').order('created_at', { ascending: false }), supabase.from('orders').select('user_id, total')]); if (custRes.data) setCustomers(custRes.data as Profile[]); if (orderRes.data) setOrders(orderRes.data as Order[]); setLoading(false); };
  useEffect(() => { fetch(); }, []);

  const updateRole = async (id: string, role: string) => { const { error } = await supabase.from('profiles').update({ role }).eq('id', id); if (error) { toast(error.message, 'error'); return; } toast('Role updated'); fetch(); };
  const getOrderStats = (userId: string) => { const userOrders = orders.filter(o => o.user_id === userId); return { count: userOrders.length, total: userOrders.reduce((s, o) => s + o.total, 0) }; };
  const filtered = customers.filter(c => !search || c.email.toLowerCase().includes(search.toLowerCase()) || (c.full_name || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="max-w-md mb-5"><SearchBar value={search} onChange={setSearch} placeholder="Search by name or email..." /></div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">{loading ? <div className="p-12 text-center text-gray-400">Loading...</div> : filtered.length === 0 ? <div className="p-12 text-center text-gray-400">No customers found.</div> : (
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase"><th className="px-4 py-3 font-medium">Customer</th><th className="px-4 py-3 font-medium">Email</th><th className="px-4 py-3 font-medium">Phone</th><th className="px-4 py-3 font-medium">Orders</th><th className="px-4 py-3 font-medium">Total Spent</th><th className="px-4 py-3 font-medium">Role</th><th className="px-4 py-3 font-medium">Joined</th></tr></thead><tbody>{filtered.map(c => { const stats = getOrderStats(c.id); return (<tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50"><td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-sm">{(c.full_name || c.email).charAt(0).toUpperCase()}</div><span className="font-medium text-gray-900">{c.full_name || 'N/A'}</span></div></td><td className="px-4 py-3 text-gray-500">{c.email}</td><td className="px-4 py-3 text-gray-600">{c.phone || '-'}</td><td className="px-4 py-3 text-gray-700">{stats.count}</td><td className="px-4 py-3 font-semibold text-primary-700">{formatPKR(stats.total)}</td><td className="px-4 py-3"><select value={c.role} onChange={e => updateRole(c.id, e.target.value)} className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"><option value="customer">customer</option><option value="admin">admin</option></select></td><td className="px-4 py-3 text-gray-500">{formatDate(c.created_at)}</td></tr>); })}</tbody></table></div>
      )}</div>
    </div>
  );
}
