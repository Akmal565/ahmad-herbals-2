import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wheat, Lock, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, Mail, Check, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const { signIn, user, profile, isAdmin, loading: authLoading, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (user && profile) {
      if (isAdmin) navigate('/admin');
      else navigate('/dashboard');
    }
  }, [user, profile, isAdmin, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await signIn(email, password);
    if (err) { setError(err); setLoading(false); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await resetPassword(email);
    setLoading(false);
    if (err) setError(err);
    else setResetSent(true);
  };

  return (
    <div className="min-h-screen bg-primary-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary-800/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary-800/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg">
              <Wheat className="text-white" size={28} />
            </div>
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-1">Ahmad Herbals</h1>
          <p className="text-primary-300 text-sm">Admin Control Panel</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {mode === 'login' ? (
            <>
              <div className="flex items-center gap-2 mb-6">
                <ShieldCheck className="text-primary-600" size={22} />
                <h2 className="font-display text-xl font-semibold text-gray-900">Secure Login</h2>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-accent-50 border border-accent-200 rounded-lg flex items-center gap-2 text-sm text-accent-700">
                  <AlertCircle size={18} /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin Email</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@ahmadherbals.com" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all active:scale-95 disabled:opacity-50">
                  {loading ? 'Signing in...' : <>Sign In to Admin Panel <ArrowRight size={18} /></>}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button onClick={() => { setMode('forgot'); setError(''); }} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Forgot Password?
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="bg-primary-50 rounded-lg p-3 text-xs text-primary-700">
                  <p className="font-semibold mb-1">Default Admin Credentials:</p>
                  <p>Email: admin@ahmadherbals.com</p>
                  <p>Password: admin123456</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-6">
                <Mail className="text-primary-600" size={22} />
                <h2 className="font-display text-xl font-semibold text-gray-900">Reset Password</h2>
              </div>

              {resetSent ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center mx-auto mb-4">
                    <Check className="text-secondary-600" size={32} />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-gray-900 mb-2">Check Your Email</h3>
                  <p className="text-sm text-gray-500 mb-6">We have sent a password reset link to <span className="font-semibold text-gray-700">{email}</span>. Follow the link to reset your password.</p>
                  <button onClick={() => { setMode('login'); setResetSent(false); }} className="btn-primary w-full">
                    <ArrowLeft size={18} /> Back to Login
                  </button>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="mb-4 p-3 bg-accent-50 border border-accent-200 rounded-lg flex items-center gap-2 text-sm text-accent-700">
                      <AlertCircle size={18} /> {error}
                    </div>
                  )}
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                      <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@ahmadherbals.com" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all active:scale-95 disabled:opacity-50">
                      {loading ? 'Sending...' : <>Send Reset Link <ArrowRight size={18} /></>}
                    </button>
                  </form>
                  <div className="mt-4 text-center">
                    <button onClick={() => { setMode('login'); setError(''); }} className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 mx-auto">
                      <ArrowLeft size={16} /> Back to Login
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <div className="text-center mt-6">
          <a href="/" className="text-primary-300 text-sm hover:text-white transition-colors">
            ← Back to Store
          </a>
        </div>
      </div>
    </div>
  );
}
