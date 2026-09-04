import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Flame,
  Zap,
  Award,
  Target,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { progressApi } from '../../api/progress.api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useAuth } from '../../contexts/AuthContext';

export const UserDashboardPage: React.FC = () => {
  const { user } = useAuth();

  const { data: progress, isLoading } = useQuery({
    queryKey: ['userProgress'],
    queryFn: progressApi.getUserProgress,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="h-32 bg-slate-200 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const gamification = progress?.gamification || {
    xp: user?.xp || 0,
    level: user?.level || 1,
    currentXp: user?.xp || 0,
    currentLevelBaseXp: 0,
    nextLevelTargetXp: 100,
    xpNeededForNextLevel: 100,
    progressPercent: 45,
    streakDays: user?.streak || 0,
  };

  const stats = progress?.stats || {
    totalLessonsCompleted: 0,
    totalQuizzesAttempted: 0,
    totalQuestionsAnswered: 0,
    overallAccuracy: 0,
  };

  const activeCourses = progress?.activeCourses || [];
  const recentQuizzes = progress?.recentQuizAttempts || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* User Hero Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={
              user?.avatarUrl ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username || 'learner'}`
            }
            alt="Avatar"
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 p-1 border-2 border-brand-400 shadow-md"
          />
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Halo, {user?.fullName || user?.username || 'Pelajar Hebat'}! 👋
              </h1>
              <Badge variant="streak" size="sm">
                Level {gamification.level}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              Pertahankan streak belajarmu hari ini untuk membuka achievement baru.
            </p>
          </div>
        </div>

        {/* Level XP Progress Card */}
        <div className="w-full md:w-80 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-slate-200">
            <span className="flex items-center gap-1.5 text-amber-300">
              <Zap className="w-4 h-4 fill-amber-300" /> Level {gamification.level}
            </span>
            <span>
              {gamification.currentXp} / {gamification.nextLevelTargetXp} XP
            </span>
          </div>
          <ProgressBar value={gamification.progressPercent} variant="brand" />
          <p className="text-[11px] text-slate-300 text-right">
            +{gamification.nextLevelTargetXp - gamification.currentXp} XP lagi menuju Level{' '}
            {gamification.level + 1}
          </p>
        </div>
      </div>

      {/* Gamified Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-5 border-2 border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 shadow-sm">
            <Flame className="w-6 h-6 fill-amber-500 text-amber-500 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 block">Streak Belajar</span>
            <span className="text-xl font-black text-slate-900">
              {gamification.streakDays} Hari
            </span>
          </div>
        </Card>

        <Card className="p-5 border-2 border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 block">Lesson Selesai</span>
            <span className="text-xl font-black text-slate-900">
              {stats.totalLessonsCompleted} Materi
            </span>
          </div>
        </Card>

        <Card className="p-5 border-2 border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 block">Akurasi Soal</span>
            <span className="text-xl font-black text-indigo-700">
              {stats.overallAccuracy}%
            </span>
          </div>
        </Card>

        <Card className="p-5 border-2 border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0 shadow-sm">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 block">Total Latihan</span>
            <span className="text-xl font-black text-slate-900">
              {stats.totalQuestionsAnswered} Soal
            </span>
          </div>
        </Card>
      </div>

      {/* Main Grid: Active Courses and Recent Quizzes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Active Courses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-600" /> Kursus yang Sedang Dipelajari
            </h2>
            <Link to="/courses" className="text-xs font-bold text-brand-600 hover:underline">
              Jelajahi Semua →
            </Link>
          </div>

          {activeCourses.length === 0 ? (
            <Card className="p-8 text-center space-y-3">
              <p className="text-slate-500 text-sm">
                Kamu belum memulai kursus apapun. Pilih materi pertamamu sekarang!
              </p>
              <Link to="/courses">
                <Button size="sm" variant="primary">
                  Buka Katalog Kursus
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeCourses.map((course) => (
                <Card
                  key={course.id}
                  className="p-5 border-2 border-slate-100 hover:border-brand-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="brand" size="sm">
                        {course.category}
                      </Badge>
                      <Badge variant="neutral" size="sm">
                        Level: {course.level}
                      </Badge>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {course.title}
                    </h3>
                    <div className="space-y-1 max-w-md">
                      <div className="flex justify-between text-xs font-bold text-slate-500">
                        <span>Progres Belajar</span>
                        <span className="text-brand-600">
                          {course.progressPercent}% Selesai
                        </span>
                      </div>
                      <ProgressBar
                        value={course.progressPercent}
                        variant="brand"
                        animated={false}
                      />
                    </div>
                  </div>

                  <Link to={`/courses/${course.slug}`}>
                    <Button size="md" variant="primary" className="gap-2 shrink-0">
                      Lanjutkan <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Recent Quizzes & Tryout Shortcut */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> Riwayat Kuis Terbaru
            </h2>

            {recentQuizzes.length === 0 ? (
              <Card className="p-6 text-center text-xs text-slate-500">
                Belum ada kuis yang dikerjakan.
              </Card>
            ) : (
              <div className="space-y-3">
                {recentQuizzes.map((quiz) => (
                  <Card
                    key={quiz.id}
                    className="p-4 border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                        {quiz.quizTitle}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-semibold">
                        +{quiz.xpEarned} XP diperoleh
                      </span>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-sm font-black px-2.5 py-1 rounded-lg ${
                          quiz.isPassed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {quiz.score}%
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* UTBK Tryout Banner Shortcut */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-3xl p-6 text-white shadow-lg space-y-3">
            <Badge variant="exam" size="sm" className="bg-white/20 text-white border-none">
              <Sparkles className="w-3.5 h-3.5" /> Target UTBK / SNBT
            </Badge>
            <h3 className="text-lg font-black leading-snug">
              Siap Hadapi UTBK dengan Simulasi Terstandar?
            </h3>
            <p className="text-xs text-indigo-100 leading-relaxed">
              Ikuti tryout simulasi 30 menit dengan penilaian IRT dan analisis kelemahan subtes.
            </p>
            <Link to="/tryout" className="block pt-1">
              <Button fullWidth size="md" className="bg-white text-indigo-900 hover:bg-slate-100 font-extrabold">
                Buka Paket Tryout →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
