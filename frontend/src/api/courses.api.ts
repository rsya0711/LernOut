import { apiClient } from './client';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  orderIndex: number;
  _count?: {
    courses: number;
  };
}

export interface CourseListItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'UTBK';
  category: {
    id: string;
    name: string;
    slug: string;
    icon?: string;
  };
  modulesCount: number;
  lessonsCount: number;
  quizzesCount: number;
  userProgress?: {
    progressPercent: number;
    isCompleted: boolean;
  } | null;
}

export interface CourseDetailLesson {
  id: string;
  title: string;
  slug?: string;
  orderIndex: number;
  durationMinutes: number;
  xpReward: number;
  isCompleted: boolean;
}

export interface CourseDetailQuiz {
  id: string;
  title: string;
  description?: string;
  xpReward: number;
  passingScore: number;
  _count: {
    questions: number;
  };
}

export interface CourseDetailModule {
  id: string;
  title: string;
  description?: string;
  orderIndex: number;
  lessons: CourseDetailLesson[];
  quizzes: CourseDetailQuiz[];
}

export interface CourseDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'UTBK';
  category: Category;
  totalLessons: number;
  completedLessons: number;
  modules: CourseDetailModule[];
  userProgress?: {
    progressPercent: number;
    isCompleted: boolean;
  } | null;
}

export const coursesApi = {
  getCategories: async (): Promise<Category[]> => {
    const res = await apiClient.get<Category[]>('/courses/categories');
    return res.data;
  },

  getCourses: async (params?: {
    category?: string;
    search?: string;
    level?: string;
  }): Promise<CourseListItem[]> => {
    const res = await apiClient.get<CourseListItem[]>('/courses', { params });
    return res.data;
  },

  getCourseBySlug: async (slug: string): Promise<CourseDetail> => {
    const res = await apiClient.get<CourseDetail>(`/courses/${slug}`);
    return res.data;
  },

  getModuleById: async (id: string) => {
    const res = await apiClient.get(`/modules/${id}`);
    return res.data;
  },
};
