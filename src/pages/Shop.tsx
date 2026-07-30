import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronRight, Home as HomeIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeletons';
import type { Product, Category } from '../types';

const ITEMS_PER_PAGE = 12;

export default function Shop() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const searchQuery = searchParams.get('search') || '';
  const categorySlug = searchParams.get('category') || '';
  const sortBy = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const inStockOnly = searchParams.get('inStock') === 'true';

  useEffect(() => { (async () => { const { data } = await supabase.from('categories').select('*').eq('is_active', true).order('sort_order'); if (data) setCategories(data as Category[]); })(); }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('products').select('*, category:categories(*), product_images(*)', { count: 'exact' }).eq('is_active', true);
    if (categorySlug) { const cat = categories.find(c => c.slug === categorySlug); if (cat) query = query.eq('category_id', cat.id); }
    if (searchQuery) query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,short_description.ilike.%${searchQuery}%`);
    if (minPrice) query = query.gte('price', parseFloat(minPrice));
    if (maxPrice) query = query.lte('price', parseFloat(maxPrice));
    if (inStockOnly) query = query.gt('stock', 0);
    switch (sortBy) {
      case 'price-low': query = query.order('sale_price', { ascending: true, nullsFirst: false }); break;
      case 'price-high': query = query.order('sale_price', { ascending: false, nullsFirst: false }); break;
      case 'name-az': query = query.order('name', { ascending: true }); break;
      default: query = query.order('created_at', { ascending: false });
    }
    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    query = query.range(from, from + ITEMS_PER_PAGE - 1);
    const { data, count, error } = await query;
    if (error) console.error('Shop fetch error:', error);
    if (data) setProducts(data as Product[]);
    if (count !== null) setTotalCount(count);
    setLoading(false);
  }, [categorySlug, searchQuery, sortBy, minPrice, maxPrice, inStockOnly, currentPage, categories]);

  useEffect(() => { if (categories.length > 0 || !categorySlug) fetchProducts(); }, [fetchProducts, categories.length, categorySlug]);
  useEffect(() => { setCurrentPage(1); }, [categorySlug, searchQuery, sortBy, minPrice, maxPrice, inStockOnly]);

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (!value) params.delete(key); else params.set(key, value);
    setSearchParams(params);
  };
  const clearFilters = () => setSearchParams(new URLSearchParams());
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const currentCategory = categories.find(c => c.slug === categorySlug);

  const FilterContent = () => (
    <div className="space-y-6">
      <div><h3 className="font-semibold text-sm text-gray-900 mb-3">{t('categories')}</h3><div className="space-y-1.5"><button onClick={() => updateParam('category', null)} className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm ${!categorySlug ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>{t('all')}</button>{categories.map(cat => <button key={cat.id} onClick={() => updateParam('category', cat.slug)} className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm ${categorySlug === cat.slug ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>{cat.name}</button>)}</div></div>
      <div><h3 className="font-semibold text-sm text-gray-900 mb-3">{t('priceRange')}</h3><div className="flex items-center gap-2"><input type="number" placeholder="Min" value={minPrice} onChange={e => updateParam('minPrice', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500" /><span className="text-gray-400">-</span><input type="number" placeholder="Max" value={maxPrice} onChange={e => updateParam('maxPrice', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500" /></div></div>
      <div><h3 className="font-semibold text-sm text-gray-900 mb-3">{t('availability')}</h3><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={inStockOnly} onChange={e => updateParam('inStock', e.target.checked ? 'true' : null)} className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" /><span className="text-sm text-gray-600">{t('inStockOnly')}</span></label></div>
      <button onClick={clearFilters} className="w-full btn-outline text-sm py-2">{t('clearFilters')}</button>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="bg-gray-50 border-b border-gray-100"><div className="container-app py-3"><div className="flex items-center gap-1.5 text-sm text-gray-500"><Link to="/" className="hover:text-primary-600 flex items-center gap-1"><HomeIcon size={14} /> {t('home')}</Link><ChevronRight size={14} /><span className="text-gray-900 font-medium">{t('shop')}</span>{currentCategory && <><ChevronRight size={14} /><span className="text-primary-600 font-medium">{currentCategory.name}</span></>}</div></div></div>
      <div className="container-app py-6 lg:py-8">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="font-display text-2xl lg:text-3xl font-bold text-gray-900">{currentCategory ? currentCategory.name : t('shop')}</h1>{searchQuery && <p className="text-sm text-gray-500 mt-1">Search: "{searchQuery}"</p>}</div>
          <div className="flex items-center gap-3"><select value={sortBy} onChange={e => updateParam('sort', e.target.value)} className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"><option value="newest">{t('newest')}</option><option value="price-low">{t('priceLowHigh')}</option><option value="price-high">{t('priceHighLow')}</option><option value="name-az">{t('nameAZ')}</option></select><button onClick={() => setShowFilters(true)} className="lg:hidden flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg"><SlidersHorizontal size={16} /> {t('filterBy')}</button></div>
        </div>
        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 shrink-0"><div className="sticky top-24"><div className="bg-white rounded-xl border border-gray-100 p-5"><h2 className="font-display text-lg font-semibold mb-4">{t('filterBy')}</h2><FilterContent /></div></div></aside>
          <div className="flex-1 min-w-0">
            {loading ? <ProductGridSkeleton count={12} /> : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center"><div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4"><SlidersHorizontal className="text-gray-400" size={28} /></div><h3 className="font-display text-lg font-semibold text-gray-900 mb-1">{t('noProducts')}</h3><p className="text-sm text-gray-500 mb-4">Try adjusting your filters or search terms.</p><button onClick={clearFilters} className="btn-primary">{t('clearFilters')}</button></div>
            ) : (<><p className="text-sm text-gray-500 mb-4">{t('showing')} {products.length} {t('of')} {totalCount} {t('results')}</p><div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">{products.map(p => <ProductCard key={p.id} product={p} />)}</div>{totalPages > 1 && <div className="flex items-center justify-center gap-2 mt-8"><button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">Previous</button>{Array.from({ length: totalPages }).slice(0, 5).map((_, i) => { const page = i + 1; return <button key={page} onClick={() => setCurrentPage(page)} className={`w-9 h-9 rounded-lg text-sm font-medium ${page === currentPage ? 'bg-primary-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}>{page}</button>; })}<button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button></div>}</>)}
          </div>
        </div>
      </div>
      {showFilters && <div className="lg:hidden fixed inset-0 z-50"><div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={() => setShowFilters(false)} /><div className="absolute left-0 top-0 bottom-0 w-72 bg-white overflow-y-auto animate-slide-down"><div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10"><h2 className="font-display text-lg font-semibold">{t('filterBy')}</h2><button onClick={() => setShowFilters(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={20} /></button></div><div className="p-4"><FilterContent /></div></div></div>}
    </div>
  );
}
