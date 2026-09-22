import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Send,
  Zap,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { quizzesApi, QuizAnswerItem } from '../../api/quizzes.api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';

export const QuizEnginePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State: Current question index (0-indexed)
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // State: Answers map { [questionId]: selectedOptionId }
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  // State: Exit modal and submit confirmation modal
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState<boolean>(false);

  // Query: Fetch quiz payload
  const {
    data: quiz,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['quiz', id],
    queryFn: () => quizzesApi.getQuizById(id!),
    enabled: !!id,
  });

  // Mutation: Submit quiz
  const submitMutation = useMutation({
    mutationFn: (answers: QuizAnswerItem[]) =>
      quizzesApi.submitQuiz(id!, { answers }),
    onSuccess: (data) => {
      // Navigate to result review page
      navigate(`/quizzes/result/${data.attemptId}`, {
        state: { result: data },
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="max-w-md w-full text-center space-y-4 glass-card p-8 rounded-3xl border border-white/90 shadow-lg">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700">Menyiapkan Lembar Kuis...</p>
        </div>
      </div>
    );
  }

  if (isError || !quiz || quiz.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <Card className="glass-card max-w-md w-full text-center space-y-4 p-8 border border-white/90 shadow-xl rounded-3xl">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Kuis Tidak Tersedia</h2>
          <p className="text-xs sm:text-sm text-slate-600">
            {(error as any)?.message || 'Kuis belum memiliki daftar pertanyaan yang valid.'}
          </p>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Kembali
          </Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const handleSelectOption = (optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmitAttempt = () => {
    const formattedAnswers: QuizAnswerItem[] = quiz.questions.map((q) => ({
      questionId: q.id,
      selectedOptionId: selectedAnswers[q.id] || undefined,
    }));

    submitMutation.mutate(formattedAnswers);
  };

  const optionLetters = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 glass-nav border-b border-indigo-100/60 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Exit Button */}
          <button
            onClick={() => setShowExitConfirm(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-colors"
            title="Keluar dari Kuis"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Center Progress Bar */}
          <div className="flex-1 max-w-md mx-2 space-y-1">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
              <span>
                Soal <strong className="text-slate-800">{currentIndex + 1}</strong> dari{' '}
                {totalQuestions}
              </span>
              <span className="text-indigo-600 font-extrabold">{answeredCount}/{totalQuestions} Terjawab</span>
            </div>
            <ProgressBar value={progressPercent} variant="brand" animated={false} />
          </div>

          {/* XP Reward Badge */}
          <Badge variant="streak" size="sm" className="hidden sm:inline-flex gap-1 py-1.5">
            <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
            +{quiz.xpReward} XP
          </Badge>
        </div>
      </header>

      {/* Main Question Arena */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Question Palette Navigation Dots */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto py-2">
          {quiz.questions.map((q, idx) => {
            const isAnswered = !!selectedAnswers[q.id];
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-8 h-8 rounded-xl font-black text-xs transition-all ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-md scale-110 ring-2 ring-indigo-300'
                    : isAnswered
                    ? 'bg-cyan-500/80 backdrop-blur-md border border-cyan-300/50 text-white'
                    : 'glass-card border border-white/90 text-slate-500 hover:text-slate-800'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Question Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/90 shadow-xl space-y-6">
          {/* Question Tag */}
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
            <Badge variant="exam" size="sm">
              {currentQuestion.categoryTag || 'Soal Pilihan Ganda'}
            </Badge>
            <span className="text-xs font-bold text-slate-400">
              Poin: 10
            </span>
          </div>

          {/* Question Prompt */}
          <div className="text-base sm:text-lg font-extrabold text-slate-800 leading-relaxed whitespace-pre-line">
            {currentQuestion.prompt}
          </div>

          {/* Options List */}
          <div className="space-y-3 pt-2">
            {currentQuestion.options.map((option, optIdx) => {
              const letter = optionLetters[optIdx] || String(optIdx + 1);
              const isSelected = selectedAnswers[currentQuestion.id] === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(option.id)}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all flex items-start gap-4 btn-press ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/90 shadow-md shadow-indigo-500/10 text-indigo-950 font-bold'
                      : 'border-slate-200/80 bg-white/70 hover:border-indigo-300 hover:bg-white text-slate-700'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-cyan-600/80 backdrop-blur-md border border-cyan-400/50 text-white'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="text-sm sm:text-base leading-relaxed pt-0.5">
                    {option.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Bottom Sticky Action Bar */}
      <footer className="sticky bottom-0 glass-nav border-t border-indigo-100/60 p-4 shadow-lg">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          {/* Prev Button */}
          <Button
            variant="secondary"
            size="md"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </Button>

          {/* Right Action: Next or Submit */}
          <div className="flex items-center gap-3">
            {currentIndex < totalQuestions - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 py-2.5 px-5 rounded-xl font-bold text-sm bg-cyan-500/80 backdrop-blur-md border border-cyan-300/50 text-white shadow-lg shadow-cyan-500/30 hover:bg-cyan-400/90 hover:shadow-cyan-500/50 transition-all btn-press"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  if (answeredCount < totalQuestions) {
                    setShowSubmitConfirm(true);
                  } else {
                    handleSubmitAttempt();
                  }
                }}
                disabled={submitMutation.isPending}
                className="flex items-center gap-2 py-2.5 px-5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25 transition-all btn-press disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Jawaban</span>
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Confirmation Modal: Submit with Unanswered Questions */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 glass-card rounded-3xl border border-white/90">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black text-slate-800">Belum Semua Terjawab</h3>
              <p className="text-xs text-slate-500">
                Kamu masih memiliki {totalQuestions - answeredCount} soal yang belum diisi. Apakah kamu yakin ingin mengirimkan kuis sekarang?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowSubmitConfirm(false)}
              >
                Cek Ulang
              </Button>
              <Button
                variant="streak"
                size="sm"
                onClick={() => {
                  setShowSubmitConfirm(false);
                  handleSubmitAttempt();
                }}
                isLoading={submitMutation.isPending}
              >
                Tetap Kirim
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Exit Quiz */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 glass-card rounded-3xl border border-white/90">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black text-slate-800">Tinggalkan Kuis?</h3>
              <p className="text-xs text-slate-500">
                Progres pengerjaan saat ini tidak akan disimpan jika kamu keluar sebelum mengirimkan jawaban.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowExitConfirm(false)}
              >
                Lanjutkan Kuis
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-rose-600 border-rose-300 hover:bg-rose-50"
                onClick={() => navigate(-1)}
              >
                Keluar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
