import { Link } from 'react-router-dom';
import { Wheat, Facebook, Instagram, Youtube, Mail, Phone, MapPin, Truck, ShieldCheck, CreditCard, Leaf } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useState } from 'react';

export default function Footer() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const handleSubscribe = (e: React.FormEvent) => { e.preventDefault(); if (!email.trim()) return; setSubscribed(true); setEmail(''); setTimeout(() => setSubscribed(false), 3000); };

  const features = [
    { icon: Truck, title: t('freeShipping'), desc: t('freeShippingDesc') },
    { icon: ShieldCheck, title: t('qualityGuarantee'), desc: t('qualityDesc') },
    { icon: CreditCard, title: t('codAvailable'), desc: t('codDesc') },
    { icon: Leaf, title: t('securePayment'), desc: t('secureDesc') },
  ];

  return (
    <footer className="bg-primary-950 text-primary-100 mt-16">
      <div className="border-b border-primary-900"><div className="container-app py-8"><div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => <div key={i} className="flex items-center gap-3"><div className="w-12 h-12 rounded-lg bg-primary-800 flex items-center justify-center shrink-0"><f.icon className="text-primary-300" size={24} /></div><div><p className="font-semibold text-sm text-white">{f.title}</p><p className="text-xs text-primary-300">{f.desc}</p></div></div>)}
      </div></div></div>
      <div className="container-app py-12"><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="space-y-4"><div className="flex items-center gap-2"><div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center"><Wheat className="text-white" size={22} /></div><span className="font-display text-xl font-bold text-white">Ahmad Herbals</span></div><p className="text-sm text-primary-300 leading-relaxed">Premium organic and traditional foods from the heart of Punjab. Stone-ground flours, premium dry fruits, pure honey, and authentic spices delivered to your doorstep.</p><div className="flex items-center gap-3"><a href="#" className="w-9 h-9 rounded-lg bg-primary-800 hover:bg-primary-700 flex items-center justify-center"><Facebook size={18} /></a><a href="#" className="w-9 h-9 rounded-lg bg-primary-800 hover:bg-primary-700 flex items-center justify-center"><Instagram size={18} /></a><a href="#" className="w-9 h-9 rounded-lg bg-primary-800 hover:bg-primary-700 flex items-center justify-center"><Youtube size={18} /></a></div></div>
        <div><h3 className="font-display text-lg font-semibold text-white mb-4">{t('quickLinks')}</h3><ul className="space-y-2 text-sm"><li><Link to="/" className="text-primary-300 hover:text-white">{t('home')}</Link></li><li><Link to="/shop" className="text-primary-300 hover:text-white">{t('shop')}</Link></li><li><Link to="/blog" className="text-primary-300 hover:text-white">{t('blog')}</Link></li><li><Link to="/about" className="text-primary-300 hover:text-white">{t('about')}</Link></li><li><Link to="/contact" className="text-primary-300 hover:text-white">{t('contact')}</Link></li></ul></div>
        <div><h3 className="font-display text-lg font-semibold text-white mb-4">{t('customerService')}</h3><ul className="space-y-2 text-sm"><li><Link to="/dashboard" className="text-primary-300 hover:text-white">{t('dashboard')}</Link></li><li><Link to="/dashboard?tab=orders" className="text-primary-300 hover:text-white">{t('myOrders')}</Link></li><li><Link to="/cart" className="text-primary-300 hover:text-white">{t('cart')}</Link></li><li><Link to="/about" className="text-primary-300 hover:text-white">FAQ</Link></li><li><Link to="/contact" className="text-primary-300 hover:text-white">Support</Link></li></ul></div>
        <div><h3 className="font-display text-lg font-semibold text-white mb-4">{t('newsletter')}</h3><p className="text-sm text-primary-300 mb-3">Subscribe for exclusive deals and updates.</p><form onSubmit={handleSubscribe} className="flex gap-2 mb-4"><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="flex-1 px-3 py-2 text-sm bg-primary-900 border border-primary-800 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500" required /><button type="submit" className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-500">Subscribe</button></form>{subscribed && <p className="text-sm text-secondary-300 animate-fade-in mb-4">Thank you for subscribing!</p>}<div className="space-y-2 text-sm"><div className="flex items-center gap-2 text-primary-300"><Mail size={16} /><span>info@ahmadherbals.com</span></div><div className="flex items-center gap-2 text-primary-300"><Phone size={16} /><span>+92 348 3617905</span></div><div className="flex items-center gap-2 text-primary-300"><MapPin size={16} /><span>Lahore, Punjab, Pakistan</span></div></div></div>
      </div></div>
      <div className="border-t border-primary-900"><div className="container-app py-4 text-center text-sm text-primary-400"><p>&copy; {new Date().getFullYear()} Ahmad Herbals. {t('allRightsReserved')}.</p></div></div>
    </footer>
  );
}
