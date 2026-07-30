import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Home as HomeIcon, ShoppingCart, Heart, Minus, Plus, Truck, ShieldCheck, RefreshCw, Check, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { formatPKR, getEffectivePrice, getDiscountPercent, getFirstImage } from '../lib/utils';
import StarRating from '../components/StarRating';
import ProductCard from '../components/ProductCard';
import type { Product, Review } from '../types';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'benefits' | 'howToUse' | 'reviews'>('description');
  const [added, setAdded] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', body: '' });
  const REVIEW_RATING = 5;
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (!slug) return;
      const { data: prod } = await supabase.from('products').select('*, category:categories(*), product_images(*)').eq('slug', slug).maybeSingle();
      if (prod) {
        setProduct(prod as Product);
        const { data: rel } = await supabase.from('products').select('*, category:categories(*), product_images(*)').eq('is_active', true).neq('id', prod.id).limit(4);
        if (rel) setRelated(rel as Product[]);
        const { data: revs } = await supabase.from('reviews').select('*').eq('product_id', prod.id).eq('is_approved', true).order('created_at', { ascending: false });
        if (revs) setReviews(revs as Review[]);
      }
      setLoading(false);
    })();
  }, [slug]);

  const handleAddToCart = () => { if (!product || product.stock <= 0) return; addToCart(product, quantity); setAdded(true); setTimeout(() => setAdded(false), 2000); };
  const handleBuyNow = () => { if (!product || product.stock <= 0) return; addToCart(product, quantity); window.location.href = '/cart'; };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    if (!user) { setReviewError('Please login to write a review.'); return; }
    if (!product || !newReview.body.trim()) { setReviewError('Please write your review.'); return; }
    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
    const { error } = await supabase.from('reviews').insert({ product_id: product.id, user_id: user.id, user_name: profile?.full_name || user.email, rating: REVIEW_RATING, title: newReview.title, body: newReview.body });
    if (error) { setReviewError(error.message); return; }
    setReviewSuccess(true); setNewReview({ rating: REVIEW_RATING, title: '', body: '' });
    const { data: revs } = await supabase.from('reviews').select('*').eq('product_id', product.id).eq('is_approved', true).order('created_at', { ascending: false });
    if (revs) setReviews(revs as Review[]);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  if (loading) return <div className="container-app py-12"><div className="grid lg:grid-cols-2 gap-8"><div className="aspect-square skeleton rounded-xl" /><div className="space-y-4"><div className="h-8 w-3/4 skeleton rounded" /><div className="h-6 w-1/4 skeleton rounded" /><div className="h-4 w-full skeleton rounded" /><div className="h-4 w-full skeleton rounded" /><div className="h-12 w-full skeleton rounded-lg" /></div></div></div>;
  if (!product) return <div className="container-app py-20 text-center"><h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1><p className="text-gray-500 mb-4">The product you are looking for does not exist.</p><Link to="/shop" className="btn-primary">Back to Shop</Link></div>;

  const price = getEffectivePrice(product);
  const discount = getDiscountPercent(product);
  const images = product.product_images || [];
  const outOfStock = product.stock <= 0;
  const tabs = [{ id: 'description' as const, label: t('description') }, { id: 'ingredients' as const, label: t('ingredients') }, { id: 'benefits' as const, label: t('benefits') }, { id: 'howToUse' as const, label: t('howToUse') }, { id: 'reviews' as const, label: `${t('reviews')} (${reviews.length})` }];

  return (
    <div className="animate-fade-in">
      <div className="bg-gray-50 border-b border-gray-100"><div className="container-app py-3"><div className="flex items-center gap-1.5 text-sm text-gray-500 overflow-x-auto scrollbar-hide"><Link to="/" className="hover:text-primary-600 flex items-center gap-1 shrink-0"><HomeIcon size={14} /> {t('home')}</Link><ChevronRight size={14} className="shrink-0" /><Link to="/shop" className="hover:text-primary-600 shrink-0">{t('shop')}</Link>{product.category && <><ChevronRight size={14} className="shrink-0" /><Link to={`/shop?category=${product.category.slug}`} className="hover:text-primary-600 shrink-0">{product.category.name}</Link></>}<ChevronRight size={14} className="shrink-0" /><span className="text-gray-900 font-medium truncate">{product.name}</span></div></div></div>
      <div className="container-app py-6 lg:py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div><div className="aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100 mb-4"><img src={images[selectedImage]?.image_url || getFirstImage(product)} alt={product.name} className="w-full h-full object-cover" /></div>{images.length > 1 && <div className="flex gap-2 overflow-x-auto scrollbar-hide">{images.map((img, i) => <button key={img.id} onClick={() => setSelectedImage(i)} className={`w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 ${i === selectedImage ? 'border-primary-600' : 'border-gray-200 hover:border-primary-300'}`}><img src={img.image_url} alt={img.alt_text} className="w-full h-full object-cover" /></button>)}</div>}</div>
          <div className="flex flex-col">
            <div className="flex flex-wrap gap-1.5 mb-2">{product.is_bestseller && <span className="badge bg-primary-100 text-primary-700">{t('bestSellers')}</span>}{product.is_new_arrival && <span className="badge bg-secondary-100 text-secondary-700">New</span>}{product.is_flash_sale && <span className="badge bg-accent-100 text-accent-700">{t('flashSale')}</span>}</div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center gap-3 mb-4"><StarRating rating={product.rating} size={18} showNumber reviewCount={product.review_count} /><span className="text-gray-300">|</span><span className={`text-sm font-medium ${outOfStock ? 'text-accent-600' : 'text-secondary-600'}`}>{outOfStock ? t('outOfStock') : t('inStock')}</span></div>
            <div className="flex items-baseline gap-3 mb-4"><span className="text-3xl font-bold text-primary-700">{formatPKR(price)}</span>{discount > 0 && <><span className="text-lg text-gray-400 line-through">{formatPKR(product.price)}</span><span className="badge bg-accent-500 text-white">Save {discount}%</span></>}</div>
            <p className="text-gray-600 leading-relaxed mb-6">{product.short_description}</p>
            <div className="grid grid-cols-2 gap-3 mb-6 text-sm"><div className="flex items-center gap-2"><span className="text-gray-400">{t('weight')}:</span><span className="font-medium text-gray-900">{product.weight}</span></div><div className="flex items-center gap-2"><span className="text-gray-400">{t('sku')}:</span><span className="font-medium text-gray-900">{product.sku}</span></div><div className="flex items-center gap-2"><span className="text-gray-400">{t('brand')}:</span><span className="font-medium text-gray-900">{product.brand}</span></div><div className="flex items-center gap-2"><span className="text-gray-400">{t('quantity')}:</span><span className="font-medium text-gray-900">{product.stock} available</span></div></div>
            <div className="flex items-center gap-3 mb-4"><div className="flex items-center border border-gray-300 rounded-lg"><button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-11 flex items-center justify-center hover:bg-gray-50 rounded-l-lg" disabled={outOfStock}><Minus size={16} /></button><span className="w-12 text-center font-semibold">{quantity}</span><button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="w-10 h-11 flex items-center justify-center hover:bg-gray-50 rounded-r-lg" disabled={outOfStock}><Plus size={16} /></button></div><button onClick={handleAddToCart} disabled={outOfStock} className={`flex-1 ${added ? 'bg-secondary-500' : 'btn-primary'} disabled:opacity-50 disabled:cursor-not-allowed`}>{added ? <><Check size={18} /> Added!</> : <><ShoppingCart size={18} /> {t('addToCart')}</>}</button><button className="w-11 h-11 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 shrink-0" aria-label="Wishlist"><Heart size={18} className="text-gray-600" /></button></div>
            <button onClick={handleBuyNow} disabled={outOfStock} className="btn-accent w-full mb-6 disabled:opacity-50 disabled:cursor-not-allowed">{t('buyNow')}</button>
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100"><div className="flex flex-col items-center text-center gap-1"><Truck className="text-primary-600" size={20} /><span className="text-xs text-gray-600">{t('freeShipping')}</span></div><div className="flex flex-col items-center text-center gap-1"><ShieldCheck className="text-primary-600" size={20} /><span className="text-xs text-gray-600">{t('qualityGuarantee')}</span></div><div className="flex flex-col items-center text-center gap-1"><RefreshCw className="text-primary-600" size={20} /><span className="text-xs text-gray-600">Easy Returns</span></div></div>
          </div>
        </div>
        <div className="mt-12"><div className="flex items-center gap-1 border-b border-gray-200 overflow-x-auto scrollbar-hide mb-6">{tabs.map(tab => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{tab.label}</button>)}</div>
          <div className="prose max-w-none">
            {activeTab === 'description' && <p className="text-gray-700 leading-relaxed">{product.description}</p>}
            {activeTab === 'ingredients' && <p className="text-gray-700 leading-relaxed">{product.ingredients || 'No ingredients information available.'}</p>}
            {activeTab === 'benefits' && <p className="text-gray-700 leading-relaxed">{product.benefits || 'No benefits information available.'}</p>}
            {activeTab === 'howToUse' && <p className="text-gray-700 leading-relaxed">{product.how_to_use || 'No usage information available.'}</p>}
            {activeTab === 'reviews' && (<div className="space-y-6"><div className="bg-gray-50 rounded-xl p-5"><h3 className="font-display text-lg font-semibold mb-4">Write a Review</h3>{reviewSuccess && <div className="mb-3 p-3 bg-secondary-50 text-secondary-700 rounded-lg text-sm">Review submitted successfully!</div>}{reviewError && <div className="mb-3 p-3 bg-accent-50 text-accent-700 rounded-lg text-sm">{reviewError}</div>}<form onSubmit={handleReviewSubmit} className="space-y-3"><div><label className="block text-sm font-medium text-gray-700 mb-1">Rating</label><div className="flex items-center gap-1">{[1,2,3,4,5].map(i => <Star key={i} size={24} className={i <= REVIEW_RATING ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'} />)}</div><p className="text-xs text-gray-500 mt-1">All reviews are rated 5 stars</p></div><input type="text" placeholder="Review title" value={newReview.title} onChange={e => setNewReview(r => ({ ...r, title: e.target.value }))} className="input-field" /><textarea placeholder="Write your review here..." value={newReview.body} onChange={e => setNewReview(r => ({ ...r, body: e.target.value }))} rows={4} className="input-field resize-none" /><button type="submit" className="btn-primary">Submit Review</button></form></div><div className="space-y-4">{reviews.length === 0 ? <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p> : reviews.map(rev => <div key={rev.id} className="bg-white border border-gray-100 rounded-xl p-5"><div className="flex items-center justify-between mb-2"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">{rev.user_name.charAt(0)}</div><div><p className="font-semibold text-sm text-gray-900">{rev.user_name}</p><StarRating rating={rev.rating} size={14} /></div></div><span className="text-xs text-gray-400">{new Date(rev.created_at).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>{rev.title && <p className="font-semibold text-sm text-gray-800 mb-1">{rev.title}</p>}<p className="text-sm text-gray-600">{rev.body}</p></div>)}</div></div>)}
          </div>
        </div>
        {related.length > 0 && <div className="mt-16"><h2 className="font-display text-2xl font-bold text-gray-900 mb-6">{t('relatedProducts')}</h2><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{related.map(p => <ProductCard key={p.id} product={p} />)}</div></div>}
      </div>
    </div>
  );
}
