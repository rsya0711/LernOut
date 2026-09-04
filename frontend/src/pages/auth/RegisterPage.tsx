import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Sparkles, Eye, EyeOff, UserPlus, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Kata sandi minimal 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        fullName,
        username,
        email,
        password,
      });
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftar. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-extrabold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Mulai Perjalanan Belajar
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Buat Akun Baru</h1>
          <p className="text-sm text-slate-500">
            Daftar gratis, pelajari ribuan materi UTBK dan kumpulkan XP pertamamu.
          </p>
        </div>

        {/* Register Form Card */}
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
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="contoh: Budi Santoso"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Username Unik
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                placeholder="contoh: budisantoso"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Alamat Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contoh: budi@gmail.com"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kata Sandi (Minimal 6 Karakter)
              </label>
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

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Ulangi Kata Sandi
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              className="w-full gap-2 shadow-button-brand font-bold text-white mt-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Mendaftarkan Akun...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" /> Buat Akun LearnOut
                </>
              )}
            </Button>
          </form>

          <div className="pt-2 text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Data kamu terlindungi dengan enkripsi standar industri.
          </div>
        </Card>

        {/* Footer Link */}
        <p className="text-center text-xs sm:text-sm text-slate-500 font-semibold">
          Sudah memiliki akun?{' '}
          <Link to="/login" className="text-brand-600 font-extrabold hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
};
