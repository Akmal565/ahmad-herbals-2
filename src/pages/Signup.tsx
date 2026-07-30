import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wheat, Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Signup() {
  const { signUp, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => { if (user) navigate('/dashboard'); }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    const { error: err } = await signUp(email, password, fullName, phone);
    setLoading(false);
    if (err) setError(err); else { setSuccess(true); setTimeout(() => navigate('/dashboard'), 2000); }
  };

  if (success) return <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 animate-fade-in"><div className="text-center max-w-md"><div className="w-20 h-20 rounded-full bg-secondary-100 flex items-center justify-center mx-auto mb-4"><Check className="text-secondary-600" size={40} /></div><h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Account Created!</h1><p className="text-gray-500">Redirecting to your dashboard...</p></div></div>;

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4"><div className="w-12 h-12 rounded-lg bg-primary-600 flex items-center justify-center"><Wheat className="text-white" size={26} /></div></Link>
          <h1 className="font-display text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Join Ahmad Herbals for the best organic foods</p>
        </div>
        <div className="card p-6">
          {error && <div className="mb-4 p-3 bg-accent-50 border border-accent-200 rounded-lg flex items-center gap-2 text-sm text-accent-700"><AlertCircle size={18} /> {error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" className="input-field pl-10" /></div></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="input-field pl-10" /></div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+92 300 1234567" className="input-field pl-10" /></div></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="input-field pl-10 pr-10" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type={showPassword ? 'text' : 'password'} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="input-field pl-10" /></div></div>
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Creating account...' : <>{t('signup')} <ArrowRight size={18} /></>}</button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">Already have an account? <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">{t('login')}</Link></p>
        </div>
      </div>
    </div>
  );
}
