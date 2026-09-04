import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Sparkles, Eye, EyeOff, LogIn, ShieldCheck, UserCheck, AlertCircle, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Return to intended page or home
  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ identifier, password });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Gagal masuk. Silakan periksa kembali email/username dan kata sandi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick helper to fill demo credentials
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-extrabold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            LearnOut Authentication
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Selamat Datang Kembali!</h1>
          <p className="text-sm text-slate-500">
            Masuk untuk melanjutkan streak belajar dan kumpulkan XP harianmu.
          </p>
        </div>

        {/* Login Form Card */}
        <Card className="p-8 shadow-card border-2 border-slate-100 space-y-6 bg-white">
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
                placeholder="contoh: budisantoso atau budi@learnout.id"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Kata Sandi
                </label>
                <span className="text-xs text-brand-600 hover:underline cursor-pointer font-semibold">
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
                  className="w-full px-4 py-3 pr-11 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-brand-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              className="w-full gap-2 shadow-button-brand font-bold text-white mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Memproses...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" /> Masuk ke Akun
                </>
              )}
            </Button>
          </form>

          {/* Quick Demo Credentials Fill */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center">
              Akses Cepat (Akun Uji Coba)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('budi@learnout.id', 'user123')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors"
              >
                <UserCheck className="w-4 h-4 text-emerald-600" />
                Demo User
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin@learnout.id', 'admin123')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Demo Admin
              </button>
            </div>
          </div>
        </Card>

        {/* Footer Link */}
        <p className="text-center text-xs sm:text-sm text-slate-500 font-semibold">
          Belum memiliki akun?{' '}
          <Link to="/register" className="text-brand-600 font-extrabold hover:underline">
            Daftar Sekarang Gratis
          </Link>
        </p>
      </div>
    </div>
  );
};
