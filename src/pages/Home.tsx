import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight, Truck, ShieldCheck, CreditCard, Leaf, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from '../components/ProductCard';
import StarRating from '../components/StarRating';
import { ProductGridSkeleton } from '../components/Skeletons';
import type { Product, Category, BlogPost } from '../types';

const heroSlides = [
  { title: 'Pure Organic Foods', subtitle: 'From the Heart of Punjab', description: 'Stone-ground flours, premium dry fruits, pure honey & authentic spices — delivered fresh to your door.', image: 'https://images.pexels.com/photos/5234982/pexels-photo-5234982.jpeg', cta: 'Shop Now', link: '/shop' },
  { title: 'Traditional Stone-Grinding', subtitle: 'Chakki Fresh Atta', description: 'Experience the authentic taste of traditionally stone-ground flour, preserving all natural nutrients.', image: 'https://images.pexels.com/photos/6495017/pexels-photo-6495017.jpeg', cta: 'Explore Flours', link: '/shop?category=multi-grain-flour' },
  { title: 'Premium Dry Fruits', subtitle: 'Hand-Picked Quality', description: 'Almonds, cashews, walnuts, pistachios & dates — sourced from the finest orchards.', image: 'https://images.pexels.com/photos/3360358/pexels-photo-3360358.jpeg', cta: 'Shop Dry Fruits', link: '/shop?category=dry-fruits' },
];

