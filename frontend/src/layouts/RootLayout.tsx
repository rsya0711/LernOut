import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Flame,
  Zap,
  BookOpen,
  GraduationCap,
  Trophy,
  ShieldAlert,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const RootLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

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
    <div className="min-h-screen flex flex-col">
      {/* ── Top Glassmorphism Navigation ── */}
      <header className="sticky top-0 z-40 glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/30 group-hover:scale-110 group-hover:shadow-indigo-500/50 transition-all duration-300">
              L
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-800">
                Learn<span className="text-shimmer">Out</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100 px-1.5 py-0.5 rounded-md">
                UTBK · Gamified
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Gamification + Auth */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {isAuthenticated && user ? (
              <>
                {/* Streak */}
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-100" title="Streak Harian">
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                  <span className="text-xs font-bold text-orange-700">{user.streak}d</span>
                </div>

                {/* XP */}
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100" title="Total XP">
                  <Zap className="w-4 h-4 text-indigo-500 fill-indigo-400" />
                  <span className="text-xs font-bold text-indigo-700">{user.xp} XP</span>
                </div>

                {/* User pill */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <img
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                    alt={user.username}
                    className="w-8 h-8 rounded-full border-2 border-indigo-200 bg-indigo-50"
                  />
                  <div className="hidden lg:block">
                    <div className="text-xs font-bold text-slate-800 leading-tight">{user.fullName || user.username}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      @{user.username}
                      {user.role === 'ADMIN' && (
                        <span className="bg-indigo-100 text-indigo-600 px-1 rounded text-[9px] font-bold">ADMIN</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Keluar"
                    className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5"
                >
                  Daftar Gratis
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 pb-20 md:pb-8">
        <Outlet />
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-nav border-t border-slate-100 flex items-center justify-around py-2 px-1">
        {navLinks.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-bold transition-all ${
                isActive ? 'text-indigo-600' : 'text-slate-400'
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
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-bold text-red-400"
          >
            <LogOut className="w-5 h-5" />
            <span>Keluar</span>
          </button>
        ) : (
          <Link
            to="/login"
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-bold text-indigo-300"
          >
            <UserIcon className="w-5 h-5" />
            <span>Masuk</span>
          </Link>
        )}
      </nav>

      {/* ── Footer ── */}
      <footer className="glass-nav border-t border-slate-100 py-5 text-center text-xs text-slate-400">
        © 2026 LearnOut Platform · Gamified Learning & UTBK Mastery
      </footer>
    </div>
  );
};
