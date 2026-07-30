import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { formatPKR, getEffectivePrice, getDiscountPercent, getFirstImage } from '../lib/utils';
import StarRating from './StarRating';
import { useState } from 'react';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const [added, setAdded] = useState(false);
  const discount = getDiscountPercent(product);
  const price = getEffectivePrice(product);
  const image = getFirstImage(product);
  const outOfStock = product.stock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (outOfStock) return;
    addToCart(product, 1); setAdded(true); setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link to={`/product/${product.slug}`} className="card card-hover group flex flex-col h-full">
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <img src={image} alt={product.name} loading="lazy" className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${outOfStock ? 'grayscale opacity-60' : ''}`} />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount > 0 && <span className="badge bg-accent-500 text-white">-{discount}%</span>}
          {product.is_new_arrival && <span className="badge bg-secondary-500 text-white">New</span>}
          {product.is_bestseller && <span className="badge bg-primary-600 text-white">Best Seller</span>}
          {product.is_flash_sale && <span className="badge bg-accent-600 text-white">Flash Sale</span>}
        </div>
        {outOfStock && <div className="absolute inset-0 flex items-center justify-center"><span className="badge bg-gray-900 text-white px-3 py-1 text-sm">{t('outOfStock')}</span></div>}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-gray-500 mb-1">{product.brand} • {product.weight}</p>
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-primary-700">{product.name}</h3>
        <div className="mb-2"><StarRating rating={product.rating} size={14} showNumber reviewCount={product.review_count} /></div>
        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-primary-700">{formatPKR(price)}</span>
            {discount > 0 && <span className="text-xs text-gray-400 line-through">{formatPKR(product.price)}</span>}
          </div>
          <button onClick={handleAddToCart} disabled={outOfStock} className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all active:scale-90 shrink-0 ${added ? 'bg-secondary-500 text-white' : outOfStock ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-primary-600 text-white hover:bg-primary-700'}`}>
            {added ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg> : <ShoppingCart size={18} />}
          </button>
        </div>
      </div>
    </Link>
  );
}
