import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  CheckCircle2,
  Zap,
  Clock,
  Star,
  ChevronRight,
  ChevronLeft,
  Award,
  AlertCircle,
} from 'lucide-react';
import { lessonsApi } from '../../api/lessons.api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const LessonViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [completionResult, setCompletionResult] = useState<{
    awardedXp: number;
    courseProgressPercent: number;
  } | null>(null);

  const {
    data: lesson,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['lesson', id],
    queryFn: () => lessonsApi.getLessonById(id!),
    enabled: !!id,
  });

  const completeMutation = useMutation({
    mutationFn: () => lessonsApi.completeLesson(id!),
    onSuccess: (data) => {
      setCompletionResult({
        awardedXp: data.awardedXp,
        courseProgressPercent: data.courseProgress.progressPercent,
      });
      // Invalidate queries so course list & details update progress
      queryClient.invalidateQueries({ queryKey: ['course'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['lesson', id] });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <div className="h-6 bg-slate-200 rounded w-48 animate-pulse" />
        <div className="h-10 bg-slate-200 rounded w-3/4 animate-pulse" />
        <div className="h-96 bg-slate-200 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (isError || !lesson) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Pelajaran tidak ditemukan</h2>
        <p className="text-sm text-slate-500">
          {(error as any)?.message || 'Pelajaran yang kamu tuju tidak tersedia.'}
        </p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Kembali
        </Button>
      </div>
    );
  }

  // Helper to format content paragraphs into clean modern styled blocks
  const formatContentParagraphs = (content: string) => {
    return content.split('\n\n').map((paragraph, index) => {
      const trimmed = paragraph.trim();
      if (!trimmed) return null;

      // Check if it's a section heading
      if (trimmed.startsWith('# ') || trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
        const headingText = trimmed.replace(/^#+\s*/, '');
        return (
          <h3
            key={index}
            className="text-xl sm:text-2xl font-black text-slate-900 mt-8 mb-4 border-l-4 border-brand-500 pl-3"
          >
            {headingText}
          </h3>
        );
      }

      // Check if it's a callout / note block
      if (trimmed.startsWith('>') || trimmed.toLowerCase().startsWith('catatan:')) {
        return (
          <div
            key={index}
            className="my-5 p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-200 text-amber-950 font-medium text-sm flex gap-3 items-start"
          >
            <Star className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>{trimmed.replace(/^>\s*/, '')}</div>
          </div>
        );
      }

      // Check if it's bullet list
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const items = trimmed.split('\n').map((line) => line.replace(/^[-*]\s*/, ''));
        return (
          <ul key={index} className="my-4 space-y-2 list-disc list-inside text-slate-700 leading-relaxed text-sm sm:text-base">
            {items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        );
      }

      return (
        <p
          key={index}
          className="text-slate-700 text-sm sm:text-base leading-relaxed my-3 font-normal"
        >
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen pb-28">
      {/* Top Header Navigation */}
      <div className="sticky top-16 z-30 glass-nav border-b border-indigo-100/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            to={`/courses/${lesson.module.course.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {lesson.module.course.title}
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
              {lesson.module.title}
            </span>
            <Badge variant="streak" size="sm" className="gap-1">
              <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              +{lesson.xpReward} XP
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Lesson Article Container */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/90 shadow-xl space-y-6">
          {/* Lesson Header */}
          <div className="border-b border-slate-200/70 pb-6 mb-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                Pelajaran #{lesson.orderIndex + 1}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400 font-semibold">
                <Clock className="w-3.5 h-3.5" /> {lesson.durationMinutes} Menit baca
              </span>
              {lesson.isCompleted && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 ml-auto">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-800 tracking-tight leading-snug">
              {lesson.title}
            </h1>
          </div>

          {/* Formatted Content */}
          <div className="prose prose-slate max-w-none text-slate-700">
            {formatContentParagraphs(lesson.content)}
          </div>

          {/* Success Reward Banner if Completed */}
          {completionResult && (
            <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg text-2xl">
                  🎉
                </div>
                <div>
                  <h4 className="text-base font-black text-emerald-900">
                    Pelajaran Berhasil Diselesaikan!
                  </h4>
                  <p className="text-xs font-bold text-emerald-700 mt-0.5">
                    {completionResult.awardedXp > 0
                      ? `Selamat! Kamu mendapatkan +${completionResult.awardedXp} XP.`
                      : 'Progres pelajaran kamu telah tercatat.'}{' '}
                    Total progres kursus: {completionResult.courseProgressPercent}%.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 glass-nav border-t border-indigo-100/60 p-4 shadow-xl">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          {/* Previous Lesson */}
          {lesson.navigation.prevLesson ? (
            <Link to={`/lessons/${lesson.navigation.prevLesson.id}`}>
              <Button variant="secondary" size="md" className="gap-1.5">
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Sebelumnya</span>
              </Button>
            </Link>
          ) : (
            <div />
          )}

          {/* Complete / Next Action */}
          <div className="flex items-center gap-3">
            {!lesson.isCompleted && !completionResult && (
              <button
                onClick={() => completeMutation.mutate()}
                disabled={completeMutation.isPending}
                className="flex items-center gap-2 py-3 px-6 rounded-xl font-bold text-sm bg-indigo-500 hover:bg-indigo-400 text-white shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:-translate-y-0.5 btn-press disabled:opacity-50"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Tandai Selesai (+{lesson.xpReward} XP)</span>
              </button>
            )}

            {/* Next Lesson or Quiz button */}
            {lesson.navigation.nextLesson ? (
              <Link to={`/lessons/${lesson.navigation.nextLesson.id}`}>
                <button className="flex items-center gap-1.5 py-3 px-6 rounded-xl font-bold text-sm bg-indigo-500 hover:bg-indigo-400 text-white shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:-translate-y-0.5 btn-press">
                  <span>Lanjut Pelajaran</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            ) : lesson.navigation.moduleQuiz ? (
              <Link to={`/quizzes/${lesson.navigation.moduleQuiz.id}`}>
                <Button variant="streak" size="lg" className="gap-1.5 shadow-lg shadow-orange-500/20">
                  <Award className="w-5 h-5" />
                  <span>Kuis Modul</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Link to={`/courses/${lesson.module.course.slug}`}>
                <button className="flex items-center gap-1.5 py-3 px-6 rounded-xl font-bold text-sm bg-indigo-500 hover:bg-indigo-400 text-white shadow-xl shadow-indigo-500/30 transition-all btn-press">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Selesai Modul</span>
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
