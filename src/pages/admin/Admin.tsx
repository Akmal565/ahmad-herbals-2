import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users as UsersIcon, BarChart3,
  Tag, FileText, Image, Settings, Boxes, Tags, ArrowUpRight, LogOut,
  Wheat, Menu, X, Activity, Inbox, FolderTree, Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ToastContainer from '../../components/admin/ToastContainer';
import AdminDashboard from './sections/AdminDashboard';
import AdminProducts from './sections/AdminProducts';
import AdminCategories from './sections/AdminCategories';
import AdminOrders from './sections/AdminOrders';
import AdminCustomers from './sections/AdminCustomers';
import AdminInventory from './sections/AdminInventory';

import AdminCoupons from './sections/AdminCoupons';
import AdminBlog from './sections/AdminBlog';
import AdminBanners from './sections/AdminBanners';
import AdminSettings from './sections/AdminSettings';
import AdminActivityLogs from './sections/AdminActivityLogs';
import AdminFormSubmissions from './sections/AdminFormSubmissions';
import AdminMedia from './sections/AdminMedia';
import AdminPages from './sections/AdminPages';
import AdminBlogCategories from './sections/AdminBlogCategories';
import AdminAnalytics from './sections/AdminAnalytics';
import AdminRoles from './sections/AdminRoles';

interface SectionDef {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: string[];
}

const allSections: SectionDef[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'admin', 'editor'] },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['super_admin', 'admin', 'editor'] },
  { id: 'products', label: 'Products', icon: Package, roles: ['super_admin', 'admin', 'editor'] },
  { id: 'categories', label: 'Categories', icon: Tags, roles: ['super_admin', 'admin', 'editor'] },
  { id: 'orders', label: 'Orders', icon: ShoppingCart, roles: ['super_admin', 'admin', 'editor'] },
  { id: 'customers', label: 'Customers', icon: UsersIcon, roles: ['super_admin', 'admin', 'editor'] },
  { id: 'inventory', label: 'Inventory', icon: Boxes, roles: ['super_admin', 'admin', 'editor'] },
  { id: 'coupons', label: 'Coupons', icon: Tag, roles: ['super_admin', 'admin', 'editor'] },
  { id: 'blog', label: 'Blog Posts', icon: FileText, roles: ['super_admin', 'admin', 'editor'] },
  { id: 'blog-categories', label: 'Blog Categories', icon: FolderTree, roles: ['super_admin', 'admin', 'editor'] },
  { id: 'banners', label: 'Banners', icon: Image, roles: ['super_admin', 'admin', 'editor'] },
  { id: 'pages', label: 'Pages', icon: FileText, roles: ['super_admin', 'admin', 'editor'] },
  { id: 'media', label: 'Media Library', icon: Image, roles: ['super_admin', 'admin', 'editor'] },
  { id: 'forms', label: 'Form Submissions', icon: Inbox, roles: ['super_admin', 'admin', 'editor'] },
  { id: 'roles', label: 'Users & Roles', icon: UsersIcon, roles: ['super_admin', 'admin'] },
  { id: 'activity', label: 'Activity Logs', icon: Activity, roles: ['super_admin', 'admin'] },
  { id: 'settings', label: 'Settings', icon: Settings, roles: ['super_admin', 'admin'] },
];

const sectionTitles: Record<string, string> = {
  dashboard: 'Dashboard Overview',
  analytics: 'Analytics & Reports',
  products: 'Product Management',
  categories: 'Category Management',
  orders: 'Order Management',
  customers: 'Customer Management',
  inventory: 'Inventory Management',
  coupons: 'Coupon Management',
  blog: 'Blog Post Management',
  'blog-categories': 'Blog Categories & Tags',
  banners: 'Banner Management',
  pages: 'Page Management',
  media: 'Media Library',
  forms: 'Form Submissions',
  roles: 'Users & Role Management',
  activity: 'Activity Logs',
  settings: 'Website Settings',
};

