import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Zap,
  Layers,
  Star,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { coursesApi } from '../../api/courses.api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';

export const CourseCatalogPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: coursesApi.getCategories,
  });

  const { data: courses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ['courses', selectedCategory, selectedLevel, searchQuery],
    queryFn: () =>
      coursesApi.getCourses({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        level: selectedLevel !== 'all' ? selectedLevel : undefined,
        search: searchQuery || undefined,
      }),
  });

  const levelLabels: Record<string, string> = {
    BEGINNER: 'Pemula',
    INTERMEDIATE: 'Menengah',
    ADVANCED: 'Mahir',
    UTBK: 'Target UTBK',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="glass-hero rounded-3xl p-8 sm:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <Badge variant="streak" size="sm" className="bg-amber-50 border border-amber-200 text-amber-700">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Katalog Belajar Interaktif
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-800">
            Pilih Materi &amp; Capai <span className="text-shimmer">Target Belajarmu</span>
          </h1>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            Materi disusun bertahap dari pemahaman konsep, contoh soal aplikatif, kuis kilat, hingga pembahasan mendalam standar UTBK/SNBT.
          </p>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kursus atau topik pelajaran..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-all"
            />
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Level:
            </span>
            {['all', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'UTBK'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap transition-all ${
                  selectedLevel === lvl
                    ? 'bg-cyan-600/80 backdrop-blur-md border border-cyan-400/50 text-white shadow-md shadow-cyan-500/25'
                    : 'bg-white/80 border border-slate-200 text-slate-600 hover:bg-white hover:text-slate-800'
                }`}
              >
                {lvl === 'all' ? 'Semua Tingkat' : levelLabels[lvl] || lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-cyan-600/80 backdrop-blur-md border border-cyan-400/50 text-white shadow-md shadow-cyan-500/25'
                : 'bg-white/80 border border-slate-200 text-slate-600 hover:bg-white hover:text-slate-800'
            }`}
          >
            Semua Kategori
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-cyan-600/80 backdrop-blur-md border border-cyan-400/50 text-white shadow-md shadow-cyan-500/25'
                  : 'bg-white/80 border border-slate-200 text-slate-600 hover:bg-white hover:text-slate-800'
              }`}
            >
              <span>{cat.name}</span>
              {cat._count?.courses !== undefined && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-bold">
                  {cat._count.courses}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Course List Grid */}
      {isLoadingCourses ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-2xl animate-pulse space-y-4 p-6">
              <div className="h-6 bg-slate-200 rounded w-1/3" />
              <div className="h-8 bg-slate-200 rounded w-3/4" />
              <div className="h-16 bg-slate-200 rounded" />
              <div className="h-10 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 mx-auto flex items-center justify-center">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Tidak ada materi yang cocok</h3>
          <p className="text-sm text-slate-500">
            Coba ubah kata kunci pencarian atau pilih kategori lain untuk melihat daftar kursus.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedCategory('all');
              setSelectedLevel('all');
              setSearchQuery('');
            }}
          >
            Reset Filter
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="glass-card rounded-2xl flex flex-col justify-between p-6 space-y-5 group"
            >
              <div className="space-y-4">
                {/* Badges */}
                <div className="flex items-center justify-between">
                  <Badge variant="brand" size="sm">
                    {course.category.name}
                  </Badge>
                  <Badge variant={course.level === 'UTBK' ? 'exam' : 'neutral'} size="sm">
                    {levelLabels[course.level] || course.level}
                  </Badge>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-2">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-slate-400" />
                    {course.modulesCount} Modul
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    {course.lessonsCount} Lesson
                  </span>
                  {course.quizzesCount > 0 && (
                    <span className="flex items-center gap-1.5 text-amber-600 font-bold">
                      <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
                      {course.quizzesCount} Kuis
                    </span>
                  )}
                </div>

                {/* User Progress if enrolled */}
                {course.userProgress && (
                  <div className="pt-2 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>Progres Kamu</span>
                      <span className="text-indigo-600 font-extrabold">
                        {course.userProgress.progressPercent}% Selesai
                      </span>
                    </div>
                    <ProgressBar
                      value={course.userProgress.progressPercent}
                      variant="brand"
                      animated={false}
                    />
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-200/70">
                <Link to={`/courses/${course.slug}`}>
                  <button className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm bg-cyan-500/80 backdrop-blur-md border border-cyan-300/50 text-white shadow-lg shadow-cyan-500/30 hover:bg-cyan-400/90 hover:shadow-cyan-500/50 hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5 btn-press">
                    {course.userProgress && course.userProgress.progressPercent > 0
                      ? 'Lanjutkan Belajar'
                      : 'Buka Kursus'}{' '}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
