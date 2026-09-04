import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Flame,
  Zap,
  ArrowRight,
  Server,
  GraduationCap,
  Code,
  Globe,
  BrainCircuit,
  Award,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { apiClient } from '../api/client';

export const HomePage: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<{
    status: 'checking' | 'online' | 'offline';
    info?: any;
    latency?: number;
  }>({ status: 'checking' });

  // Real-time ping to backend API to verify Phase 1 integration
  useEffect(() => {
    const startTime = Date.now();
    apiClient
      .get('/health')
      .then((res) => {
        setBackendStatus({
          status: 'online',
          info: res.data,
          latency: Date.now() - startTime,
        });
      })
      .catch((err) => {
        setBackendStatus({
          status: 'offline',
          info: err.message,
        });
      });
  }, []);

  const sampleCategories = [
    {
      title: 'UTBK / SNBT 2026',
      description: 'TPS, Penalaran Umum, Literasi B. Indonesia & Inggris, PK',
      icon: GraduationCap,
      color: 'bg-indigo-500',
      badge: '100+ Soal Terupdate',
      progress: 68,
      xp: '1200 XP',
    },
    {
      title: 'Matematika Dasar & Lanjut',
      description: 'Aljabar, Geometri, Trigonometri, Kalkulus & Logika',
      icon: BrainCircuit,
      color: 'bg-emerald-500',
      badge: 'Gamified Modules',
      progress: 45,
      xp: '850 XP',
    },
    {
      title: 'Bahasa Inggris',
      description: 'Grammar, Reading Comprehension, Vocabulary Boost',
      icon: Globe,
      color: 'bg-amber-500',
      badge: 'Interactive Stories',
      progress: 80,
      xp: '1400 XP',
    },
    {
      title: 'Pemrograman Web & Logika',
      description: 'Algorithm, JavaScript, TypeScript, Frontend Mastery',
      icon: Code,
      color: 'bg-cyan-500',
      badge: 'Hands-on Quizzes',
      progress: 30,
      xp: '600 XP',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-brand-800 to-slate-900 text-white p-8 sm:p-12 shadow-2xl border border-brand-700/50">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs sm:text-sm font-bold tracking-wide">
            <Sparkles className="w-4 h-4 text-brand-300 animate-spin" style={{ animationDuration: '4s' }} />
            Revolusi Belajar UTBK & Gamifikasi Edukasi
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Kuasai UTBK & Pelajaran Favoritmu dengan{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-300">
              Level & Streak
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
            Belajar tidak lagi membosankan. Belajar materi bertahap, selesaikan kuis interaktif, ikuti simulasi tryout berwaktu, kumpulkan XP, dan jadilah juara leaderboard setiap minggu.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Button size="lg" variant="primary" className="gap-2 shadow-button-brand text-white">
              Mulai Belajar Sekarang <ArrowRight className="w-5 h-5" />
            </Button>
            <Button size="lg" variant="secondary" className="gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" /> Coba Simulasi Tryout
            </Button>
          </div>
        </div>

        {/* Floating gamification badge in Hero */}
        <div className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 w-80">
          <Card className="bg-white/10 backdrop-blur-md border border-white/20 text-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-amber-300 flex items-center gap-1">
                <Flame className="w-4 h-4 fill-amber-400 text-amber-400" /> Target Harian
              </span>
              <Badge variant="streak" size="sm">🔥 3 Hari Berturut</Badge>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5 text-slate-200">
                <span>XP Hari Ini</span>
                <span className="text-emerald-300 font-extrabold">30 / 50 XP</span>
              </div>
              <ProgressBar value={60} variant="streak" />
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
              <span>Next Reward:</span>
              <span className="font-bold text-white flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-300" /> Streak Saver
              </span>
            </div>
          </Card>
        </div>
      </section>

      {/* Phase 1 Integration & System Status Panel */}
      <section className="bg-white rounded-2xl border-2 border-slate-100 p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-800">Status Arsitektur Sistem (Phase 1)</h2>
              <p className="text-xs text-slate-500">Koneksi Real-time Frontend (Vite) ⟷ Backend (NestJS + Swagger + Prisma)</p>
            </div>
          </div>
          <div>
            {backendStatus.status === 'online' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Backend Terhubung ({backendStatus.latency}ms)
              </span>
            ) : backendStatus.status === 'checking' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Memeriksa Server...
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                Backend Offline / Menunggu Start
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block mb-1">Frontend Stack</span>
            <span className="font-bold text-slate-800">React 18 + Vite + Tailwind</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block mb-1">Backend Stack</span>
            <span className="font-bold text-slate-800">NestJS Modular + TypeScript</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block mb-1">Database & ORM</span>
            <span className="font-bold text-slate-800">PostgreSQL + Prisma Client</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block mb-1">API Docs & Security</span>
            <a
              href="http://localhost:3000/api/docs"
              target="_blank"
              rel="noreferrer"
              className="text-brand-600 font-bold hover:underline"
            >
              Swagger UI (/api/docs) ↗
            </a>
          </div>
        </div>
      </section>

      {/* Learning Paths & Category Showcase */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-800">Jalur Belajar Pilihan</h2>
            <p className="text-sm text-slate-500">Materi terstruktur dari dasar hingga tingkat mahir.</p>
          </div>
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-brand-600 font-bold">
            Lihat Semua Course →
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sampleCategories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Card key={idx} hoverable className="flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl ${cat.color} text-white flex items-center justify-center shadow-md`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant="neutral" size="sm">{cat.badge}</Badge>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{cat.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{cat.description}</p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500">Progress</span>
                    <span className="text-brand-600">{cat.progress}%</span>
                  </div>
                  <ProgressBar value={cat.progress} variant="brand" />

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-extrabold text-amber-600 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {cat.xp}
                    </span>
                    <Button size="sm" variant="outline" className="text-xs py-1 px-3">
                      Lanjut
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Gamification Teaser Banner */}
      <section className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <Badge variant="neutral" className="bg-white/20 text-white border-white/30 text-xs uppercase font-extrabold">
            Leaderboard Mingguan
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-black">Pertahankan Streak & Duduki Peringkat 1!</h2>
          <p className="text-amber-100 text-sm">
            Setiap soal yang kamu kerjakan menghasilkan XP. Belajar konsisten setiap hari untuk menjaga api streak dan membuka badge eksklusif.
          </p>
        </div>
        <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 shadow-button font-black">
          Cek Papan Peringkat
        </Button>
      </section>
    </div>
  );
};
