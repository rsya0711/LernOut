import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Zap,
  PlayCircle,
  Award,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { coursesApi } from '../../api/courses.api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';

export const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const {
    data: course,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['course', slug],
    queryFn: () => coursesApi.getCourseBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48 animate-pulse" />
        <div className="h-40 bg-slate-200 rounded-2xl animate-pulse" />
        <div className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Kursus tidak ditemukan</h2>
        <p className="text-sm text-slate-500">
          {(error as any)?.message || 'Kursus yang kamu cari mungkin telah dipindahkan atau dihapus.'}
        </p>
        <Link to="/courses">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Katalog
          </Button>
        </Link>
      </div>
    );
  }

  // Find first uncompleted lesson for "Lanjut Belajar" CTA
  let firstUncompletedLessonId: string | null = null;
  for (const mod of course.modules) {
    for (const les of mod.lessons) {
      if (!les.isCompleted) {
        firstUncompletedLessonId = les.id;
        break;
      }
    }
    if (firstUncompletedLessonId) break;
  }
  // If all completed, default to the first lesson
  const nextTargetLessonId =
    firstUncompletedLessonId || course.modules[0]?.lessons[0]?.id;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb */}
      <div>
        <Link
          to="/courses"
          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Katalog Kursus
        </Link>
      </div>

      {/* Course Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-100 shadow-card space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="brand">{course.category.name}</Badge>
            <Badge variant={course.level === 'UTBK' ? 'exam' : 'neutral'}>
              Level: {course.level}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1">
              <Layers className="w-4 h-4 text-slate-400" /> {course.modules.length} Modul
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4 text-slate-400" /> {course.totalLessons} Pelajaran
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {course.title}
          </h1>
          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
            {course.description}
          </p>
        </div>

        {/* Progress & CTA */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="w-full sm:w-1/2 space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-600">
              <span>Progres Belajar</span>
              <span className="text-brand-600 font-extrabold">
                {course.completedLessons} dari {course.totalLessons} Selesai (
                {course.totalLessons > 0
                  ? Math.round((course.completedLessons / course.totalLessons) * 100)
                  : 0}
                %)
              </span>
            </div>
            <ProgressBar
              value={
                course.totalLessons > 0
                  ? Math.round((course.completedLessons / course.totalLessons) * 100)
                  : 0
              }
              variant="brand"
            />
          </div>

          {nextTargetLessonId && (
            <Link to={`/lessons/${nextTargetLessonId}`}>
              <Button size="lg" variant="primary" className="gap-2 shadow-button-brand w-full sm:w-auto">
                <PlayCircle className="w-5 h-5" />
                {course.completedLessons > 0 ? 'Lanjutkan Belajar' : 'Mulai Belajar Sekarang'}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Modules and Lessons Tree */}
      <div className="space-y-6">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <Layers className="w-5 h-5 text-brand-600" /> Kurikulum & Alur Pembelajaran
        </h2>

        <div className="space-y-6">
          {course.modules.map((module, modIdx) => (
            <div
              key={module.id}
              className="bg-white rounded-2xl border-2 border-slate-100 shadow-sm overflow-hidden"
            >
              {/* Module Header */}
              <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-brand-700 bg-brand-100 px-2 py-0.5 rounded">
                    Modul {modIdx + 1}
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-800 mt-1">
                    {module.title}
                  </h3>
                  {module.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{module.description}</p>
                  )}
                </div>
                <Badge variant="neutral" size="sm">
                  {module.lessons.length} Lesson
                </Badge>
              </div>

              {/* Lessons List in this Module */}
              <div className="divide-y divide-slate-100">
                {module.lessons.map((lesson, lesIdx) => (
                  <Link
                    key={lesson.id}
                    to={`/lessons/${lesson.id}`}
                    className="flex items-center justify-between p-4 sm:p-5 hover:bg-brand-50/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs transition-transform group-hover:scale-110 ${
                          lesson.isCompleted
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600 group-hover:bg-brand-500 group-hover:text-white'
                        }`}
                      >
                        {lesson.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          `${modIdx + 1}.${lesIdx + 1}`
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-800 group-hover:text-brand-700 transition-colors">
                          {lesson.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {lesson.durationMinutes} Menit
                          </span>
                          <span className="flex items-center gap-1 text-amber-600 font-bold">
                            <Zap className="w-3 h-3 fill-amber-500 text-amber-500" /> +{lesson.xpReward} XP
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {lesson.isCompleted ? (
                        <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                          Selesai ✓
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-brand-700 bg-brand-50 px-3 py-1.5 rounded-xl group-hover:bg-brand-500 group-hover:text-white transition-colors">
                          Pelajari →
                        </span>
                      )}
                    </div>
                  </Link>
                ))}

                {/* Module Quiz Card if exists */}
                {module.quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="p-4 sm:p-5 bg-amber-50/40 flex items-center justify-between border-t-2 border-dashed border-amber-200"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-button-streak">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-slate-900">
                            {quiz.title}
                          </h4>
                          <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                            Evaluasi Modul
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {quiz._count.questions} Soal Pilihan Ganda • Passing Score: {quiz.passingScore}%
                        </p>
                      </div>
                    </div>

                    <Link to={`/quizzes/${quiz.id}`}>
                      <Button size="sm" variant="streak" className="text-xs">
                        Mulai Kuis (+{quiz.xpReward} XP)
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
