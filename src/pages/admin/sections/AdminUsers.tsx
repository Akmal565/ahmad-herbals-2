import { useEffect, useState } from 'react';
import { Shield, User, Phone, Calendar } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { formatDate } from '../../../lib/utils';
import { useToast } from '../../../components/admin/Toast';
import SearchBar from '../../../components/admin/SearchBar';
import type { Profile, Order } from '../../../types';

export default function AdminUsers() {
  const toast = useToast();
  const [users, setUsers] = useState<Profile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetch = async () => {
    setLoading(true);
    const [custRes, orderRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('user_id, total, status'),
    ]);
    if (custRes.data) setUsers(custRes.data as Profile[]);
    if (orderRes.data) setOrders(orderRes.data as Order[]);
    setLoading(false);
  };
  useEffect(() => { fetch(); }, []);

  const updateRole = async (id: string, role: string) => {
    const { error } = await supabase.from('profiles').update({ role, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) { toast(error.message, 'error'); return; }
    toast('User role updated');
    fetch();
  };

  const getUserStats = (userId: string) => {
    const userOrders = orders.filter(o => o.user_id === userId);
    return { orders: userOrders.length, spent: userOrders.reduce((s, o) => s + o.total, 0) };
  };

  const filtered = users.filter(u =>
    !search || u.email.toLowerCase().includes(search.toLowerCase()) || (u.full_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const adminCount = users.filter(u => u.role === 'admin').length;
  const customerCount = users.filter(u => u.role === 'customer').length;

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        <div className="bg-white rounded-xl border border-gray-100 p-4"><div className="flex items-center gap-2"><User className="text-gray-400" size={18} /><p className="text-xs text-gray-500">Total Users</p></div><p className="text-2xl font-bold text-gray-900 mt-1">{users.length}</p></div>
        <div className="bg-white rounded-xl border border-gray-100 p-4"><div className="flex items-center gap-2"><Shield className="text-primary-600" size={18} /><p className="text-xs text-gray-500">Admins</p></div><p className="text-2xl font-bold text-primary-700 mt-1">{adminCount}</p></div>
        <div className="bg-white rounded-xl border border-gray-100 p-4"><div className="flex items-center gap-2"><User className="text-secondary-600" size={18} /><p className="text-xs text-gray-500">Customers</p></div><p className="text-2xl font-bold text-secondary-700 mt-1">{customerCount}</p></div>
        <div className="bg-white rounded-xl border border-gray-100 p-4"><div className="flex items-center gap-2"><Calendar className="text-accent-600" size={18} /><p className="text-xs text-gray-500">New This Month</p></div><p className="text-2xl font-bold text-accent-700 mt-1">{users.filter(u => new Date(u.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}</p></div>
      </div>
      <div className="max-w-md mb-5"><SearchBar value={search} onChange={setSearch} placeholder="Search users..." /></div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? <div className="p-12 text-center text-gray-400">Loading...</div> : filtered.length === 0 ? <div className="p-12 text-center text-gray-400">No users found.</div> : (
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase"><th className="px-4 py-3 font-medium">User</th><th className="px-4 py-3 font-medium">Contact</th><th className="px-4 py-3 font-medium">Orders</th><th className="px-4 py-3 font-medium">Total Spent</th><th className="px-4 py-3 font-medium">Role</th><th className="px-4 py-3 font-medium">Joined</th></tr></thead><tbody>{filtered.map(u => { const stats = getUserStats(u.id); return (<tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50"><td className="px-4 py-3"><div className="flex items-center gap-3"><div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm ${u.role === 'admin' ? 'bg-primary-600' : 'bg-secondary-500'}`}>{(u.full_name || u.email).charAt(0).toUpperCase()}</div><div><p className="font-medium text-gray-900">{u.full_name || 'N/A'}</p><p className="text-xs text-gray-400">{u.email}</p></div></div></td><td className="px-4 py-3"><div className="flex items-center gap-1 text-xs text-gray-600"><Phone size={12} />{u.phone || 'N/A'}</div></td><td className="px-4 py-3 text-gray-700">{stats.orders}</td><td className="px-4 py-3 font-semibold text-primary-700">Rs. {stats.spent.toLocaleString()}</td><td className="px-4 py-3"><select value={u.role} onChange={e => updateRole(u.id, e.target.value)} className={`text-xs border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white ${u.role === 'admin' ? 'border-primary-300 text-primary-700 font-semibold' : 'border-gray-200 text-gray-600'}`}><option value="customer">customer</option><option value="admin">admin</option></select></td><td className="px-4 py-3 text-gray-500">{formatDate(u.created_at)}</td></tr>); })}</tbody></table></div>
        )}
      </div>
    </div>
  );
}
