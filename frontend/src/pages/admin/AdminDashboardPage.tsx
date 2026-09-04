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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white shadow">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Panel Administrasi LearnOut</h1>
            <p className="text-xs text-slate-400">
              Pusat analitik platform, pengelolaan kurikulum kursus, dan data pengguna.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Statistik
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'courses'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Kelola Kursus
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
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
            <Card className="p-5 border border-slate-200">
              <span className="text-xs font-bold text-slate-400 block">Total Pengguna</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {overview.totalUsers}
              </span>
              <span className="text-[11px] text-emerald-600 font-bold">
                ● {overview.activeUsers} aktif minggu ini
              </span>
            </Card>

            <Card className="p-5 border border-slate-200">
              <span className="text-xs font-bold text-slate-400 block">Total Kursus / Modul</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {overview.totalCourses} Kursus
              </span>
              <span className="text-[11px] text-indigo-600 font-bold">
                {overview.totalLessons} Pelajaran tersedia
              </span>
            </Card>

            <Card className="p-5 border border-slate-200">
              <span className="text-xs font-bold text-slate-400 block">Bank Soal & Kuis</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {overview.totalQuestions} Soal
              </span>
              <span className="text-[11px] text-slate-500 font-semibold">
                {overview.totalQuizAttempts} kali dikerjakan
              </span>
            </Card>

            <Card className="p-5 border border-slate-200">
              <span className="text-xs font-bold text-slate-400 block">Rata-rata Nilai</span>
              <span className="text-2xl font-black text-amber-600 mt-1 block">
                {overview.averageQuizScore}%
              </span>
              <span className="text-[11px] text-slate-500 font-semibold">
                Skor kuis peserta
              </span>
            </Card>
          </div>

          {/* Popular Courses */}
          {stats?.popularCourses && stats.popularCourses.length > 0 && (
            <Card className="p-6 border border-slate-200 space-y-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-600" /> Kursus Terpopuler
              </h3>
              <div className="divide-y divide-slate-100">
                {stats.popularCourses.map((c) => (
                  <div key={c.id} className="py-3 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{c.title}</h4>
                      <span className="text-xs text-slate-400">{c.category}</span>
                    </div>
                    <span className="text-xs font-black bg-brand-50 text-brand-700 px-3 py-1 rounded-full border border-brand-200">
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
            <h2 className="text-xl font-black text-slate-900">Daftar Kursus Platform</h2>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddCourseModal(true)}
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" /> Tambah Kursus Baru
            </Button>
          </div>

          <Card className="p-0 border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 text-xs font-bold text-slate-400 flex items-center justify-between">
              <span>JUDUL & KATEGORI</span>
              <span>LEVEL & AKSI</span>
            </div>
            <div className="divide-y divide-slate-100">
              {courses.map((c) => (
                <div key={c.id} className="p-5 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">{c.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {c.category.name} • {c.modulesCount} Modul • {c.lessonsCount} Lesson
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="neutral" size="sm">{c.level}</Badge>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus kursus '${c.title}'?`)) {
                          deleteCourseMutation.mutate(c.id);
                        }
                      }}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
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
            <h2 className="text-xl font-black text-slate-900">Manajemen Pengguna</h2>
            <input
              type="text"
              placeholder="Cari user / email..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              className="px-4 py-2 border rounded-xl text-xs font-bold w-full sm:w-64"
            />
          </div>

          <Card className="p-0 border border-slate-200 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {usersList.map((u) => (
                <div key={u.id} className="p-5 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        u.avatarUrl ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`
                      }
                      alt={u.username}
                      className="w-10 h-10 rounded-xl bg-slate-100"
                    />
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        {u.username}
                        <Badge variant={u.role === 'ADMIN' ? 'exam' : 'neutral'} size="sm">
                          {u.role}
                        </Badge>
                      </h4>
                      <p className="text-xs text-slate-400">
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-6 space-y-4 bg-white shadow-2xl">
            <h3 className="text-lg font-black text-slate-900">Tambah Kursus Baru</h3>
            <div className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-slate-600 mb-1">Judul Kursus</label>
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
                  className="w-full p-2.5 border rounded-xl"
                  placeholder="Contoh: Logika & Penalaran Kuantitatif"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Slug URL</label>
                <input
                  type="text"
                  value={newCourse.slug}
                  onChange={(e) => setNewCourse({ ...newCourse, slug: e.target.value })}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Kategori</label>
                <select
                  value={newCourse.categoryId}
                  onChange={(e) => setNewCourse({ ...newCourse, categoryId: e.target.value })}
                  className="w-full p-2.5 border rounded-xl"
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
                <label className="block text-slate-600 mb-1">Deskripsi Singkat</label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  className="w-full p-2.5 border rounded-xl h-20"
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
