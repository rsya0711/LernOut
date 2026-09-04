import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Zap,
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { coursesApi } from '../../api/courses.api';
import { Card } from '../../components/ui/Card';
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
      <div className="bg-gradient-to-r from-brand-800 to-emerald-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <Badge variant="streak" size="sm" className="bg-amber-400 text-slate-900 border-none">
            <Sparkles className="w-3.5 h-3.5 fill-slate-900" /> Katalog Belajar Interaktif
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Pilih Materi & Capai Target Belajarmu
          </h1>
          <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
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
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Level:
            </span>
            {['all', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'UTBK'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap transition-all ${
                  selectedLevel === lvl
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
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
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-slate-300'
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
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-slate-300'
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
            <Card key={i} className="animate-pulse space-y-4 p-6">
              <div className="h-6 bg-slate-200 rounded w-1/3" />
              <div className="h-8 bg-slate-200 rounded w-3/4" />
              <div className="h-16 bg-slate-200 rounded" />
              <div className="h-10 bg-slate-200 rounded" />
            </Card>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <Card className="p-12 text-center space-y-4 max-w-lg mx-auto">
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
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card
              key={course.id}
              hoverable
              className="flex flex-col justify-between p-6 space-y-5 border-2 border-slate-100 hover:border-brand-300"
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
                  <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-brand-600 transition-colors">
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
                      <span className="text-brand-600">
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
              <div className="pt-4 border-t border-slate-100">
                <Link to={`/courses/${course.slug}`}>
                  <Button fullWidth variant="primary" className="gap-2">
                    {course.userProgress && course.userProgress.progressPercent > 0
                      ? 'Lanjutkan Belajar'
                      : 'Buka Kursus'}{' '}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
