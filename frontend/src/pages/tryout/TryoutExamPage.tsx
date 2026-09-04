import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
  Bookmark,
} from 'lucide-react';
import { examsApi, ExamQuestion, ExamAnswerItem } from '../../api/exams.api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const TryoutExamPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [examTitle, setExamTitle] = useState<string>('');
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, { selectedOptionId?: string; isDoubtful: boolean }>>({});
  const [timeLeft, setTimeLeft] = useState<number>(1800); // 30 mins default
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);

  // Initialize Exam Session
  useEffect(() => {
    if (!id) return;
    examsApi
      .startExam(id)
      .then((res) => {
        setAttemptId(res.attemptId);
        setExamTitle(res.title);
        setQuestions(res.questions);
        setTimeLeft(res.durationMinutes * 60);
        setIsLoading(false);
      })
      .catch((err) => {
        alert(err.message || 'Gagal memulai simulasi tryout.');
        navigate('/tryout');
      });
  }, [id, navigate]);

  // Real-time Countdown Timer
  useEffect(() => {
    if (isLoading || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading, timeLeft]);

  // Submit Mutation
  const submitMutation = useMutation({
    mutationFn: () => {
      const formattedAnswers: ExamAnswerItem[] = questions.map((q) => ({
        questionId: q.id,
        selectedOptionId: answers[q.id]?.selectedOptionId,
        isDoubtful: answers[q.id]?.isDoubtful || false,
      }));

      return examsApi.submitExam(attemptId!, formattedAnswers);
    },
    onSuccess: (data) => {
      navigate(`/tryout/result/${data.attemptId}`, {
        state: { result: data },
      });
    },
    onError: (err: any) => {
      alert(err.message || 'Gagal mengirimkan lembar jawaban tryout.');
    },
  });

  const handleAutoSubmit = () => {
    alert('Waktu ujian telah habis! Sistem secara otomatis mengumpulkan lembar jawaban kamu.');
    submitMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-300">Menyiapkan Ruang Simulasi UTBK...</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const totalQ = questions.length;

  // Format Time (MM:SS)
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isTimeCritical = timeLeft < 300; // < 5 mins

  // Counters
  let answeredCount = 0;
  let doubtfulCount = 0;
  let emptyCount = 0;

  questions.forEach((q) => {
    const ans = answers[q.id];
    if (ans?.selectedOptionId) {
      if (ans.isDoubtful) {
        doubtfulCount++;
      } else {
        answeredCount++;
      }
    } else {
      emptyCount++;
    }
  });

  const handleSelectOption = (optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        selectedOptionId: optionId,
        isDoubtful: prev[currentQ.id]?.isDoubtful || false,
      },
    }));
  };

  const toggleDoubtful = () => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        selectedOptionId: prev[currentQ.id]?.selectedOptionId,
        isDoubtful: !prev[currentQ.id]?.isDoubtful,
      },
    }));
  };

  const optionLetters = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top UTBK Standard Bar */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-sm shadow">
              U
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight truncate max-w-xs sm:max-w-md">
                {examTitle}
              </h2>
              <span className="text-[11px] text-indigo-300 font-bold block">
                Subtes: {currentQ?.categoryTag}
              </span>
            </div>
          </div>

          {/* Real-time Countdown Timer */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm sm:text-base font-black border transition-colors ${
                isTimeCritical
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500 animate-pulse'
                  : 'bg-slate-800 text-amber-300 border-slate-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{timeString}</span>
            </div>

            <Button
              variant="exam"
              size="sm"
              onClick={() => setShowReviewModal(true)}
              className="text-xs"
            >
              Selesai Ujian
            </Button>
          </div>
        </div>
      </header>

      {/* Main Examination Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Cols: Question & Options */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="p-6 sm:p-8 bg-white border-2 border-slate-200 shadow-sm space-y-6">
            {/* Question Subheader */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="text-sm font-black text-slate-800 uppercase tracking-wide">
                Nomor Soal: <strong className="text-indigo-600 text-lg">{currentIndex + 1}</strong> / {totalQ}
              </span>

              {/* Ragu-ragu Checkbox Toggle */}
              <button
                onClick={toggleDoubtful}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  answers[currentQ?.id]?.isDoubtful
                    ? 'bg-amber-400 text-slate-900 shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>Ragu-ragu</span>
              </button>
            </div>

            {/* Prompt */}
            <div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed whitespace-pre-line">
              {currentQ?.prompt}
            </div>

            {/* Options */}
            <div className="space-y-3 pt-2">
              {currentQ?.options.map((opt, optIdx) => {
                const letter = optionLetters[optIdx] || String(optIdx + 1);
                const isSelected = answers[currentQ.id]?.selectedOptionId === opt.id;

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3.5 btn-press ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="text-sm sm:text-base leading-relaxed pt-0.5">
                      {opt.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Question Navigation Palette */}
        <div className="space-y-4">
          <Card className="p-5 bg-white border-2 border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">
              Nomor Soal Ujian
            </h3>

            {/* Color Legend */}
            <div className="grid grid-cols-3 gap-2 text-[11px] font-bold text-slate-600 border-b border-slate-100 pb-3">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500" /> Terjawab
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-400" /> Ragu
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-200" /> Kosong
              </span>
            </div>

            {/* Grid of question buttons */}
            <div className="grid grid-cols-5 gap-2 pt-1">
              {questions.map((q, idx) => {
                const ans = answers[q.id];
                const isSelected = !!ans?.selectedOptionId;
                const isDoubtful = ans?.isDoubtful;
                const isCurrent = idx === currentIndex;

                let colorStyle = 'bg-slate-100 text-slate-600 border border-slate-200';
                if (isDoubtful) {
                  colorStyle = 'bg-amber-400 text-slate-950 font-black';
                } else if (isSelected) {
                  colorStyle = 'bg-emerald-500 text-white font-black';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl text-xs font-extrabold transition-all ${colorStyle} ${
                      isCurrent ? 'ring-2 ring-indigo-600 ring-offset-2 scale-105' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </main>

      {/* Bottom Action Footer */}
      <footer className="sticky bottom-0 bg-white border-t border-slate-200 p-4 shadow-lg z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" /> Soal Sebelumnya
          </Button>

          {currentIndex < totalQ - 1 ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => setCurrentIndex((prev) => Math.min(totalQ - 1, prev + 1))}
              className="gap-1.5"
            >
              Soal Selanjutnya <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="exam"
              size="md"
              onClick={() => setShowReviewModal(true)}
              className="gap-2 shadow-button-exam"
            >
              <Send className="w-4 h-4" /> Review & Kumpulkan
            </Button>
          )}
        </div>
      </footer>

      {/* Review Modal Before Final Submission */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150 bg-white">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-slate-900">Konfirmasi Kumpulkan Ujian</h3>
              <p className="text-xs text-slate-500">
                Periksa kembali rekapitulasi pengerjaan sebelum mengirimkan lembar jawaban.
              </p>
            </div>

            {/* Summary Counters */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-xs font-bold text-emerald-700 block">Terjawab</span>
                <span className="text-xl font-black text-emerald-800">{answeredCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-xs font-bold text-amber-700 block">Ragu-ragu</span>
                <span className="text-xl font-black text-amber-800">{doubtfulCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
                <span className="text-xs font-bold text-slate-600 block">Kosong</span>
                <span className="text-xl font-black text-slate-800">{emptyCount}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setShowReviewModal(false)}
              >
                Kembali Periksa
              </Button>
              <Button
                variant="exam"
                size="md"
                onClick={() => {
                  setShowReviewModal(false);
                  submitMutation.mutate();
                }}
                isLoading={submitMutation.isPending}
                className="gap-2 shadow-button-exam"
              >
                Kumpulkan Sekarang
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
