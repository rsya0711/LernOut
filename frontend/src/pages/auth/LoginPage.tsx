import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Star, Eye, EyeOff, LogIn, ShieldCheck, UserCheck, AlertCircle, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ identifier, password });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Gagal masuk. Periksa kembali email/username dan kata sandi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemo = (id: string, pwd: string) => {
    setIdentifier(id);
    setPassword(pwd);
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-extrabold mb-1">
            <Star className="w-3.5 h-3.5" />
            LearnOut Authentication
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Selamat Datang <span className="text-shimmer">Kembali!</span>
          </h1>
          <p className="text-sm text-slate-500">
            Masuk untuk melanjutkan streak belajar dan kumpulkan XP harianmu.
          </p>
        </div>

        {/* Glass Form Card */}
        <div className="glass-card rounded-3xl p-8 space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs sm:text-sm font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email atau Username
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="contoh: budi@learnout.id"
                className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Kata Sandi
                </label>
                <span className="text-xs text-indigo-600 hover:text-indigo-700 cursor-pointer font-semibold transition-colors">
                  Lupa Sandi?
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-white/80 border border-slate-200 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm bg-indigo-500 hover:bg-indigo-400 text-white shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mt-2 btn-press"
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</>
              ) : (
                <><LogIn className="w-5 h-5" /> Masuk ke Akun</>
              )}
            </button>
          </form>

          {/* Quick Demo */}
          <div className="pt-4 border-t border-slate-200/80 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center">
              Akses Cepat (Akun Uji Coba)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('budi@learnout.id', 'user123')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white/70 hover:bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 shadow-sm transition-all"
              >
                <UserCheck className="w-4 h-4 text-emerald-600" />
                Demo User
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin@learnout.id', 'admin123')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white/70 hover:bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 shadow-sm transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Demo Admin
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs sm:text-sm text-slate-500 font-semibold">
          Belum memiliki akun?{' '}
          <Link to="/register" className="text-indigo-600 font-extrabold hover:text-indigo-700 transition-colors">
            Daftar Sekarang Gratis
          </Link>
        </p>
      </div>
    </div>
  );
};
