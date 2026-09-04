import React, { useState } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Zap,
  ArrowRight,
  RotateCcw,
  Sparkles,
  BookOpen,
  HelpCircle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { quizzesApi, QuizResultResponse } from '../../api/quizzes.api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const QuizResultPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Expanded discussion accordions { [questionId]: boolean }
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  // Use passed state result if available (immediate navigation), otherwise fetch by attemptId
  const initialResult = (location.state as { result?: QuizResultResponse })?.result;

  const {
    data: result = initialResult,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['quizAttempt', attemptId],
    queryFn: () => quizzesApi.getAttemptResult(attemptId!),
    enabled: !initialResult && !!attemptId,
    initialData: initialResult,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-600">Menghitung Skor & Analisis Jawaban...</p>
        </div>
      </div>
    );
  }

  if (isError || !result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center space-y-4 p-8">
          <HelpCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Hasil Kuis Tidak Ditemukan</h2>
          <Button variant="outline" onClick={() => navigate('/courses')}>
            Kembali ke Katalog
          </Button>
        </Card>
      </div>
    );
  }

  const { summary, review, quizTitle, nextRecommendation } = result;

  const toggleExpand = (questionId: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const optionLetters = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Celebration Card */}
        <div
          className={`rounded-3xl p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden border ${
            summary.isPassed
              ? 'bg-gradient-to-br from-emerald-700 via-brand-800 to-teal-900 border-emerald-500/50'
              : 'bg-gradient-to-br from-slate-800 via-slate-900 to-amber-950 border-amber-500/30'
          }`}
        >
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider text-white">
                <Sparkles className="w-4 h-4 text-amber-300" />
                {summary.isPassed ? 'Evaluasi Berhasil • Lulus' : 'Evaluasi Belum Memenuhi KKM'}
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
                {summary.isPassed ? 'Luar Biasa! Pemahamanmu Sangat Baik' : 'Tetap Semangat, Latihan Lagi!'}
              </h1>

              <p className="text-slate-200 text-sm leading-relaxed">
                Kamu telah menyelesaikan <strong>{quizTitle}</strong> dengan skor{' '}
                <span className="font-extrabold text-amber-300">{summary.score}%</span>{' '}
                (Standar KKM: {summary.passingScore}%).
              </p>
            </div>

            {/* XP & Score Badge Circle */}
            <div className="flex flex-col items-center">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white/10 backdrop-blur-md border-2 border-white/30 flex flex-col items-center justify-center shadow-xl p-2">
                <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300 mb-1" />
                <span className="text-2xl sm:text-3xl font-black text-white">{summary.score}%</span>
                <span className="text-[11px] font-bold text-slate-200">Akurasi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 sm:p-5 border-2 border-slate-100 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold block">Total Soal</span>
              <span className="text-lg sm:text-xl font-black text-slate-800">
                {summary.totalQuestions} Soal
              </span>
            </div>
          </Card>

          <Card className="p-4 sm:p-5 border-2 border-slate-100 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold block">Benar</span>
              <span className="text-lg sm:text-xl font-black text-emerald-700">
                {summary.correctAnswers}
              </span>
            </div>
          </Card>

          <Card className="p-4 sm:p-5 border-2 border-slate-100 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold block">Salah</span>
              <span className="text-lg sm:text-xl font-black text-rose-700">
                {summary.incorrectAnswers}
              </span>
            </div>
          </Card>

          <Card className="p-4 sm:p-5 border-2 border-slate-100 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold block">XP Diperoleh</span>
              <span className="text-lg sm:text-xl font-black text-amber-600">
                +{summary.xpEarned} XP
              </span>
            </div>
          </Card>
        </div>

        {/* Action Recommendation Banner */}
        {nextRecommendation && (
          <div className="p-6 rounded-2xl bg-white border-2 border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[11px] font-black uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                Rekomendasi Langkah Berikutnya
              </span>
              <h3 className="text-base font-extrabold text-slate-900">
                {nextRecommendation.title}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate(-1)}
                className="gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                Coba Lagi
              </Button>
              <Link to={nextRecommendation.url}>
                <Button size="md" variant="primary" className="gap-2 shadow-button-brand">
                  Lanjutkan Belajar <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Detailed Question Review & Discussions */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" /> Pembahasan & Kunci Jawaban
            </h2>
            <span className="text-xs font-bold text-slate-400">
              Klik soal untuk melihat pembahasan
            </span>
          </div>

          <div className="space-y-4">
            {review.map((item, idx) => {
              const isExpanded = expandedQuestions[item.questionId] ?? true; // Default open

              return (
                <div
                  key={item.questionId}
                  className={`bg-white rounded-2xl border-2 transition-all overflow-hidden ${
                    item.isCorrect ? 'border-emerald-200' : 'border-rose-200'
                  }`}
                >
                  {/* Question Accordion Header */}
                  <div
                    onClick={() => toggleExpand(item.questionId)}
                    className="p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50/60"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-black mt-0.5 ${
                          item.isCorrect
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {idx + 1}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={item.isCorrect ? 'success' : 'warning'}
                            size="sm"
                          >
                            {item.isCorrect ? 'Jawaban Benar ✓' : 'Jawaban Salah ✕'}
                          </Badge>
                        </div>
                        <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug whitespace-pre-line">
                          {item.prompt}
                        </p>
                      </div>
                    </div>

                    <button className="text-slate-400 p-1">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Expanded Content: Options Review & Explanation */}
                  {isExpanded && (
                    <div className="px-5 pb-6 pt-2 border-t border-slate-100 space-y-4">
                      {/* Options List with Visual State */}
                      <div className="space-y-2">
                        {item.options.map((opt, optIdx) => {
                          const letter = optionLetters[optIdx] || String(optIdx + 1);
                          const isUserPick = item.selectedOptionId === opt.id;
                          const isRight = opt.isCorrect;

                          let optionStyle =
                            'border-slate-200 bg-white text-slate-700';

                          if (isRight) {
                            optionStyle =
                              'border-emerald-400 bg-emerald-50/80 text-emerald-950 font-bold';
                          } else if (isUserPick && !isRight) {
                            optionStyle =
                              'border-rose-400 bg-rose-50/80 text-rose-950 font-bold';
                          }

                          return (
                            <div
                              key={opt.id}
                              className={`p-3.5 rounded-xl border-2 flex items-start justify-between gap-3 text-xs sm:text-sm ${optionStyle}`}
                            >
                              <div className="flex items-start gap-3">
                                <span className="font-extrabold w-5">{letter}.</span>
                                <span>{opt.text}</span>
                              </div>
                              <div className="shrink-0">
                                {isRight && (
                                  <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                    Kunci Benar
                                  </span>
                                )}
                                {isUserPick && !isRight && (
                                  <span className="text-[11px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                                    Pilihanmu
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation Callout */}
                      {item.explanation && (
                        <div className="p-4 rounded-2xl bg-amber-50/90 border-2 border-amber-200 space-y-1 text-xs sm:text-sm">
                          <div className="flex items-center gap-1.5 font-black text-amber-900">
                            <Lightbulb className="w-4 h-4 text-amber-600" />
                            <span>Pembahasan Mendalam:</span>
                          </div>
                          <p className="text-amber-950 leading-relaxed pl-5">
                            {item.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