export default function Home() {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [flashSale, setFlashSale] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { const timer = setInterval(() => setCurrentSlide(p => (p + 1) % heroSlides.length), 5000); return () => clearInterval(timer); }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [catRes, featRes, flashRes, bestRes, newRes, blogRes] = await Promise.all([
        supabase.from('categories').select('*').eq('is_active', true).order('sort_order').limit(12),
        supabase.from('products').select('*, category:categories(*), product_images(*)').eq('is_active', true).eq('is_featured', true).limit(8),
        supabase.from('products').select('*, category:categories(*), product_images(*)').eq('is_active', true).eq('is_flash_sale', true).limit(4),
        supabase.from('products').select('*, category:categories(*), product_images(*)').eq('is_active', true).eq('is_bestseller', true).limit(8),
        supabase.from('products').select('*, category:categories(*), product_images(*)').eq('is_active', true).eq('is_new_arrival', true).limit(4),
        supabase.from('blog_posts').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(3),
      ]);
      if (catRes.data) setCategories(catRes.data as Category[]);
      if (featRes.data) setFeatured(featRes.data as Product[]);
      if (flashRes.data) setFlashSale(flashRes.data as Product[]);
      if (bestRes.data) setBestSellers(bestRes.data as Product[]);
      if (newRes.data) setNewArrivals(newRes.data as Product[]);
      if (blogRes.data) setBlogPosts(blogRes.data as BlogPost[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="animate-fade-in">
      <section className="relative h-[400px] sm:h-[500px] lg:h-[600px] overflow-hidden bg-primary-950">
        {heroSlides.map((slide, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-950/90 via-primary-950/70 to-transparent z-10" />
            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 z-20 flex items-center"><div className="container-app"><div className="max-w-xl">
              <p className="text-primary-300 text-sm font-semibold uppercase tracking-wider mb-2 animate-slide-up">{slide.subtitle}</p>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 animate-slide-up">{slide.title}</h1>
              <p className="text-primary-100 text-base sm:text-lg mb-6 leading-relaxed max-w-md animate-slide-up">{slide.description}</p>
              <Link to={slide.link} className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-500 transition-all active:scale-95 animate-slide-up">{slide.cta}<ArrowRight size={18} /></Link>
            </div></div></div>
          </div>
        ))}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">{heroSlides.map((_, i) => <button key={i} onClick={() => setCurrentSlide(i)} className={`h-2 rounded-full transition-all ${i === currentSlide ? 'w-8 bg-primary-500' : 'w-2 bg-white/50'}`} />)}</div>
      </section>
      <section className="bg-white border-b border-gray-100"><div className="container-app py-6"><div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[{ icon: Truck, title: t('freeShipping'), desc: t('freeShippingDesc') }, { icon: ShieldCheck, title: t('qualityGuarantee'), desc: t('qualityDesc') }, { icon: CreditCard, title: t('codAvailable'), desc: t('codDesc') }, { icon: Leaf, title: t('securePayment'), desc: t('secureDesc') }].map((f, i) => <div key={i} className="flex items-center gap-3"><div className="w-11 h-11 rounded-lg bg-primary-50 flex items-center justify-center shrink-0"><f.icon className="text-primary-600" size={22} /></div><div><p className="font-semibold text-sm text-gray-900">{f.title}</p><p className="text-xs text-gray-500">{f.desc}</p></div></div>)}
      </div></div></section>
      <section className="py-12 lg:py-16"><div className="container-app"><div className="flex items-center justify-between mb-8"><div><h2 className="font-display text-2xl lg:text-3xl font-bold text-gray-900">{t('categories')}</h2><p className="text-gray-500 text-sm mt-1">Explore our wide range of organic products</p></div><Link to="/shop" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">{t('viewAll')}<ChevronRight size={16} /></Link></div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">{categories.map(cat => <Link key={cat.id} to={`/shop?category=${cat.slug}`} className="group flex flex-col items-center gap-2"><div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-primary-50 border border-primary-100 group-hover:border-primary-300 group-hover:shadow-lg transition-all"><img src={cat.image_url} alt={cat.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" /></div><p className="text-xs sm:text-sm font-medium text-gray-700 text-center group-hover:text-primary-700 line-clamp-2">{cat.name}</p></Link>)}</div>
      </div></section>
      {flashSale.length > 0 && <section className="py-8 bg-gradient-to-r from-accent-50 to-primary-50"><div className="container-app"><div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 rounded-lg bg-accent-500 flex items-center justify-center"><Clock className="text-white" size={22} /></div><div><h2 className="font-display text-2xl font-bold text-gray-900">{t('flashSale')}</h2><p className="text-sm text-accent-700">Limited time offers — Hurry up!</p></div></div>{loading ? <ProductGridSkeleton count={4} /> : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{flashSale.map(p => <ProductCard key={p.id} product={p} />)}</div>}</div></section>}
      <section className="py-12 lg:py-16"><div className="container-app"><div className="flex items-center justify-between mb-8"><div><h2 className="font-display text-2xl lg:text-3xl font-bold text-gray-900">{t('featured')}</h2><p className="text-gray-500 text-sm mt-1">Handpicked products just for you</p></div><Link to="/shop" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">{t('viewAll')}<ChevronRight size={16} /></Link></div>{loading ? <ProductGridSkeleton count={8} /> : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{featured.map(p => <ProductCard key={p.id} product={p} />)}</div>}</div></section>
      <section className="py-8"><div className="container-app"><div className="relative rounded-2xl overflow-hidden bg-primary-950 h-64 flex items-center"><img src="https://images.pexels.com/photos/33260/honey-sweet-syrup-organic.jpg" alt="Pure Honey" className="absolute inset-0 w-full h-full object-cover opacity-40" /><div className="relative z-10 container-app"><div className="max-w-md"><p className="text-primary-300 text-sm font-semibold uppercase tracking-wider mb-2">Pure & Natural</p><h2 className="font-display text-3xl font-bold text-white mb-3">100% Organic Honey</h2><p className="text-primary-100 mb-4">Raw, unprocessed honey from local beekeepers. Rich in natural enzymes and antioxidants.</p><Link to="/shop?category=honey-natural-sweeteners" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-500 transition-all active:scale-95">Shop Honey<ArrowRight size={16} /></Link></div></div></div></div></section>
      <section className="py-12 lg:py-16 bg-gray-50"><div className="container-app"><div className="flex items-center justify-between mb-8"><div><h2 className="font-display text-2xl lg:text-3xl font-bold text-gray-900">{t('bestSellers')}</h2><p className="text-gray-500 text-sm mt-1">Our most popular products</p></div><Link to="/shop" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">{t('viewAll')}<ChevronRight size={16} /></Link></div>{loading ? <ProductGridSkeleton count={8} /> : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{bestSellers.map(p => <ProductCard key={p.id} product={p} />)}</div>}</div></section>
      {newArrivals.length > 0 && <section className="py-12 lg:py-16"><div className="container-app"><div className="flex items-center justify-between mb-8"><div><h2 className="font-display text-2xl lg:text-3xl font-bold text-gray-900">{t('newArrivals')}</h2><p className="text-gray-500 text-sm mt-1">Fresh stock just arrived</p></div><Link to="/shop" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">{t('viewAll')}<ChevronRight size={16} /></Link></div><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{newArrivals.map(p => <ProductCard key={p.id} product={p} />)}</div></div></section>}
      <section className="py-12 lg:py-16 bg-primary-50"><div className="container-app"><h2 className="font-display text-2xl lg:text-3xl font-bold text-gray-900 text-center mb-2">{t('reviews')}</h2><p className="text-gray-500 text-sm text-center mb-8">What our customers say about us</p><div className="grid grid-cols-1 sm:grid-cols-3 gap-6">{[{ name: 'Ahmed Raza', city: 'Lahore', rating: 5, text: 'The multi grain atta is excellent quality. Rotis come out soft and tasty. Fast delivery too!' }, { name: 'Fatima Khan', city: 'Islamabad', rating: 5, text: 'Pure organic honey, exactly as described. Best quality I have found online in Pakistan.' }, { name: 'Bilal Ahmed', city: 'Karachi', rating: 4, text: 'Great dry fruits at reasonable prices. Almonds were fresh and crunchy. Will order again.' }].map((rev, i) => <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"><StarRating rating={rev.rating} size={18} /><p className="text-gray-700 mt-3 mb-4 leading-relaxed text-sm">"{rev.text}"</p><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">{rev.name.charAt(0)}</div><div><p className="font-semibold text-sm text-gray-900">{rev.name}</p><p className="text-xs text-gray-500">{rev.city}</p></div></div></div>)}</div></div></section>
      {blogPosts.length > 0 && <section className="py-12 lg:py-16"><div className="container-app"><div className="flex items-center justify-between mb-8"><div><h2 className="font-display text-2xl lg:text-3xl font-bold text-gray-900">From Our Blog</h2><p className="text-gray-500 text-sm mt-1">Tips, guides, and stories about healthy living</p></div><Link to="/blog" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">{t('viewAll')}<ChevronRight size={16} /></Link></div><div className="grid grid-cols-1 sm:grid-cols-3 gap-6">{blogPosts.map(post => <Link key={post.id} to={`/blog/${post.slug}`} className="card card-hover group"><div className="aspect-[16/10] overflow-hidden bg-gray-50"><img src={post.image_url} alt={post.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div><div className="p-5"><span className="badge bg-secondary-100 text-secondary-700 mb-2">{post.category}</span><h3 className="font-display text-lg font-semibold text-gray-900 group-hover:text-primary-700 line-clamp-2 mb-2">{post.title}</h3><p className="text-sm text-gray-500 line-clamp-2">{post.excerpt}</p></div></Link>)}</div></div></section>}
    </div>
  );
}
