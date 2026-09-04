import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Clock,
  Award,
  Sparkles,
} from 'lucide-react';
import { examsApi } from '../../api/exams.api';
import { Card } from '../../components/ui/Card';
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
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-black uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" /> Simulasi UTBK Terpadu
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Tryout UTBK / SNBT Berstandar Nasional
          </h1>
          <p className="text-indigo-100 text-sm sm:text-base leading-relaxed max-w-2xl">
            Simulasi ujian berwaktu dengan sistem penilaian IRT modern, navigasi palet soal, penandaan ragu-ragu, dan analisis kelemahan subtes secara otomatis.
          </p>
        </div>
      </div>

      {/* Available Exam Packages */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-600" /> Paket Simulasi Siap Dikerjakan
          </h2>
          <span className="text-xs font-bold text-slate-400">
            {exams.length} Paket Tersedia
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exams.map((exam) => (
            <Card
              key={exam.id}
              className="p-6 sm:p-8 border-2 border-slate-100 hover:border-indigo-300 shadow-card flex flex-col justify-between space-y-6"
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
                  <h3 className="text-xl font-extrabold text-slate-900 leading-snug">
                    {exam.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {exam.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold text-slate-500 pt-2 border-t border-slate-100">
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
                <Button
                  fullWidth
                  variant="exam"
                  size="lg"
                  className="gap-2 shadow-button-exam"
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
                </Button>

                {exam.lastAttemptId && (
                  <Link to={`/tryout/result/${exam.lastAttemptId}`}>
                    <Button variant="outline" size="lg" className="text-xs px-3">
                      Review
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Tryout Attempt History */}
      {history.length > 0 && (
        <div className="space-y-4 pt-6">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" /> Riwayat Tryout Kamu
          </h2>

          <Card className="p-0 border-2 border-slate-100 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {history.map((att: any) => (
                <div
                  key={att.id}
                  className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">{att.title}</h4>
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
          </Card>
        </div>
      )}
    </div>
  );
};
