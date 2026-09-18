import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldAlert,
  Plus,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { coursesApi } from '../../api/courses.api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const AdminDashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'analytics' | 'courses' | 'users'>('analytics');
  const [showAddCourseModal, setShowAddCourseModal] = useState<boolean>(false);
  const [searchUser, setSearchUser] = useState<string>('');

  // Form state for new course
  const [newCourse, setNewCourse] = useState({
    title: '',
    slug: '',
    description: '',
    categoryId: '',
    level: 'BEGINNER',
    isPublished: true,
  });

  const { data: stats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: adminApi.getStats,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesApi.getCourses(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: coursesApi.getCategories,
  });

  const { data: usersList = [] } = useQuery({
    queryKey: ['adminUsers', searchUser],
    queryFn: () => adminApi.getUsers(searchUser || undefined),
  });

  const createCourseMutation = useMutation({
    mutationFn: adminApi.createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      setShowAddCourseModal(false);
      setNewCourse({
        title: '',
        slug: '',
        description: '',
        categoryId: '',
        level: 'BEGINNER',
        isPublished: true,
      });
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: adminApi.deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'USER' | 'ADMIN' }) =>
      adminApi.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });

  const overview = stats?.overview || {
    totalUsers: 0,
    activeUsers: 0,
    totalCourses: 0,
    totalLessons: 0,
    totalQuestions: 0,
    totalQuizAttempts: 0,
    totalExamAttempts: 0,
    averageQuizScore: 0,
    averageExamScore: 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative">
      {/* Admin Header */}
      <div className="glass-hero rounded-3xl p-6 sm:p-8 shadow-xl border border-white/90 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute -top-16 -right-16 w-60 h-60 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-500/25">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Panel <span className="text-shimmer">Administrasi</span> LearnOut
            </h1>
            <p className="text-xs text-slate-600">
              Pusat analitik platform, pengelolaan kurikulum kursus, dan data pengguna.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 shadow-sm relative z-10">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            Statistik
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'courses'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            Kelola Kursus
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            Pengguna
          </button>
        </div>
      </div>

      {/* Tab 1: Analytics & Metrics */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="glass-card p-5 border border-white/90 shadow-sm rounded-2xl">
              <span className="text-xs font-bold text-slate-500 block">Total Pengguna</span>
              <span className="text-2xl font-black text-slate-800 mt-1 block">
                {overview.totalUsers}
              </span>
              <span className="text-[11px] text-emerald-700 font-bold">
                ● {overview.activeUsers} aktif minggu ini
              </span>
            </Card>

            <Card className="glass-card p-5 border border-white/90 shadow-sm rounded-2xl">
              <span className="text-xs font-bold text-slate-500 block">Total Kursus / Modul</span>
              <span className="text-2xl font-black text-slate-800 mt-1 block">
                {overview.totalCourses} Kursus
              </span>
              <span className="text-[11px] text-indigo-700 font-bold">
                {overview.totalLessons} Pelajaran tersedia
              </span>
            </Card>

            <Card className="glass-card p-5 border border-white/90 shadow-sm rounded-2xl">
              <span className="text-xs font-bold text-slate-500 block">Bank Soal & Kuis</span>
              <span className="text-2xl font-black text-slate-800 mt-1 block">
                {overview.totalQuestions} Soal
              </span>
              <span className="text-[11px] text-slate-500 font-semibold">
                {overview.totalQuizAttempts} kali dikerjakan
              </span>
            </Card>

            <Card className="glass-card p-5 border border-white/90 shadow-sm rounded-2xl">
              <span className="text-xs font-bold text-slate-500 block">Rata-rata Nilai</span>
              <span className="text-2xl font-black text-amber-700 mt-1 block">
                {overview.averageQuizScore}%
              </span>
              <span className="text-[11px] text-slate-500 font-semibold">
                Skor kuis peserta
              </span>
            </Card>
          </div>

          {/* Popular Courses */}
          {stats?.popularCourses && stats.popularCourses.length > 0 && (
            <Card className="glass-card p-6 border border-white/90 space-y-4 shadow-sm rounded-2xl">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" /> Kursus Terpopuler
              </h3>
              <div className="divide-y divide-slate-200/60">
                {stats.popularCourses.map((c) => (
                  <div key={c.id} className="py-3 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{c.title}</h4>
                      <span className="text-xs text-slate-500">{c.category}</span>
                    </div>
                    <span className="text-xs font-black bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200">
                      {c.enrolledCount} Pelajar
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Tab 2: Course Management */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-800">Daftar Kursus Platform</h2>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddCourseModal(true)}
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" /> Tambah Kursus Baru
            </Button>
          </div>

          <Card className="glass-card p-0 border border-white/90 overflow-hidden shadow-sm rounded-2xl">
            <div className="bg-white/60 backdrop-blur-md px-6 py-3 border-b border-slate-200/60 text-xs font-bold text-slate-600 flex items-center justify-between">
              <span>JUDUL & KATEGORI</span>
              <span>LEVEL & AKSI</span>
            </div>
            <div className="divide-y divide-slate-200/60">
              {courses.map((c) => (
                <div key={c.id} className="p-5 flex items-center justify-between hover:bg-white/50 transition-colors">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800">{c.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {c.category.name} • {c.modulesCount} Modul • {c.lessonsCount} Lesson
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="neutral" size="sm">{c.level}</Badge>
                    <a
                      href={`/admin/courses/${c.slug}/editor`}
                      className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200/60"
                    >
                      Edit Kurikulum
                    </a>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus kursus '${c.title}'?`)) {
                          deleteCourseMutation.mutate(c.id);
                        }
                      }}
                      className="p-2 text-rose-600 hover:bg-rose-50/80 rounded-lg transition-colors"
                      title="Hapus Kursus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: User Management */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-black text-slate-800">Manajemen Pengguna</h2>
            <input
              type="text"
              placeholder="Cari user / email..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              className="px-4 py-2 bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm w-full sm:w-64"
            />
          </div>

          <Card className="glass-card p-0 border border-white/90 overflow-hidden shadow-sm rounded-2xl">
            <div className="divide-y divide-slate-200/60">
              {usersList.map((u) => (
                <div key={u.id} className="p-5 flex items-center justify-between hover:bg-white/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        u.avatarUrl ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`
                      }
                      alt={u.username}
                      className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100"
                    />
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                        {u.username}
                        <Badge variant={u.role === 'ADMIN' ? 'exam' : 'neutral'} size="sm">
                          {u.role}
                        </Badge>
                      </h4>
                      <p className="text-xs text-slate-500">
                        {u.email} • Level {u.level} • 🔥 {u.streak} Hari • {u.xp} XP
                      </p>
                    </div>
                  </div>

                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() =>
                        updateRoleMutation.mutate({
                          userId: u.id,
                          role: u.role === 'ADMIN' ? 'USER' : 'ADMIN',
                        })
                      }
                    >
                      Ubah ke {u.role === 'ADMIN' ? 'USER' : 'ADMIN'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Modal: Create Course */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
          <Card className="glass-card max-w-lg w-full p-6 space-y-4 border border-white/90 shadow-2xl rounded-3xl">
            <h3 className="text-lg font-black text-slate-800">Tambah Kursus Baru</h3>
            <div className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">Judul Kursus</label>
                <input
                  type="text"
                  value={newCourse.title}
                  onChange={(e) =>
                    setNewCourse({
                      ...newCourse,
                      title: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                    })
                  }
                  className="w-full p-2.5 bg-white/80 border border-slate-200/80 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:outline-none shadow-sm"
                  placeholder="Contoh: Logika & Penalaran Kuantitatif"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Slug URL</label>
                <input
                  type="text"
                  value={newCourse.slug}
                  onChange={(e) => setNewCourse({ ...newCourse, slug: e.target.value })}
                  className="w-full p-2.5 bg-white/80 border border-slate-200/80 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:outline-none shadow-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Kategori</label>
                <select
                  value={newCourse.categoryId}
                  onChange={(e) => setNewCourse({ ...newCourse, categoryId: e.target.value })}
                  className="w-full p-2.5 bg-white/80 border border-slate-200/80 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:outline-none shadow-sm"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  className="w-full p-2.5 bg-white/80 border border-slate-200/80 rounded-xl h-20 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:outline-none shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowAddCourseModal(false)}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => createCourseMutation.mutate(newCourse)}
                disabled={!newCourse.title || !newCourse.categoryId}
                isLoading={createCourseMutation.isPending}
              >
                Simpan Kursus
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
