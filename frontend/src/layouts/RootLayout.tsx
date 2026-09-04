import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Flame,
  Zap,
  Award,
  BookOpen,
  GraduationCap,
  Trophy,
  ShieldAlert,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import { PremiumModal } from '../components/ui/PremiumModal';

export const RootLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isPremiumOpen, setIsPremiumOpen] = React.useState<boolean>(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    ...(isAuthenticated ? [{ label: 'Dasbor Saya', path: '/dashboard', icon: LayoutDashboard }] : []),
    { label: 'Katalog Belajar', path: '/courses', icon: BookOpen },
    { label: 'Tryout UTBK', path: '/tryout', icon: GraduationCap },
    { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    ...(user?.role === 'ADMIN' ? [{ label: 'Admin Panel', path: '/admin', icon: ShieldAlert }] : []),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b-2 border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white font-black text-xl shadow-button-brand group-hover:scale-105 transition-transform">
              L
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-800">
                Learn<span className="text-brand-500">Out</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded">
                UTBK & Gamified
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Gamification Stats Status / Auth Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated && user ? (
              <>
                {/* Streak Counter */}
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl"
                  title="Streak Harian"
                >
                  <Flame className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
                  <span className="text-xs sm:text-sm font-black text-amber-900">
                    {user.streak} Hari
                  </span>
                </div>

                {/* XP Points */}
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 border border-brand-200 rounded-xl"
                  title="Total XP"
                >
                  <Zap className="w-5 h-5 text-brand-600 fill-brand-500" />
                  <span className="text-xs sm:text-sm font-black text-brand-900">
                    {user.xp} XP
                  </span>
                </div>

                {/* Level Badge */}
                <Badge variant="exam" className="hidden sm:inline-flex py-1.5">
                  <Award className="w-4 h-4 text-indigo-600" />
                  Level {user.level}
                </Badge>

                {/* LearnOut PRO Trigger Button */}
                <button
                  onClick={() => setIsPremiumOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-button-streak btn-press"
                  title="Tingkatkan ke LearnOut PRO"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                  <span>PRO</span>
                </button>

                {/* User Profile Pill & Logout */}
                <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-200">
                  <div className="flex items-center gap-2">
                    <img
                      src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                      alt={user.username}
                      className="w-8 h-8 rounded-full border-2 border-brand-300 bg-brand-50"
                    />
                    <div className="hidden lg:block text-left">
                      <div className="text-xs font-black text-slate-800 leading-tight">
                        {user.fullName || user.username}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        @{user.username}
                        {user.role === 'ADMIN' && (
                          <span className="bg-indigo-100 text-indigo-700 px-1 py-0.2 rounded font-extrabold text-[9px]">
                            ADMIN
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    title="Keluar / Logout"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-bold text-slate-600 hover:text-brand-600 px-3.5 py-2 rounded-xl transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="text-xs sm:text-sm font-bold bg-brand-500 text-white hover:bg-brand-600 px-4 py-2 rounded-xl shadow-button-brand btn-press transition-colors"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-16 md:pb-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-slate-100 flex items-center justify-around py-2 px-1 shadow-lg">
        {navLinks.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[11px] font-bold ${
                isActive ? 'text-brand-600' : 'text-slate-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[11px] font-bold text-rose-500"
          >
            <LogOut className="w-5 h-5" />
            <span>Keluar</span>
          </button>
        ) : (
          <Link
            to="/login"
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[11px] font-bold text-brand-600"
          >
            <UserIcon className="w-5 h-5" />
            <span>Masuk</span>
          </Link>
        )}
      </nav>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>© 2026 LearnOut Platform. Gamified Learning & UTBK Mastery.</div>
          <div className="flex gap-4 font-semibold text-slate-600">
            <span>Phase 10: Complete Platform</span>
            <span className="text-brand-600 font-bold">● Active</span>
          </div>
        </div>
      </footer>

      {/* LearnOut PRO Subscription Modal */}
      <PremiumModal isOpen={isPremiumOpen} onClose={() => setIsPremiumOpen(false)} />
    </div>
  );
};
