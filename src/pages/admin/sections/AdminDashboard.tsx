import { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, Package, Users, TrendingUp, Clock, Truck, AlertTriangle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { formatPKR, formatDate, getFirstImage } from '../../../lib/utils';
import StatCard from '../../../components/admin/StatCard';
import Badge from '../../../components/admin/Badge';

interface AdminDashboardProps { onNavigate: (section: string) => void; }

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ revenue: 0, orders: 0, products: 0, customers: 0 });
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [recentOrders, setRecentOrders] = useState<Record<string, unknown>[]>([]);
  const [lowStock, setLowStock] = useState<Record<string, unknown>[]>([]);
  const [topProducts, setTopProducts] = useState<Record<string, unknown>[]>([]);
  const [salesData, setSalesData] = useState<{ day: string; total: number }[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [orderRes, prodRes, custRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('products').select('*').order('stock', { ascending: true }),
        supabase.from('profiles').select('*'),
      ]);
      const orders = orderRes.data || [];
      const products = prodRes.data || [];
      const customers = custRes.data || [];
      setStats({ revenue: orders.reduce((s, o) => s + (o as Record<string, number>).total, 0), orders: orders.length, products: products.length, customers: customers.length });
      const sc: Record<string, number> = {};
      orders.forEach(o => { const st = (o as Record<string, string>).status; sc[st] = (sc[st] || 0) + 1; });
      setStatusCounts(sc);
      setRecentOrders(orders.slice(0, 5).map(o => o as Record<string, unknown>));
      setLowStock(products.filter(p => (p as Record<string, number>).stock < 20).slice(0, 5).map(p => p as Record<string, unknown>));
      const salesByDay: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const key = d.toLocaleDateString('en', { weekday: 'short' }); salesByDay[key] = 0; }
      orders.forEach(o => { const d = new Date((o as Record<string, string>).created_at); const key = d.toLocaleDateString('en', { weekday: 'short' }); if (salesByDay[key] !== undefined) salesByDay[key] += (o as Record<string, number>).total; });
      setSalesData(Object.entries(salesByDay).map(([day, total]) => ({ day, total })));
      const top = [...products].sort((a, b) => ((b as Record<string, number>).price * (b as Record<string, number>).stock) - ((a as Record<string, number>).price * (a as Record<string, number>).stock)).slice(0, 5);
      setTopProducts(top.map(p => p as Record<string, unknown>));
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="p-12 text-center text-gray-400">Loading dashboard...</div>;
  const maxSale = Math.max(...salesData.map(s => s.total), 1);
  const pendingCount = statusCounts.pending || 0;
  const deliveredCount = statusCounts.delivered || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={formatPKR(stats.revenue)} icon={DollarSign as LucideIcon} color="primary" />
        <StatCard label="Total Orders" value={stats.orders} icon={ShoppingCart as LucideIcon} color="secondary" />
        <StatCard label="Products" value={stats.products} icon={Package as LucideIcon} color="accent" />
        <StatCard label="Customers" value={stats.customers} icon={Users as LucideIcon} color="primary" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center"><Clock className="text-amber-600" size={20} /></div><div><p className="text-lg font-bold text-gray-900">{pendingCount}</p><p className="text-xs text-gray-500">Pending Orders</p></div></div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-secondary-50 flex items-center justify-center"><Truck className="text-secondary-600" size={20} /></div><div><p className="text-lg font-bold text-gray-900">{deliveredCount}</p><p className="text-xs text-gray-500">Delivered Orders</p></div></div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-accent-50 flex items-center justify-center"><AlertTriangle className="text-accent-600" size={20} /></div><div><p className="text-lg font-bold text-gray-900">{lowStock.length}</p><p className="text-xs text-gray-500">Low Stock Items</p></div></div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-5"><div className="flex items-center gap-2 mb-4"><TrendingUp className="text-primary-600" size={20} /><h2 className="font-display text-lg font-semibold text-gray-900">Weekly Sales Overview</h2></div>
        <div className="flex items-end justify-between gap-3 h-48">{salesData.map((sale, i) => (<div key={i} className="flex-1 flex flex-col items-center gap-2"><div className="w-full bg-gray-50 rounded-t-lg flex items-end justify-center" style={{ height: '160px' }}><div className="w-full max-w-[60px] bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg transition-all duration-500 hover:from-primary-700 hover:to-primary-500" style={{ height: `${(sale.total / maxSale) * 100}%`, minHeight: sale.total > 0 ? '8px' : '2px' }} title={formatPKR(sale.total)} /></div><span className="text-xs text-gray-500 font-medium">{sale.day}</span><span className="text-[10px] text-gray-400">{sale.total > 0 ? formatPKR(sale.total) : '-'}</span></div>))}</div>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5"><div className="flex items-center justify-between mb-4"><h2 className="font-display text-lg font-semibold text-gray-900">Recent Orders</h2><button onClick={() => onNavigate('orders')} className="text-sm text-primary-600 font-medium hover:text-primary-700">View All</button></div>
          <div className="space-y-3">{recentOrders.length === 0 ? <p className="text-sm text-gray-400 text-center py-6">No orders yet</p> : recentOrders.map((order, i) => (<div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><div className="min-w-0"><p className="font-semibold text-sm text-gray-900 truncate">{order.order_number as string}</p><p className="text-xs text-gray-500">{formatDate(order.created_at as string)}</p></div><div className="flex items-center gap-2 shrink-0"><Badge status={order.status as string} /><span className="font-semibold text-primary-700 text-sm">{formatPKR(order.total as number)}</span></div></div>))}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5"><div className="flex items-center justify-between mb-4"><h2 className="font-display text-lg font-semibold text-gray-900">Low Stock Alert</h2><button onClick={() => onNavigate('inventory')} className="text-sm text-primary-600 font-medium hover:text-primary-700">View All</button></div>
          <div className="space-y-3">{lowStock.length === 0 ? <p className="text-sm text-secondary-600 text-center py-6">All products well stocked</p> : lowStock.map((product, i) => (<div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"><img src={getFirstImage(product as Record<string, unknown>)} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" /><div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{product.name as string}</p><p className="text-xs text-gray-500">{formatPKR(product.price as number)}</p></div><span className={`text-sm font-bold ${(product.stock as number) < 10 ? 'text-accent-600' : 'text-amber-600'}`}>{product.stock as number}</span></div>))}</div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-5"><h2 className="font-display text-lg font-semibold text-gray-900 mb-4">Top Products by Stock Value</h2><div className="space-y-2">{topProducts.map((product, i) => (<div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg"><span className="w-6 text-sm font-bold text-gray-400 text-center">{i + 1}</span><img src={getFirstImage(product as Record<string, unknown>)} alt="" className="w-10 h-10 rounded-lg object-cover" /><div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{product.name as string}</p><p className="text-xs text-gray-500">Stock: {product.stock as number} • {formatPKR(product.price as number)}</p></div><span className="font-semibold text-primary-700">{formatPKR((product.price as number) * (product.stock as number))}</span></div>))}</div></div>
    </div>
  );
}
