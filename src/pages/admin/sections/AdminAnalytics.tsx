import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, ShoppingCart, Users, Package, BarChart3, PieChart, Activity } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { formatPKR, getFirstImage } from '../../../lib/utils';
import StatCard from '../../../components/admin/StatCard';

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [customers, setCustomers] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [orderRes, prodRes, custRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*, product_images(*)').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*'),
      ]);
      if (orderRes.data) setOrders(orderRes.data.map(o => o as Record<string, unknown>));
      if (prodRes.data) setProducts(prodRes.data.map(p => p as Record<string, unknown>));
      if (custRes.data) setCustomers(custRes.data.map(c => c as Record<string, unknown>));
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="p-12 text-center text-gray-400">Loading analytics...</div>;

  const totalRevenue = orders.reduce((s, o) => s + (o.total as number), 0);
  const totalOrders = orders.length;
  const totalCustomers = customers.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Revenue by month (last 6 months)
  const revenueByMonth: { month: string; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    const monthName = d.toLocaleDateString('en', { month: 'short' });
    const monthRevenue = orders.filter(o => { const od = new Date(o.created_at as string); return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear(); }).reduce((s, o) => s + (o.total as number), 0);
    revenueByMonth.push({ month: monthName, revenue: monthRevenue });
  }
  const maxRevenue = Math.max(...revenueByMonth.map(r => r.revenue), 1);

  // Order status breakdown
  const statusBreakdown: Record<string, number> = {};
  orders.forEach(o => { const st = o.status as string; statusBreakdown[st] = (statusBreakdown[st] || 0) + 1; });
  const statusColors: Record<string, string> = { pending: 'bg-amber-500', confirmed: 'bg-blue-500', processing: 'bg-indigo-500', shipped: 'bg-purple-500', delivered: 'bg-secondary-500', cancelled: 'bg-accent-500', refunded: 'bg-gray-500' };

  // Top products by price*stock
  const topProducts = [...products].sort((a, b) => ((b.price as number) * (b.stock as number)) - ((a.price as number) * (a.stock as number))).slice(0, 5);

  // Customer growth (cumulative by month)
  const customerGrowth: { month: string; count: number }[] = [];
  let cumulative = 0;
  for (let i = 5; i >= 0; i--) {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    const monthName = d.toLocaleDateString('en', { month: 'short' });
    const newThisMonth = customers.filter(c => { const cd = new Date(c.created_at as string); return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear(); }).length;
    cumulative += newThisMonth;
    customerGrowth.push({ month: monthName, count: cumulative });
  }
  const maxCustomers = Math.max(...customerGrowth.map(c => c.count), 1);

  // Payment methods breakdown
  const paymentBreakdown: Record<string, number> = {};
  orders.forEach(o => { const pm = o.payment_method as string; paymentBreakdown[pm] = (paymentBreakdown[pm] || 0) + 1; });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={formatPKR(totalRevenue)} icon={DollarSign as LucideIcon} color="primary" />
        <StatCard label="Total Orders" value={totalOrders} icon={ShoppingCart as LucideIcon} color="secondary" />
        <StatCard label="Avg Order Value" value={formatPKR(avgOrderValue)} icon={TrendingUp as LucideIcon} color="accent" />
        <StatCard label="Total Customers" value={totalCustomers} icon={Users as LucideIcon} color="primary" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4"><BarChart3 className="text-primary-600" size={20} /><h2 className="font-display text-lg font-semibold text-gray-900">Revenue (Last 6 Months)</h2></div>
          <div className="flex items-end justify-between gap-3 h-48">
            {revenueByMonth.map((r, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-gray-50 rounded-t-lg flex items-end justify-center" style={{ height: '160px' }}>
                  <div className="w-full max-w-[60px] bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg transition-all duration-500" style={{ height: `${(r.revenue / maxRevenue) * 100}%`, minHeight: r.revenue > 0 ? '8px' : '2px' }} title={formatPKR(r.revenue)} />
                </div>
                <span className="text-xs text-gray-500 font-medium">{r.month}</span>
                <span className="text-[10px] text-gray-400">{r.revenue > 0 ? formatPKR(r.revenue) : '-'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Growth */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4"><Users className="text-secondary-600" size={20} /><h2 className="font-display text-lg font-semibold text-gray-900">Customer Growth</h2></div>
          <div className="flex items-end justify-between gap-3 h-48">
            {customerGrowth.map((c, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-gray-50 rounded-t-lg flex items-end justify-center" style={{ height: '160px' }}>
                  <div className="w-full max-w-[60px] bg-gradient-to-t from-secondary-600 to-secondary-400 rounded-t-lg transition-all duration-500" style={{ height: `${(c.count / maxCustomers) * 100}%`, minHeight: c.count > 0 ? '8px' : '2px' }} title={`${c.count} customers`} />
                </div>
                <span className="text-xs text-gray-500 font-medium">{c.month}</span>
                <span className="text-[10px] text-gray-400">{c.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Order Status Breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4"><PieChart className="text-accent-600" size={20} /><h2 className="font-display text-lg font-semibold text-gray-900">Order Status</h2></div>
          <div className="space-y-3">
            {Object.entries(statusBreakdown).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${statusColors[status] || 'bg-gray-400'}`} />
                <span className="text-sm text-gray-700 flex-1 capitalize">{status}</span>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
                <span className="text-xs text-gray-400 w-10 text-right">{totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0}%</span>
              </div>
            ))}
            {Object.keys(statusBreakdown).length === 0 && <p className="text-sm text-gray-400 text-center py-4">No orders yet</p>}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4"><Activity className="text-primary-600" size={20} /><h2 className="font-display text-lg font-semibold text-gray-900">Payment Methods</h2></div>
          <div className="space-y-3">
            {Object.entries(paymentBreakdown).map(([method, count]) => (
              <div key={method} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-primary-500" />
                <span className="text-sm text-gray-700 flex-1 uppercase">{method}</span>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
                <span className="text-xs text-gray-400 w-10 text-right">{totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0}%</span>
              </div>
            ))}
            {Object.keys(paymentBreakdown).length === 0 && <p className="text-sm text-gray-400 text-center py-4">No orders yet</p>}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4"><Package className="text-secondary-600" size={20} /><h2 className="font-display text-lg font-semibold text-gray-900">Top Products</h2></div>
          <div className="space-y-2">
            {topProducts.map((p, i) => (
              <div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                <span className="w-5 text-sm font-bold text-gray-400 text-center">{i + 1}</span>
                <img src={getFirstImage(p)} alt="" className="w-8 h-8 rounded-lg object-cover" />
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{p.name as string}</p><p className="text-xs text-gray-400">{formatPKR(p.price as number)}</p></div>
                <span className="text-sm font-semibold text-primary-700">{formatPKR((p.price as number) * (p.stock as number))}</span>
              </div>
            ))}
            {topProducts.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No products yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
