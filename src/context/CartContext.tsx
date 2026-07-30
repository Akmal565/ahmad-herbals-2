import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import type { Product, CartItem } from '../types';
import { getEffectivePrice } from '../lib/utils';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  discount: number;
  couponCode: string | null;
  applyCoupon: (code: string, discountAmount: number) => void;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const STORAGE_KEY = 'pkv_cart';
const COUPON_KEY = 'pkv_coupon';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved));
      const savedCoupon = localStorage.getItem(COUPON_KEY);
      if (savedCoupon) { const p = JSON.parse(savedCoupon); setCouponCode(p.code); setDiscount(p.discount); }
    } catch {}
  }, []);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }, [items]);
  useEffect(() => {
    if (couponCode && discount > 0) localStorage.setItem(COUPON_KEY, JSON.stringify({ code: couponCode, discount }));
    else localStorage.removeItem(COUPON_KEY);
  }, [couponCode, discount]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      return [...prev, { product, quantity }];
    });
  }, []);
  const removeFromCart = useCallback((productId: string) => setItems(prev => prev.filter(i => i.product.id !== productId)), []);
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) { setItems(prev => prev.filter(i => i.product.id !== productId)); return; }
    setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity } : i));
  }, []);
  const clearCart = useCallback(() => { setItems([]); setCouponCode(null); setDiscount(0); }, []);
  const applyCoupon = useCallback((code: string, discountAmount: number) => { setCouponCode(code); setDiscount(discountAmount); }, []);
  const removeCoupon = useCallback(() => { setCouponCode(null); setDiscount(0); }, []);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + getEffectivePrice(i.product) * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, subtotal, discount, couponCode, applyCoupon, removeCoupon }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
