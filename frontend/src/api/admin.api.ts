import { apiClient } from './client';

export interface AdminStatsResponse {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalCourses: number;
    totalLessons: number;
    totalQuestions: number;
    totalQuizAttempts: number;
    totalExamAttempts: number;
    averageQuizScore: number;
    averageExamScore: number;
  };
  popularCourses: Array<{
    id: string;
    title: string;
    category: string;
    enrolledCount: number;
  }>;
}

export interface AdminUserItem {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  avatarUrl?: string | null;
  role: 'USER' | 'ADMIN';
  xp: number;
  level: number;
  streak: number;
  lastActiveAt?: string;
  createdAt: string;
}

export const adminApi = {
  getStats: async (): Promise<AdminStatsResponse> => {
    const res = await apiClient.get<AdminStatsResponse>('/admin/stats');
    return res.data;
  },

  getUsers: async (search?: string): Promise<AdminUserItem[]> => {
    const res = await apiClient.get<AdminUserItem[]>('/admin/users', {
      params: { search },
    });
    return res.data;
  },

  updateUserRole: async (userId: string, role: 'USER' | 'ADMIN') => {
    const res = await apiClient.patch(`/admin/users/${userId}/role`, { role });
    return res.data;
  },

  createCourse: async (data: any) => {
    const res = await apiClient.post('/admin/courses', data);
    return res.data;
  },

  deleteCourse: async (id: string) => {
    const res = await apiClient.delete(`/admin/courses/${id}`);
    return res.data;
  },
};
