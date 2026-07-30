import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home as HomeIcon, Mail, Phone, MapPin, Clock, Send, Check, MessageSquare, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    const { error: dbError } = await supabase.from('form_submissions').insert({
      form_type: 'contact', name: form.name, email: form.email, subject: form.subject, message: form.message,
    });
    setLoading(false);
    if (dbError) { setError('Failed to send message. Please try again.'); return; }
    setSent(true); setForm({ name: '', email: '', subject: '', message: '' }); setTimeout(() => setSent(false), 5000);
  };
  const contactInfo = [{ icon: Mail, label: 'Email', value: 'info@ahmadherbals.com', href: 'mailto:info@ahmadherbals.com' }, { icon: Phone, label: 'Phone', value: '+92 348 3617905', href: 'tel:+923483617905' }, { icon: MapPin, label: 'Address', value: '123 Main Boulevard, Gulberg III, Lahore, Punjab, Pakistan', href: '#' }, { icon: Clock, label: 'Hours', value: 'Mon - Sat: 9 AM - 7 PM', href: '#' }];
  const faqs = [{ q: 'What are your delivery charges?', a: 'We offer free delivery on orders above Rs. 8000. For orders below that, a flat rate of Rs. 150 is charged.' }, { q: 'How long does delivery take?', a: 'Delivery typically takes 3-5 business days within Punjab and 5-7 days for other provinces.' }, { q: 'Do you offer Cash on Delivery?', a: 'Yes, we offer Cash on Delivery (COD) across Pakistan.' }, { q: 'Are your products really organic?', a: 'Yes, all our products are sourced from certified organic farms.' }, { q: 'What is your return policy?', a: 'We offer a 7-day return policy for unopened products.' }];
  return (
    <div className="animate-fade-in">
      <div className="bg-gray-50 border-b border-gray-100"><div className="container-app py-3"><div className="flex items-center gap-1.5 text-sm text-gray-500"><Link to="/" className="hover:text-primary-600 flex items-center gap-1"><HomeIcon size={14} /> Home</Link><ChevronRight size={14} /><span className="text-gray-900 font-medium">Contact</span></div></div></div>
      <section className="py-12 bg-primary-50"><div className="container-app text-center"><MessageSquare className="text-primary-600 mx-auto mb-3" size={40} /><h1 className="font-display text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Get In Touch</h1><p className="text-gray-600 max-w-md mx-auto">Have a question or need help? We are here for you.</p></div></section>
      <section className="py-8"><div className="container-app"><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{contactInfo.map((info, i) => <a key={i} href={info.href} className="card p-5 text-center hover:shadow-lg"><div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center mx-auto mb-3"><info.icon className="text-primary-600" size={24} /></div><p className="text-xs text-gray-500 uppercase mb-1">{info.label}</p><p className="text-sm font-medium text-gray-900">{info.value}</p></a>)}</div></div></section>
      <section className="py-8 lg:py-12"><div className="container-app"><div className="grid lg:grid-cols-2 gap-8">
        <div className="card p-6"><h2 className="font-display text-xl font-semibold mb-4">Send Us a Message</h2>{sent && <div className="mb-4 p-3 bg-secondary-50 border border-secondary-200 rounded-lg flex items-center gap-2 text-sm text-secondary-700"><Check size={18} /> Thank you! Your message has been sent.</div>}{error && <div className="mb-4 p-3 bg-accent-50 border border-accent-200 rounded-lg flex items-center gap-2 text-sm text-accent-700"><AlertCircle size={18} /> {error}</div>}<form onSubmit={handleSubmit} className="space-y-4"><div className="grid sm:grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label><input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" placeholder="John Doe" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-field" placeholder="your@email.com" /></div></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Subject</label><input type="text" required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="input-field" placeholder="How can we help?" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Message</label><textarea required value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={5} className="input-field resize-none" placeholder="Write your message here..." /></div><button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Sending...' : <><Send size={18} /> Send Message</>}</button></form></div>
        <div className="card overflow-hidden h-full"><iframe title="Location" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3401.234567!2d74.3587!3d31.5204!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDMxJzIxLjQiTiA3NMKwMjEnMzEuMyJF!5e0!3m2!1sen!2s!4v1234567890" width="100%" height="100%" style={{ border: 0, minHeight: '400px' }} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div>
      </div></div></section>
      <section className="py-8 lg:py-12 bg-gray-50"><div className="container-app max-w-3xl"><h2 className="font-display text-2xl font-bold text-gray-900 text-center mb-2">Frequently Asked Questions</h2><p className="text-gray-500 text-center mb-8">Find answers to common questions</p><div className="space-y-3">{faqs.map((faq, i) => <details key={i} className="card p-4 group"><summary className="font-semibold text-gray-900 cursor-pointer flex items-center justify-between list-none">{faq.q}<ChevronRight className="text-gray-400 group-open:rotate-90 transition-transform" size={18} /></summary><p className="text-sm text-gray-600 mt-3 leading-relaxed">{faq.a}</p></details>)}</div></div></section>
    </div>
  );
}
