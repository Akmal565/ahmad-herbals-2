import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Lang = 'en' | 'ur';

interface LanguageContextType {
  lang: Lang; setLang: (lang: Lang) => void; t: (key: string) => string; dir: 'ltr' | 'rtl';
}

const translations: Record<Lang, Record<string, string>> = {
  en: {
    home:'Home', shop:'Shop', blog:'Blog', about:'About', contact:'Contact', cart:'Cart', wishlist:'Wishlist',
    account:'Account', login:'Login', signup:'Sign Up', logout:'Logout', search:'Search products...',
    addToCart:'Add to Cart', buyNow:'Buy Now', viewAll:'View All', featured:'Featured Products',
    bestSellers:'Best Sellers', newArrivals:'New Arrivals', flashSale:'Flash Sale', categories:'Categories',
    reviews:'Customer Reviews', newsletter:'Newsletter', quickLinks:'Quick Links', customerService:'Customer Service',
    allRightsReserved:'All Rights Reserved', freeShipping:'Free Shipping', freeShippingDesc:'On orders above Rs. 8000',
    codAvailable:'Cash on Delivery', codDesc:'Pay when you receive', qualityGuarantee:'100% Organic',
    qualityDesc:'Premium quality products', securePayment:'Secure Payment', secureDesc:'Your data is protected',
    proceedCheckout:'Proceed to Checkout', orderSummary:'Order Summary', subtotal:'Subtotal', shipping:'Shipping',
    discount:'Discount', total:'Total', couponCode:'Coupon Code', applyCoupon:'Apply', emptyCart:'Your cart is empty',
    continueShopping:'Continue Shopping', productDetails:'Product Details', description:'Description',
    ingredients:'Ingredients', benefits:'Benefits', howToUse:'How to Use', relatedProducts:'Related Products',
    inStock:'In Stock', outOfStock:'Out of Stock', quantity:'Quantity', weight:'Weight', sku:'SKU',
    dashboard:'Dashboard', myOrders:'My Orders', myProfile:'My Profile', addresses:'Addresses',
    adminPanel:'Admin Panel', noProducts:'No products found', sortBy:'Sort By',
    priceLowHigh:'Price: Low to High', priceHighLow:'Price: High to Low', nameAZ:'Name: A to Z',
    newest:'Newest First', filterBy:'Filter By', priceRange:'Price Range', availability:'Availability',
    brand:'Brand', all:'All', inStockOnly:'In Stock Only', clearFilters:'Clear Filters',
    showing:'Showing', results:'results', of:'of', followUs:'Follow Us',
  },
  ur: {
    home:'ہوم', shop:'شاپ', blog:'بلاگ', about:'ہمارے بارے میں', contact:'رابطہ', cart:'کارٹ', wishlist:'پسندیدہ',
    account:'اکاؤنٹ', login:'لاگ ان', signup:'سائن اپ', logout:'لاگ آؤٹ', search:'پروڈکٹس تلاش کریں...',
    addToCart:'کارٹ میں شامل کریں', buyNow:'ابھی خریدیں', viewAll:'سب دیکھیں', featured:'نمایاں پروڈکٹس',
    bestSellers:'بہترین فروخت', newArrivals:'نئی آمد', flashSale:'فلیش سیل', categories:'کیٹگریز',
    reviews:'گاہکوں کی رائے', newsletter:'نیوز لیٹر', quickLinks:'فوری لنکس', customerService:'گاہک خدمت',
    allRightsReserved:'جملہ حقوق محفوظ ہیں', freeShipping:'مفت ترسیل', freeShippingDesc:'روپے 8000 سے زیادہ آرڈر پر',
    codAvailable:'ڈلیوری پر نقد ادائیگی', codDesc:'وصول کرتے وقت ادائیگی کریں', qualityGuarantee:'100% نامیاتی',
    qualityDesc:'پریمیم معیار کی پروڈکٹس', securePayment:'محفوظ ادائیگی', secureDesc:'آپ کا ڈیٹا محفوظ ہے',
    proceedCheckout:'چیک آؤٹ پر جائیں', orderSummary:'آرڈر کا خلاصہ', subtotal:'ذیلی جوڑ', shipping:'ترسیل',
    discount:'رعایت', total:'کل', couponCode:'کوپن کوڈ', applyCoupon:'لگائیں', emptyCart:'آپ کا کارٹ خالی ہے',
    continueShopping:'خریداری جاری رکھیں', productDetails:'پروڈکٹ کی تفصیلات', description:'تفصیل',
    ingredients:'اجزاء', benefits:'فوائد', howToUse:'استعمال کا طریقہ', relatedProducts:'متعلقہ پروڈکٹس',
    inStock:'دستیاب', outOfStock:'ناموجود', quantity:'مقدار', weight:'وزن', sku:'SKU',
    dashboard:'ڈیش بورڈ', myOrders:'میرے آرڈرز', myProfile:'میری پروفائل', addresses:'پتے',
    adminPanel:'ایڈمن پینل', noProducts:'کوئی پروڈکٹ نہیں ملی', sortBy:'ترتیب دیں',
    priceLowHigh:'قیمت: کم سے زیادہ', priceHighLow:'قیمت: زیادہ سے کم', nameAZ:'نام: الف سے',
    newest:'سب سے نئی', filterBy:'فلٹر', priceRange:'قیمت کی حد', availability:'دستیابی',
    brand:'برانڈ', all:'سب', inStockOnly:'صرف دستیاب', clearFilters:'فلٹر صاف کریں',
    showing:'دکھا رہا ہے', results:'نتائج', of:'میں سے', followUs:'ہمیں فالو کریں',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => { const saved = localStorage.getItem('pkv_lang'); return saved === 'ur' || saved === 'en' ? saved : 'en'; });
  const dir = lang === 'ur' ? 'rtl' : 'ltr';
  useEffect(() => { document.documentElement.dir = dir; document.documentElement.lang = lang; localStorage.setItem('pkv_lang', lang); }, [lang, dir]);
  const setLang = (l: Lang) => setLangState(l);
  const t = (key: string) => translations[lang][key] || key;
  return <LanguageContext.Provider value={{ lang, setLang, t, dir }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
