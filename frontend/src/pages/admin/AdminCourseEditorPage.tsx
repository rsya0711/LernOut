import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi } from '../../api/courses.api';
import { adminApi } from '../../api/admin.api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Plus, BookOpen, Layers, Target, Trash2 } from 'lucide-react';

export const AdminCourseEditorPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State for forms
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState<string | null>(null); // moduleId if open

  const [newModule, setNewModule] = useState({ title: '', description: '', orderIndex: 1 });
  const [newLesson, setNewLesson] = useState({ title: '', slug: '', content: '', durationMinutes: 5, xpReward: 20, orderIndex: 1 });

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', slug],
    queryFn: () => coursesApi.getCourseBySlug(slug!),
    enabled: !!slug,
  });

  const createModuleMutation = useMutation({
    mutationFn: (data: any) => adminApi.createModule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', slug] });
      setShowModuleForm(false);
      setNewModule({ title: '', description: '', orderIndex: (course?.modules.length || 0) + 2 });
    },
  });

  const deleteModuleMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteModule(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['course', slug] }),
  });

  const createLessonMutation = useMutation({
    mutationFn: (data: any) => adminApi.createLesson(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', slug] });
      setShowLessonForm(null);
      setNewLesson({ title: '', slug: '', content: '', durationMinutes: 5, xpReward: 20, orderIndex: 1 });
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteLesson(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['course', slug] }),
  });

  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-700 font-bold text-sm">Memuat kurikulum kursus...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-12 text-center">
        <p className="text-rose-600 font-bold text-sm">Kursus tidak ditemukan.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/admin')}>
          Kembali ke Admin
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 relative">
      {/* Header Banner */}
      <div className="glass-hero rounded-3xl p-6 sm:p-8 shadow-xl border border-white/90 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="absolute -top-16 -right-16 w-60 h-60 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <Layers className="text-indigo-600" />
              Curriculum <span className="text-shimmer">Editor</span>
            </h1>
            <p className="text-sm font-semibold text-slate-600 mt-0.5">{course.title}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {course.modules.map((mod) => (
          <Card key={mod.id} className="glass-card p-6 border border-white/90 border-l-4 border-l-indigo-600 shadow-sm rounded-2xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-black text-slate-800">{mod.title}</h3>
                {mod.description && <p className="text-slate-600 text-sm mt-1">{mod.description}</p>}
              </div>
              <Button variant="ghost" size="sm" onClick={() => deleteModuleMutation.mutate(mod.id)} className="text-rose-600 hover:bg-rose-50/80">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3 mt-4 ml-4 pl-4 border-l-2 border-indigo-200/60">
              {mod.lessons.map(lesson => (
                <div key={lesson.id} className="flex items-center justify-between p-3.5 bg-white/70 backdrop-blur-md rounded-xl border border-white/90 shadow-sm">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-800 text-sm">{lesson.title}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteLessonMutation.mutate(lesson.id)} className="text-rose-600 hover:bg-rose-50/80">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              
              {mod.quizzes.map(quiz => (
                <div key={quiz.id} className="flex items-center justify-between p-3.5 bg-amber-50/60 backdrop-blur-md rounded-xl border border-amber-200/60 border-l-4 border-l-amber-500 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Target className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-slate-800 text-sm">{quiz.title}</span>
                  </div>
                </div>
              ))}

              {showLessonForm === mod.id ? (
                <div className="p-5 glass-card border border-indigo-200/80 rounded-2xl space-y-3 mt-4 shadow-sm">
                  <h4 className="font-bold text-indigo-900 text-sm">Tambah Pelajaran Baru</h4>
                  <input
                    type="text"
                    placeholder="Judul Pelajaran"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 bg-white/90 text-slate-800 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                    value={newLesson.title}
                    onChange={e => setNewLesson({...newLesson, title: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
                  />
                  <textarea
                    placeholder="Konten (Mendukung Markdown)"
                    rows={4}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 bg-white/90 text-slate-800 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                    value={newLesson.content}
                    onChange={e => setNewLesson({...newLesson, content: e.target.value})}
                  />
                  <div className="flex gap-3 pt-1">
                    <Button size="sm" onClick={() => createLessonMutation.mutate({ ...newLesson, moduleId: mod.id })}>
                      Simpan Pelajaran
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowLessonForm(null)}>Batal</Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="mt-2 text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200/60" onClick={() => setShowLessonForm(mod.id)}>
                  <Plus className="w-4 h-4 mr-2" /> Tambah Pelajaran
                </Button>
              )}
            </div>
          </Card>
        ))}

        {showModuleForm ? (
          <Card className="glass-card p-6 border-2 border-dashed border-indigo-300 rounded-3xl space-y-4 shadow-md">
            <h3 className="text-lg font-black text-slate-800">Buat Modul Baru</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Judul Modul (contoh: Modul 1: Pendahuluan)"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 bg-white/90 text-slate-800 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                value={newModule.title}
                onChange={e => setNewModule({...newModule, title: e.target.value})}
              />
              <input
                type="text"
                placeholder="Deskripsi Singkat"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 bg-white/90 text-slate-800 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                value={newModule.description}
                onChange={e => setNewModule({...newModule, description: e.target.value})}
              />
              <div className="flex gap-3">
                <Button size="sm" onClick={() => createModuleMutation.mutate({ ...newModule, courseId: course.id })}>
                  Simpan Modul
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowModuleForm(false)}>Batal</Button>
              </div>
            </div>
          </Card>
        ) : (
          <Button
            variant="outline"
            className="w-full py-8 border-2 border-dashed border-indigo-200/80 glass-card text-slate-700 hover:text-indigo-600 hover:border-indigo-400 font-bold rounded-2xl transition-all flex items-center justify-center shadow-sm"
            onClick={() => setShowModuleForm(true)}
          >
            <Plus className="w-6 h-6 mr-2 text-indigo-600" />
            Tambah Modul Baru
          </Button>
        )}
      </div>
    </div>
  );
};