export default function Admin() {
  const { user, profile, isStaff, role, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/admin/login'); return; }
    if (!isStaff) navigate('/dashboard');
  }, [user, isStaff, authLoading, navigate]);

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && allSections.find(s => s.id === hash)) setActiveSection(hash);
  }, [location.hash]);

  const handleLogout = async () => { await signOut(); navigate('/'); };
  const handleNavigate = (section: string) => { setActiveSection(section); setSidebarOpen(false); };

  if (authLoading || !user || !isStaff) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading admin panel...</div>;
  }

  const sections = allSections.filter(s => s.roles.includes(role || ''));
  const currentRoleConfig: Record<string, { label: string; color: string }> = {
    super_admin: { label: 'Super Admin', color: 'bg-primary-600' },
    admin: { label: 'Admin', color: 'bg-secondary-600' },
    editor: { label: 'Editor', color: 'bg-blue-500' },
  };
  const roleInfo = currentRoleConfig[role || ''] || currentRoleConfig.editor;

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <AdminDashboard onNavigate={handleNavigate} />;
      case 'analytics': return <AdminAnalytics />;
      case 'products': return <AdminProducts />;
      case 'categories': return <AdminCategories />;
      case 'orders': return <AdminOrders />;
      case 'customers': return <AdminCustomers />;
      case 'inventory': return <AdminInventory />;
      case 'coupons': return <AdminCoupons />;
      case 'blog': return <AdminBlog />;
      case 'blog-categories': return <AdminBlogCategories />;
      case 'banners': return <AdminBanners />;
      case 'pages': return <AdminPages />;
      case 'media': return <AdminMedia />;
      case 'forms': return <AdminFormSubmissions />;
      case 'roles': return <AdminRoles />;
      case 'activity': return <AdminActivityLogs />;
      case 'settings': return <AdminSettings />;
      default: return <AdminDashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-primary-950 text-primary-100 flex flex-col z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="px-5 py-5 border-b border-primary-900 flex items-center justify-between">
          <div className="flex items-center gap-2"><div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center"><Wheat className="text-white" size={22} /></div><div><p className="font-display text-base font-bold text-white leading-none">Virsa Admin</p><p className="text-[10px] text-primary-400 mt-0.5">Control Panel</p></div></div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-primary-300 hover:text-white"><X size={20} /></button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {sections.map(s => (<button key={s.id} onClick={() => handleNavigate(s.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeSection === s.id ? 'bg-primary-600 text-white shadow-lg' : 'text-primary-300 hover:bg-primary-900 hover:text-white'}`}><s.icon size={18} />{s.label}</button>))}
        </nav>
        <div className="p-3 border-t border-primary-900 space-y-1">
          <a href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary-300 hover:bg-primary-900 hover:text-white transition-colors"><ArrowUpRight size={18} /> Back to Store</a>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary-300 hover:bg-accent-900/50 hover:text-accent-300 transition-colors"><LogOut size={18} /> Logout</button>
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 lg:px-6 h-16">
            <div className="flex items-center gap-3"><button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100"><Menu size={20} /></button><div><h1 className="font-display text-lg font-bold text-gray-900">{sectionTitles[activeSection]}</h1><p className="text-xs text-gray-400 hidden sm:block">Manage your e-commerce platform</p></div></div>
            <div className="flex items-center gap-3"><div className="hidden sm:flex items-center gap-2"><div className={`w-9 h-9 rounded-full ${roleInfo.color} flex items-center justify-center text-white font-semibold text-sm`}>{profile?.full_name?.charAt(0).toUpperCase() || 'A'}</div><div className="text-right"><p className="text-sm font-semibold text-gray-900">{profile?.full_name || 'Admin'}</p><div className="flex items-center gap-1"><Shield size={10} className="text-gray-400" /><span className="text-xs text-gray-400">{roleInfo.label}</span></div></div></div></div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden"><div className="animate-fade-in">{renderSection()}</div></main>
      </div>
      <ToastContainer />
    </div>
  );
}
