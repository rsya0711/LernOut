import React from 'react';
import {
  Star,
  Flame,
  Zap,
  ArrowRight,
  Server,
  GraduationCap,
  Code,
  Globe,
  BrainCircuit,
  Award,
  BookOpen,
  Trophy,
  ChevronRight,
} from 'lucide-react';
import { apiClient } from '../api/client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

const IconMap: Record<string, React.ElementType> = {
  Star, Flame, Zap, ArrowRight, Server, GraduationCap, Code, Globe, BrainCircuit, Award, BookOpen, Trophy,
};

const FEATURES = [
  { icon: BrainCircuit, title: 'Pembelajaran Adaptif', desc: 'Materi yang disesuaikan dengan kemampuan dan kecepatanmu.' },
  { icon: Trophy, title: 'Leaderboard & XP', desc: 'Bersaing dengan ribuan pelajar, kumpulkan XP setiap hari.' },
  { icon: Flame, title: 'Streak Harian', desc: 'Jaga konsistensi belajar dengan sistem api streak.' },
  { icon: GraduationCap, title: 'Simulasi Tryout UTBK', desc: 'Latihan soal berbasis UTBK terbaru dengan timer real.' },
];

export const HomePage: React.FC = () => {

  const { data: courses, isLoading } = useQuery({
    queryKey: ['featured-courses'],
    queryFn: async () => {
      const res = await apiClient.get('/courses');
      return res.data;
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden rounded-3xl glass-hero p-8 sm:p-14">
        {/* Background glow orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-slate-800">
              Kuasai{' '}
              <span className="text-shimmer">Ilmu</span>. Naik Level.{' '}
              <span className="text-shimmer">Capai Target.</span>
            </h1>

            <p className="text-slate-500 text-lg leading-relaxed max-w-lg">
              Dari UTBK hingga programming, AI, bahasa, dan berbagai skill lainnya—belajar dengan cara yang interaktif.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/register">
                <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-indigo-500 hover:bg-indigo-400 text-white shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:-translate-y-0.5 btn-press">
                  Mulai Gratis Sekarang <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link to="/courses">
                <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all hover:-translate-y-0.5 btn-press">
                  <BookOpen className="w-4 h-4" /> Lihat Kursus
                </button>
              </Link>
            </div>
          </div>

          {/* Floating glass card */}
          <div className="hidden lg:block">
            <div className="glass rounded-2xl p-6 space-y-5 animate-float">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Target Harian</span>
                <span className="flex items-center gap-1 text-xs font-bold text-orange-400">
                  <Flame className="w-4 h-4 fill-orange-400" /> 7 hari streak
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500">XP Hari Ini</span>
                  <span className="text-indigo-600">30 / 50 XP</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {['Matematika', 'Fisika', 'Bahasa'].map((s) => (
                  <div key={s} className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center">
                    <div className="text-xs text-slate-500 font-medium">{s}</div>
                    <div className="text-sm font-black text-slate-800 mt-1">✓</div>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-400">Next Reward:</span>
                <span className="flex items-center gap-1 text-yellow-400 font-bold">
                  <Award className="w-3.5 h-3.5" /> Badge Streak Master
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Courses ── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-800">
              Jalur <span className="text-shimmer">Belajar</span> Pilihan
            </h2>
            <p className="text-sm text-slate-400 mt-1">Materi terstruktur dari dasar hingga tingkat mahir</p>
          </div>
          <Link to="/courses" className="flex items-center gap-1 text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
            Semua Kursus <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-5 animate-pulse space-y-3">
                <div className="w-12 h-12 rounded-xl bg-slate-200" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
              </div>
            ))
          ) : (
            courses?.slice(0, 4).map((course: any) => {
              const Icon = IconMap[course.category?.icon] || GraduationCap;
              const progress = course.userProgress?.progressPercent || 0;
              return (
                <Link key={course.id} to={`/courses/${course.slug}`}>
                  <div className="glass-card rounded-2xl p-5 h-full flex flex-col justify-between gap-4 group cursor-pointer">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          {course.level}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{course.description}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400">
                        <span>Progress</span>
                        <span className="text-indigo-600">{progress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span>{course.lessonsCount} Lessons</span>
                        <span className="text-indigo-600 font-bold group-hover:text-indigo-700">
                          {progress > 0 ? 'Lanjutkan →' : 'Mulai →'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </section>

      {/* ── Feature Grid ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="glass-card rounded-2xl p-6 space-y-3 group">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/15 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/25 transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">{f.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          );
        })}
      </section>

      {/* ── CTA Banner ── */}
      <section className="glass-hero rounded-3xl p-8 sm:p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-wider">
              🏆 Leaderboard <span className="text-shimmer font-black">Mingguan</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">
              Pertahankan <span className="text-shimmer">Streak</span> &amp; Duduki{' '}
              <span className="text-shimmer">Peringkat 1!</span>
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Setiap soal yang kamu kerjakan menghasilkan XP. Belajar konsisten setiap hari untuk menjaga api streak dan membuka badge eksklusif.
            </p>
          </div>
          <Link to="/leaderboard">
            <button className="whitespace-nowrap flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm bg-white text-indigo-900 hover:bg-indigo-50 shadow-2xl shadow-indigo-500/20 transition-all hover:-translate-y-0.5 btn-press">
              Cek Papan Peringkat <ChevronRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>

    </div>
  );
};
