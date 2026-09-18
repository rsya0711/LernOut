import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Clock,
  Award,
  Star,
} from 'lucide-react';
import { examsApi } from '../../api/exams.api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

export const TryoutCatalogPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const { data: exams = [], isLoading } = useQuery({
    queryKey: ['exams'],
    queryFn: examsApi.getExams,
  });

  const { data: history = [] } = useQuery({
    queryKey: ['examHistory'],
    queryFn: examsApi.getExamHistory,
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-6">
        <div className="h-40 bg-slate-200 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero Header */}
      <div className="glass-hero rounded-3xl p-8 sm:p-12 relative overflow-hidden space-y-4 shadow-xl border border-white/90">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black uppercase tracking-wide">
            <Star className="w-3.5 h-3.5 fill-indigo-500 text-indigo-500" /> Simulasi UTBK Terpadu
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-slate-800">
            Tryout <span className="text-shimmer">UTBK / SNBT</span> Berstandar Nasional
          </h1>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-2xl">
            Simulasi ujian berwaktu dengan sistem penilaian IRT modern, navigasi palet soal, penandaan ragu-ragu, dan analisis kelemahan subtes secara otomatis.
          </p>
        </div>
      </div>

      {/* Available Exam Packages */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-600" /> Paket Simulasi Siap Dikerjakan
          </h2>
          <span className="text-xs font-bold text-slate-400">
            {exams.length} Paket Tersedia
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="exam" size="sm">
                    Simulasi UTBK
                  </Badge>
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {exam.durationMinutes} Menit
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-800 leading-snug">
                    {exam.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {exam.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold text-slate-500 pt-2 border-t border-slate-200/70">
                  <span>{exam.totalQuestions} Butir Soal</span>
                  <span>•</span>
                  <span>Target Skor: {exam.passingScore}</span>
                  {exam.bestScore && (
                    <>
                      <span>•</span>
                      <span className="text-indigo-600 font-extrabold">
                        Skor Tertinggi: {exam.bestScore}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5 btn-press"
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login');
                    } else {
                      navigate(`/tryout/${exam.id}/exam`);
                    }
                  }}
                >
                  <GraduationCap className="w-5 h-5" />
                  Mulai Simulasi Tryout
                </button>

                {exam.lastAttemptId && (
                  <Link to={`/tryout/result/${exam.lastAttemptId}`}>
                    <Button variant="secondary" size="lg" className="text-xs px-3">
                      Review
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tryout Attempt History */}
      {history.length > 0 && (
        <div className="space-y-4 pt-6">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" /> Riwayat Tryout Kamu
          </h2>

          <div className="glass-card rounded-2xl p-0 overflow-hidden border border-white/90 shadow-sm">
            <div className="divide-y divide-slate-100">
              {history.map((att: any) => (
                <div
                  key={att.id}
                  className="p-5 flex items-center justify-between hover:bg-indigo-50/30 transition-colors"
                >
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800">{att.title}</h4>
                    <span className="text-xs text-slate-400 font-semibold">
                      Selesai: {new Date(att.submittedAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-base font-black text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200">
                      Skor: {att.score}
                    </span>
                    <Link to={`/tryout/result/${att.id}`}>
                      <Button size="sm" variant="secondary" className="text-xs">
                        Lihat Rapor
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
