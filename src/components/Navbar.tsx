import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X, Globe, ChevronDown, Wheat } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';
import type { Category } from '../types';

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, profile, isAdmin, signOut } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catDropdown, setCatDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const catTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { (async () => { const { data } = await supabase.from('categories').select('*').eq('is_active', true).order('sort_order'); if (data) setCategories(data as Category[]); })(); }, []);
  useEffect(() => { setMobileOpen(false); setSearchOpen(false); setUserDropdown(false); }, [location.pathname]);
  useEffect(() => { if (searchOpen && searchRef.current) searchRef.current.focus(); }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); if (searchQuery.trim()) { navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`); setSearchOpen(false); setSearchQuery(''); } };
  const showCat = () => { if (catTimer.current) clearTimeout(catTimer.current); setCatDropdown(true); };
  const hideCat = () => { catTimer.current = setTimeout(() => setCatDropdown(false), 200); };
  const navLinkClass = (path: string) => `text-sm font-medium transition-colors hover:text-primary-600 ${location.pathname === path ? 'text-primary-600' : 'text-gray-700'}`;
  const handleLogout = async () => { await signOut(); navigate('/'); };

  return (
    <>
      <div className="bg-primary-950 text-primary-100 text-xs"><div className="container-app flex items-center justify-between h-9">
        <p className="hidden sm:block">{t('freeShipping')} • {t('codAvailable')} • {t('qualityGuarantee')}</p>
        <div className="flex items-center gap-4 ms-auto">
          <button onClick={() => setLang(lang === 'en' ? 'ur' : 'en')} className="flex items-center gap-1 hover:text-white"><Globe size={14} />{lang === 'en' ? 'اردو' : 'English'}</button>
          {user ? <Link to="/dashboard" className="hover:text-white">{t('dashboard')}</Link> : <Link to="/login" className="hover:text-white">{t('login')}</Link>}
        </div>
      </div></div>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm"><div className="container-app"><div className="flex items-center justify-between h-16 gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0"><div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center"><Wheat className="text-white" size={22} /></div><div className="hidden sm:block"><span className="font-display text-xl font-bold text-primary-800 leading-none block">Ahmad Herbals</span><span className="text-[10px] text-gray-500">Organic & Traditional Foods</span></div></Link>
        <nav className="hidden lg:flex items-center gap-6">
          <Link to="/" className={navLinkClass('/')}>{t('home')}</Link>
          <div className="relative" onMouseEnter={showCat} onMouseLeave={hideCat}>
            <button className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-primary-600">{t('categories')}<ChevronDown size={16} /></button>
            {catDropdown && <div className="absolute top-full left-0 pt-2 z-50"><div className="w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-slide-down"><Link to="/shop" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700">{t('all')} {t('categories')}</Link>{categories.map(cat => <Link key={cat.id} to={`/shop?category=${cat.slug}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700">{cat.name}</Link>)}</div></div>}
          </div>
          <Link to="/shop" className={navLinkClass('/shop')}>{t('shop')}</Link>
          <Link to="/blog" className={navLinkClass('/blog')}>{t('blog')}</Link>
          <Link to="/about" className={navLinkClass('/about')}>{t('about')}</Link>
          <Link to="/contact" className={navLinkClass('/contact')}>{t('contact')}</Link>
        </nav>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Search"><Search size={20} className="text-gray-700" /></button>
          <Link to="/dashboard?tab=wishlist" className="p-2 rounded-lg hover:bg-gray-100" aria-label="Wishlist"><Heart size={20} className="text-gray-700" /></Link>
          <Link to="/cart" className="p-2 rounded-lg hover:bg-gray-100 relative" aria-label="Cart"><ShoppingCart size={20} className="text-gray-700" />{totalItems > 0 && <span className="absolute -top-0.5 -right-0.5 bg-accent-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{totalItems}</span>}</Link>
          {user ? (
            <div className="relative hidden sm:block" onMouseEnter={() => setUserDropdown(true)} onMouseLeave={() => setTimeout(() => setUserDropdown(false), 200)}>
              <button className="p-2 rounded-lg hover:bg-gray-100"><User size={20} className="text-gray-700" /></button>
              {userDropdown && <div className="absolute top-full right-0 pt-2 z-50"><div className="w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-slide-down">
                <div className="px-4 py-2 border-b border-gray-100"><p className="text-sm font-semibold text-gray-900 truncate">{profile?.full_name || 'User'}</p><p className="text-xs text-gray-500 truncate">{user.email}</p></div>
                <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700">{t('dashboard')}</Link>
                <Link to="/dashboard?tab=orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700">{t('myOrders')}</Link>
                {isAdmin && <Link to="/admin" className="block px-4 py-2 text-sm text-primary-700 font-semibold hover:bg-primary-50">{t('adminPanel')}</Link>}
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 border-t border-gray-100">{t('logout')}</button>
              </div></div>}
            </div>
          ) : <Link to="/login" className="hidden sm:block p-2 rounded-lg hover:bg-gray-100"><User size={20} className="text-gray-700" /></Link>}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100" aria-label="Menu">{mobileOpen ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </div>
      {searchOpen && <div className="py-3 border-t border-gray-100 animate-slide-down"><form onSubmit={handleSearch} className="flex gap-2"><input ref={searchRef} type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t('search')} className="input-field flex-1" /><button type="submit" className="btn-primary px-4"><Search size={18} /></button></form></div>}
      </div>
      {mobileOpen && <div className="lg:hidden border-t border-gray-100 bg-white animate-slide-down max-h-[80vh] overflow-y-auto"><nav className="container-app py-4 flex flex-col gap-1">
        <Link to="/" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-700 font-medium">{t('home')}</Link>
        <Link to="/shop" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-700 font-medium">{t('shop')}</Link>
        <Link to="/blog" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-700 font-medium">{t('blog')}</Link>
        <Link to="/about" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-700 font-medium">{t('about')}</Link>
        <Link to="/contact" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-700 font-medium">{t('contact')}</Link>
        <div className="border-t border-gray-100 mt-2 pt-2"><p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase">{t('categories')}</p>{categories.map(cat => <Link key={cat.id} to={`/shop?category=${cat.slug}`} className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700">{cat.name}</Link>)}</div>
        {user ? <><Link to="/dashboard" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-700 font-medium border-t border-gray-100 mt-2 pt-3">{t('dashboard')}</Link>{isAdmin && <Link to="/admin" className="px-3 py-2 rounded-lg text-primary-700 hover:bg-primary-50 font-semibold">{t('adminPanel')}</Link>}<button onClick={handleLogout} className="px-3 py-2 rounded-lg text-gray-700 hover:bg-primary-50 font-medium text-left">{t('logout')}</button></> : <Link to="/login" className="btn-primary mt-2">{t('login')} / {t('signup')}</Link>}
      </nav></div>}
      </header>
    </>
  );
}
