import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Wheat, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Login() {
  const { signIn, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) navigate(redirect); }, [user, navigate, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) setError(err); else navigate(redirect);
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4"><div className="w-12 h-12 rounded-lg bg-primary-600 flex items-center justify-center"><Wheat className="text-white" size={26} /></div></Link>
          <h1 className="font-display text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account to continue</p>
        </div>
        <div className="card p-6">
          {error && <div className="mb-4 p-3 bg-accent-50 border border-accent-200 rounded-lg flex items-center gap-2 text-sm text-accent-700"><AlertCircle size={18} /> {error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="input-field pl-10" /></div></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="input-field pl-10 pr-10" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Signing in...' : <>{t('login')} <ArrowRight size={18} /></>}</button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">Don't have an account? <Link to="/signup" className="font-semibold text-primary-600 hover:text-primary-700">{t('signup')}</Link></p>
        </div>
      </div>
    </div>
  );
}
