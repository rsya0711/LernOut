import React, { useState } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Trophy,
  BarChart3,
  Lightbulb,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from 'lucide-react';
import { examsApi, ExamResultResponse } from '../../api/exams.api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const TryoutResultPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  const initialResult = (location.state as { result?: ExamResultResponse })?.result;

  const {
    data: result = initialResult,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['examResult', attemptId],
    queryFn: () => examsApi.getAttemptResult(attemptId!),
    enabled: !initialResult && !!attemptId,
    initialData: initialResult,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="text-center space-y-4 glass-card p-8 rounded-3xl border border-white/90 shadow-lg">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700">Menghitung Skor Skala UTBK (IRT)...</p>
        </div>
      </div>
    );
  }

  if (isError || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <Card className="glass-card max-w-md w-full text-center space-y-4 p-8 border border-white/90 shadow-xl rounded-3xl">
          <HelpCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Hasil Tryout Tidak Ditemukan</h2>
          <Button variant="outline" onClick={() => navigate('/tryout')}>
            Kembali ke Katalog Tryout
          </Button>
        </Card>
      </div>
    );
  }

  const { summary, categoryBreakdown, review, examTitle } = result;

  const toggleExpand = (questionId: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const optionLetters = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        {/* Top Result Banner */}
        <div className="glass-hero rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-xl border border-white/90 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute -top-16 -right-16 w-60 h-60 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 text-center md:text-left relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-black uppercase tracking-wider text-indigo-700">
              <Trophy className="w-4 h-4 text-amber-500" /> Rapor Hasil UTBK SNBT
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-800 tracking-tight">
              <span className="text-shimmer">{examTitle}</span>
            </h1>
            <p className="text-slate-600 text-sm max-w-xl leading-relaxed">
              Simulasi selesai dengan akurasi <strong className="text-slate-800">{summary.accuracy}%</strong>. Skor akhir dihitung dengan simulasi pembobotan Item Response Theory (IRT).
            </p>
          </div>

          {/* Scaled Score Circle */}
          <div className="w-36 h-36 rounded-3xl glass-card border-2 border-indigo-200/80 flex flex-col items-center justify-center shadow-lg p-2 shrink-0 relative z-10">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
              Skor UTBK
            </span>
            <span className="text-4xl font-black text-slate-800 my-0.5">
              {summary.scaledScore}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">Skala 200 - 850</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Card className="glass-card p-4 border border-white/90 text-center shadow-sm rounded-2xl">
            <span className="text-xs text-slate-500 font-bold block">Total Soal</span>
            <span className="text-xl font-black text-slate-800">{summary.totalQuestions}</span>
          </Card>
          <Card className="glass-card p-4 border border-white/90 text-center shadow-sm rounded-2xl">
            <span className="text-xs text-emerald-700 font-bold block">Benar</span>
            <span className="text-xl font-black text-emerald-800">{summary.correctCount}</span>
          </Card>
          <Card className="glass-card p-4 border border-white/90 text-center shadow-sm rounded-2xl">
            <span className="text-xs text-rose-700 font-bold block">Salah</span>
            <span className="text-xl font-black text-rose-800">{summary.incorrectCount}</span>
          </Card>
          <Card className="glass-card p-4 border border-white/90 text-center shadow-sm rounded-2xl">
            <span className="text-xs text-slate-500 font-bold block">Kosong</span>
            <span className="text-xl font-black text-slate-800">{summary.emptyCount}</span>
          </Card>
          <Card className="glass-card p-4 border border-white/90 text-center col-span-2 sm:col-span-1 shadow-sm rounded-2xl">
            <span className="text-xs text-amber-700 font-bold block">Reward XP</span>
            <span className="text-xl font-black text-amber-700">+{summary.xpEarned} XP</span>
          </Card>
        </div>

        {/* Subtest Category Breakdown Table */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" /> Analisis Breakdown Subtes
          </h2>

          <Card className="glass-card p-0 border border-white/90 overflow-hidden shadow-sm rounded-2xl">
            <div className="bg-white/60 backdrop-blur-md px-6 py-3.5 border-b border-slate-200/60 flex items-center justify-between text-xs font-bold text-slate-600">
              <span>SUBTES / KOMPONEN</span>
              <div className="flex gap-8">
                <span>BENAR / TOTAL</span>
                <span>AKURASI</span>
                <span>SKOR SUBTES</span>
              </div>
            </div>
            <div className="divide-y divide-slate-200/60">
              {categoryBreakdown.map((cat, idx) => (
                <div
                  key={idx}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/50 transition-colors"
                >
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-extrabold text-slate-800">{cat.category}</h4>
                    <span className="text-xs text-slate-500">
                      Salah: {cat.incorrect} • Kosong: {cat.empty}
                    </span>
                  </div>

                  <div className="flex items-center gap-8 text-xs font-bold">
                    <span className="text-slate-600">
                      {cat.correct} / {cat.total}
                    </span>
                    <span className="text-indigo-600 font-extrabold w-12 text-right">
                      {cat.accuracy}%
                    </span>
                    <span className="text-indigo-700 font-black text-sm bg-indigo-50/80 px-2.5 py-1 rounded-lg border border-indigo-200/80 w-16 text-center shadow-sm">
                      {cat.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Questions and Discussions */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" /> Pembahasan Soal Tryout
            </h2>
            <Link to="/tryout">
              <Button variant="outline" size="sm" className="gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" /> Uji Paket Lain
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {review.map((item, idx) => {
              const isExpanded = expandedQuestions[item.questionId] ?? true;

              return (
                <div
                  key={item.questionId}
                  className={`glass-card rounded-2xl border transition-all overflow-hidden shadow-sm ${
                    item.isCorrect ? 'border-emerald-300/80 bg-emerald-50/20' : 'border-rose-300/80 bg-rose-50/20'
                  }`}
                >
                  <div
                    onClick={() => toggleExpand(item.questionId)}
                    className="p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-white/50 transition-colors"
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-black mt-0.5 ${
                          item.isCorrect
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
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
                          <Badge variant="neutral" size="sm">
                            {item.categoryTag}
                          </Badge>
                          {item.isDoubtful && (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                              Ragu-ragu
                            </span>
                          )}
                        </div>
                        <p className="text-sm sm:text-base font-bold text-slate-800 whitespace-pre-line leading-relaxed">
                          {item.prompt}
                        </p>
                      </div>
                    </div>

                    <button className="text-slate-400 hover:text-slate-600 p-1 transition-colors">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-6 pt-2 border-t border-slate-200/60 space-y-4">
                      {/* Options */}
                      <div className="space-y-2">
                        {item.options.map((opt, optIdx) => {
                          const letter = optionLetters[optIdx] || String(optIdx + 1);
                          const isUserPick = opt.text === item.userSelectedText;
                          const isRight = opt.isCorrect;

                          let style = 'border-slate-200/80 bg-white/70 text-slate-700';
                          if (isRight) {
                            style = 'border-emerald-300 bg-emerald-50/90 text-emerald-950 font-bold';
                          } else if (isUserPick && !isRight) {
                            style = 'border-rose-300 bg-rose-50/90 text-rose-950 font-bold';
                          }

                          return (
                            <div
                              key={opt.id}
                              className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs sm:text-sm ${style}`}
                            >
                              <div className="flex items-start gap-3">
                                <span className="font-extrabold w-5">{letter}.</span>
                                <span>{opt.text}</span>
                              </div>
                              <div className="shrink-0">
                                {isRight && (
                                  <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                                    Kunci Jawaban
                                  </span>
                                )}
                                {isUserPick && !isRight && (
                                  <span className="text-[11px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-200">
                                    Jawabanmu
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {item.explanation && (
                        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-1 text-xs sm:text-sm">
                          <div className="flex items-center gap-1.5 font-black text-amber-900">
                            <Lightbulb className="w-4 h-4 text-amber-600" />
                            <span>Pembahasan Jawaban:</span>
                          </div>
                          <p className="text-slate-700 leading-relaxed pl-5">
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
