import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  role: string | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  logActivity: (action: string, entityType?: string, entityId?: string, details?: Record<string, unknown>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) { console.error('Profile fetch error:', error); return; }
    if (data) setProfile(data as Profile);
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) { setUser({ id: session.user.id, email: session.user.email || '' }); fetchProfile(session.user.id); }
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) { setUser({ id: session.user.id, email: session.user.email || '' }); await fetchProfile(session.user.id); }
        else { setUser(null); setProfile(null); }
      })();
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message || null };
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, phone } } });
    if (error) return { error: error.message };
    if (data.user) {
      await supabase.from('profiles').upsert({ id: data.user.id, email, full_name: fullName, phone, role: 'customer' });
    }
    return { error: null };
  };

  const signOut = async () => { await supabase.auth.signOut(); setUser(null); setProfile(null); };
  const refreshProfile = async () => { if (user) await fetchProfile(user.id); };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/login`,
    });
    return { error: error?.message || null };
  };

  const logActivity = async (action: string, entityType = '', entityId = '', details: Record<string, unknown> = {}) => {
    if (!user) return;
    try {
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        user_email: user.email,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details,
      });
    } catch (e) {
      console.error('Failed to log activity:', e);
    }
  };

  const role = profile?.role || null;
  const isAdmin = role === 'admin' || role === 'super_admin';
  const isStaff = role === 'admin' || role === 'super_admin' || role === 'editor';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, isStaff, role, signIn, signUp, signOut, refreshProfile, resetPassword, logActivity }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
