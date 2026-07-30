import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, User, MapPin, Heart, LogOut, Plus, Trash2, Edit2, ChevronRight, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';
import { formatPKR, formatDate } from '../lib/utils';
import type { Order, Address } from '../types';

export default function Dashboard() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: '', phone: '' });
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrForm, setAddrForm] = useState({ full_name: '', phone: '', address_line1: '', address_line2: '', city: '', province: 'Punjab', postal_code: '' });

  useEffect(() => {
    if (!user) { navigate('/login?redirect=/dashboard'); return; }
    (async () => {
      setLoading(true);
      const [ordersRes, addrRes] = await Promise.all([
        supabase.from('orders').select('*, order_items(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('addresses').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);
      if (ordersRes.data) setOrders(ordersRes.data as Order[]);
      if (addrRes.data) setAddresses(addrRes.data as Address[]);
      if (profile) setProfileForm({ full_name: profile.full_name, phone: profile.phone });
      setLoading(false);
    })();
  }, [user, navigate, profile]);

  const setTab = (tab: string) => setSearchParams(tab === 'overview' ? new URLSearchParams() : new URLSearchParams({ tab }));
  const handleLogout = async () => { await signOut(); navigate('/'); };
  const handleUpdateProfile = async () => { if (!user) return; const { error } = await supabase.from('profiles').update({ full_name: profileForm.full_name, phone: profileForm.phone, updated_at: new Date().toISOString() }).eq('id', user.id); if (!error) { await refreshProfile(); setEditingProfile(false); } };
  const handleSaveAddress = async () => { if (!user) return; const { data, error } = await supabase.from('addresses').insert({ ...addrForm, user_id: user.id }).select().single(); if (!error && data) { setAddresses(prev => [data as Address, ...prev]); setShowAddrForm(false); setAddrForm({ full_name: '', phone: '', address_line1: '', address_line2: '', city: '', province: 'Punjab', postal_code: '' }); } };
  const handleDeleteAddress = async (id: string) => { await supabase.from('addresses').delete().eq('id', id); setAddresses(prev => prev.filter(a => a.id !== id)); };

  if (!user) return null;
  const tabs = [{ id: 'overview', label: t('dashboard'), icon: LayoutDashboard }, { id: 'orders', label: t('myOrders'), icon: Package }, { id: 'addresses', label: t('addresses'), icon: MapPin }, { id: 'profile', label: t('myProfile'), icon: User }];
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="container-app py-6 lg:py-8 animate-fade-in">
      <h1 className="font-display text-2xl lg:text-3xl font-bold text-gray-900 mb-6">{t('dashboard')}</h1>
      <div className="grid lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1"><div className="card p-4 mb-4"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-lg">{profile?.full_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}</div><div className="min-w-0"><p className="font-semibold text-sm text-gray-900 truncate">{profile?.full_name || 'User'}</p><p className="text-xs text-gray-500 truncate">{user.email}</p></div></div></div>
          <nav className="card p-2">{tabs.map(tab => <button key={tab.id} onClick={() => setTab(tab.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}><tab.icon size={18} />{tab.label}{tab.id === 'orders' && orders.length > 0 && <span className="ms-auto text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">{orders.length}</span>}</button>)}
            {profile?.role === 'admin' && <Link to="/admin" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-primary-700 hover:bg-primary-50">{t('adminPanel')}</Link>}
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 border-t border-gray-100 mt-1 pt-3"><LogOut size={18} />{t('logout')}</button></nav>
        </aside>
        <div className="lg:col-span-3">
          {loading ? <div className="card p-12 text-center text-gray-400">Loading...</div> : (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid sm:grid-cols-3 gap-4">
                    {[{ icon: Package, val: orders.length, label: 'Total Orders', color: 'primary' }, { icon: ShoppingBag, val: formatPKR(totalSpent), label: 'Total Spent', color: 'secondary' }, { icon: Heart, val: '0', label: 'Wishlist Items', color: 'accent' }].map((s, i) => <div key={i} className="card p-5"><div className="flex items-center gap-3"><div className={`w-11 h-11 rounded-lg bg-${s.color}-50 flex items-center justify-center`}><s.icon className={`text-${s.color}-600`} size={22} /></div><div><p className="text-2xl font-bold text-gray-900">{s.val}</p><p className="text-xs text-gray-500">{s.label}</p></div></div></div>)}
                  </div>
                  <div className="card p-5"><div className="flex items-center justify-between mb-4"><h2 className="font-display text-lg font-semibold">Recent Orders</h2><button onClick={() => setTab('orders')} className="text-sm text-primary-600 font-medium flex items-center gap-1">View All <ChevronRight size={16} /></button></div>
                    {orders.length === 0 ? <div className="text-center py-8"><Package className="text-gray-300 mx-auto mb-2" size={36} /><p className="text-sm text-gray-500 mb-3">No orders yet.</p><Link to="/shop" className="btn-primary text-sm">Start Shopping</Link></div> : <div className="space-y-3">{orders.slice(0, 3).map(order => <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><div><p className="font-semibold text-sm text-gray-900">{order.order_number}</p><p className="text-xs text-gray-500">{formatDate(order.created_at)} • {order.order_items?.length || 0} items</p></div><div className="flex items-center gap-3"><span className={`badge ${order.status === 'delivered' ? 'bg-secondary-100 text-secondary-700' : order.status === 'cancelled' ? 'bg-accent-100 text-accent-700' : 'bg-primary-100 text-primary-700'}`}>{order.status}</span><span className="font-semibold text-primary-700">{formatPKR(order.total)}</span></div></div>)}</div>}
                  </div>
                </div>
              )}
              {activeTab === 'orders' && (
                <div className="space-y-4 animate-fade-in">
                  <h2 className="font-display text-lg font-semibold">{t('myOrders')}</h2>
                  {orders.length === 0 ? <div className="card p-12 text-center"><Package className="text-gray-300 mx-auto mb-3" size={48} /><p className="text-gray-500 mb-4">You haven't placed any orders yet.</p><Link to="/shop" className="btn-primary">Start Shopping</Link></div> : orders.map(order => (
                    <div key={order.id} className="card p-5">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100"><div><p className="font-semibold text-gray-900">{order.order_number}</p><p className="text-xs text-gray-500">{formatDate(order.created_at)}</p></div><div className="flex items-center gap-2"><span className={`badge ${order.status === 'delivered' ? 'bg-secondary-100 text-secondary-700' : order.status === 'cancelled' ? 'bg-accent-100 text-accent-700' : 'bg-primary-100 text-primary-700'}`}>{order.status}</span><span className="font-bold text-primary-700">{formatPKR(order.total)}</span></div></div>
                      <div className="space-y-2">{order.order_items?.map(item => <div key={item.id} className="flex items-center gap-3"><img src={item.product_image || 'https://images.pexels.com/photos/4198015/pexels-photo-4198015.jpeg'} alt={item.product_name} className="w-10 h-10 rounded-lg object-cover" /><div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{item.product_name}</p><p className="text-xs text-gray-500">Qty: {item.quantity} • {item.weight}</p></div><span className="text-sm font-semibold">{formatPKR(item.price * item.quantity)}</span></div>)}</div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'addresses' && (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between mb-4"><h2 className="font-display text-lg font-semibold">{t('addresses')}</h2><button onClick={() => setShowAddrForm(!showAddrForm)} className="btn-secondary text-sm py-2"><Plus size={16} /> Add Address</button></div>
                  {showAddrForm && <div className="card p-5 mb-4 animate-slide-down"><div className="grid sm:grid-cols-2 gap-3"><input type="text" placeholder="Full Name" value={addrForm.full_name} onChange={e => setAddrForm(a => ({ ...a, full_name: e.target.value }))} className="input-field" /><input type="text" placeholder="Phone" value={addrForm.phone} onChange={e => setAddrForm(a => ({ ...a, phone: e.target.value }))} className="input-field" /></div><input type="text" placeholder="Address Line 1" value={addrForm.address_line1} onChange={e => setAddrForm(a => ({ ...a, address_line1: e.target.value }))} className="input-field mt-3" /><input type="text" placeholder="Address Line 2 (optional)" value={addrForm.address_line2} onChange={e => setAddrForm(a => ({ ...a, address_line2: e.target.value }))} className="input-field mt-3" /><div className="grid sm:grid-cols-3 gap-3 mt-3"><input type="text" placeholder="City" value={addrForm.city} onChange={e => setAddrForm(a => ({ ...a, city: e.target.value }))} className="input-field" /><select value={addrForm.province} onChange={e => setAddrForm(a => ({ ...a, province: e.target.value }))} className="input-field"><option>Punjab</option><option>Sindh</option><option>Khyber Pakhtunkhwa</option><option>Balochistan</option><option>Islamabad Capital Territory</option></select><input type="text" placeholder="Postal Code" value={addrForm.postal_code} onChange={e => setAddrForm(a => ({ ...a, postal_code: e.target.value }))} className="input-field" /></div><div className="flex gap-2 mt-4"><button onClick={handleSaveAddress} className="btn-primary text-sm py-2">Save Address</button><button onClick={() => setShowAddrForm(false)} className="btn-outline text-sm py-2">Cancel</button></div></div>}
                  {addresses.length === 0 && !showAddrForm ? <div className="card p-12 text-center"><MapPin className="text-gray-300 mx-auto mb-3" size={48} /><p className="text-gray-500">No saved addresses yet.</p></div> : <div className="grid sm:grid-cols-2 gap-4">{addresses.map(addr => <div key={addr.id} className="card p-4"><div className="flex items-start justify-between"><div><p className="font-semibold text-sm text-gray-900">{addr.full_name}</p><p className="text-xs text-gray-500">{addr.phone}</p><p className="text-sm text-gray-600 mt-2">{addr.address_line1}{addr.address_line2 && `, ${addr.address_line2}`}<br />{addr.city}, {addr.province} {addr.postal_code}</p></div><button onClick={() => handleDeleteAddress(addr.id)} className="p-1.5 text-gray-400 hover:text-accent-600"><Trash2 size={16} /></button></div></div>)}</div>}
                </div>
              )}
              {activeTab === 'profile' && (
                <div className="card p-6 animate-fade-in">
                  <div className="flex items-center justify-between mb-6"><h2 className="font-display text-lg font-semibold">{t('myProfile')}</h2><button onClick={() => setEditingProfile(!editingProfile)} className="btn-secondary text-sm py-2"><Edit2 size={16} /> Edit</button></div>
                  {editingProfile ? (
                    <div className="space-y-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input type="text" value={profileForm.full_name} onChange={e => setProfileForm(f => ({ ...f, full_name: e.target.value }))} className="input-field" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input type="text" value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} className="input-field" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Email (cannot be changed)</label><input type="email" value={user.email} disabled className="input-field bg-gray-50 text-gray-400" /></div><div className="flex gap-2"><button onClick={handleUpdateProfile} className="btn-primary text-sm py-2">Save Changes</button><button onClick={() => setEditingProfile(false)} className="btn-outline text-sm py-2">Cancel</button></div></div>
                  ) : (
                    <div className="space-y-4"><div className="flex items-center gap-4 pb-4 border-b border-gray-100"><div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-2xl">{profile?.full_name?.charAt(0).toUpperCase() || 'U'}</div><div><p className="font-display text-xl font-semibold text-gray-900">{profile?.full_name || 'User'}</p><p className="text-sm text-gray-500">{user.email}</p></div></div>
                      <div className="grid sm:grid-cols-2 gap-4"><div><p className="text-xs text-gray-400 uppercase">Full Name</p><p className="text-sm font-medium text-gray-900">{profile?.full_name || 'Not set'}</p></div><div><p className="text-xs text-gray-400 uppercase">Phone</p><p className="text-sm font-medium text-gray-900">{profile?.phone || 'Not set'}</p></div><div><p className="text-xs text-gray-400 uppercase">Email</p><p className="text-sm font-medium text-gray-900">{user.email}</p></div><div><p className="text-xs text-gray-400 uppercase">Member Since</p><p className="text-sm font-medium text-gray-900">{profile ? formatDate(profile.created_at) : ''}</p></div></div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
