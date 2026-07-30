import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { formatPKR, getFirstImage } from '../../../lib/utils';
import { useToast } from '../../../components/admin/Toast';
import SearchBar from '../../../components/admin/SearchBar';
import type { Product } from '../../../types';

export default function AdminInventory() {
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const fetch = async () => { setLoading(true); const { data } = await supabase.from('products').select('*, product_images(*)').order('stock', { ascending: true }); if (data) setProducts(data as Product[]); setLoading(false); };
  useEffect(() => { fetch(); }, []);

  const updateStock = async (id: string, stock: number) => { if (stock < 0) return; const { error } = await supabase.from('products').update({ stock }).eq('id', id); if (error) { toast(error.message, 'error'); return; } toast('Stock updated'); };
  const filtered = products.filter(p => (filter === 'all' || (filter === 'low' && p.stock < 20) || (filter === 'out' && p.stock === 0)) && (!search || p.name.toLowerCase().includes(search.toLowerCase())));

  return (
    <div>
      <div className="flex items-center justify-between mb-5"><div className="flex-1 max-w-md"><SearchBar value={search} onChange={setSearch} placeholder="Search products..." /></div><div className="flex items-center gap-2 ml-4">{['all', 'low', 'out'].map(f => (<button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${filter === f ? 'bg-primary-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>{f === 'all' ? 'All' : f === 'low' ? 'Low Stock' : 'Out of Stock'}</button>))}</div></div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">{loading ? <div className="p-12 text-center text-gray-400">Loading...</div> : filtered.length === 0 ? <div className="p-12 text-center text-gray-400">No products found.</div> : (
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase"><th className="px-4 py-3 font-medium">Product</th><th className="px-4 py-3 font-medium">Price</th><th className="px-4 py-3 font-medium">Stock Level</th><th className="px-4 py-3 font-medium">Stock Value</th><th className="px-4 py-3 font-medium">Status</th></tr></thead><tbody>{filtered.map(product => (<tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50"><td className="px-4 py-3"><div className="flex items-center gap-3"><img src={getFirstImage(product)} alt="" className="w-10 h-10 rounded-lg object-cover" /><div><p className="font-medium text-gray-900 truncate max-w-[200px]">{product.name}</p><p className="text-xs text-gray-400">{product.weight}</p></div></div></td><td className="px-4 py-3 font-semibold text-primary-700">{formatPKR(product.sale_price || product.price)}</td><td className="px-4 py-3"><input type="number" defaultValue={product.stock} onBlur={e => updateStock(product.id, parseInt(e.target.value) || 0)} className={`w-20 px-2 py-1.5 border rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 ${product.stock < 10 ? 'border-accent-300 text-accent-700' : product.stock < 20 ? 'border-amber-300 text-amber-700' : 'border-gray-300 text-gray-700'}`} /></td><td className="px-4 py-3 text-gray-600">{formatPKR(product.price * product.stock)}</td><td className="px-4 py-3"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${product.stock === 0 ? 'bg-accent-100 text-accent-700' : product.stock < 10 ? 'bg-accent-100 text-accent-700' : product.stock < 20 ? 'bg-amber-100 text-amber-700' : 'bg-secondary-100 text-secondary-700'}`}>{product.stock === 0 ? 'Out of Stock' : product.stock < 10 ? 'Critical' : product.stock < 20 ? 'Low' : 'Good'}</span></td></tr>))}</tbody></table></div>
      )}</div>
    </div>
  );
}
