'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { platformStore } from '@/lib/store';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    // If already logged in, go directly to dashboard
    const user = platformStore.getAdminUser();
    if (user) {
      router.push('/admin/dashboard');
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = platformStore.login(email, password);

    if (result.success) {
      window.location.href = '/admin/dashboard';
    } else {
      setError(result.error || 'Authentication failed. Invalid email or password.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-vb-dark flex items-center justify-center p-4 sm:p-6 text-white vb-bg-glow">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex flex-col items-center gap-2">
            <img
              src="/logos/vidabricks-gold.png"
              alt="Vidabricks Real Estate Dubai"
              className="h-14 sm:h-16 w-auto object-contain drop-shadow-xl"
            />
            <div className="text-center">
              <span className="text-[10px] tracking-[0.3em] text-vb-gold-champagne font-bold uppercase block">
                SUPER ADMIN PORTAL
              </span>
            </div>
          </div>
          <h2 className="text-2xl font-bold font-display text-white">Administrator Sign In</h2>
          <p className="text-xs text-slate-400">
            Authorized management access for Vidabricks Real Estate LLC
          </p>
        </div>

        {/* Login Card */}
        <div className="p-8 rounded-3xl bg-vb-card border border-vb-border shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-500/50 text-red-300 text-xs font-medium animate-fade-in flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Admin Email
              </label>
              <div className="flex items-center rounded-xl bg-vb-dark border border-vb-border px-3.5 py-2.5 focus-within:border-vb-gold transition-colors">
                <Mail className="w-4 h-4 text-vb-gold-light shrink-0 mr-2.5" />
                <input
                  type="email"
                  required
                  placeholder="admin@vidabricks.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-white text-xs outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="flex items-center rounded-xl bg-vb-dark border border-vb-border px-3.5 py-2.5 focus-within:border-vb-gold transition-colors">
                <Lock className="w-4 h-4 text-vb-gold-light shrink-0 mr-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-white text-xs outline-none placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-vb-gold via-vb-gold-light to-vb-gold-champagne hover:brightness-110 text-vb-black font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-gold-glow active:scale-95 disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Verifying Credentials...' : 'Sign In as Super Admin'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="text-center text-xs text-vb-grey-text flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-vb-gold-light" />
          <span>Encrypted Session • Vidabricks Dubai</span>
        </div>
      </div>
    </div>
  );
}
