import { apiClient } from './client';

export interface LessonDetail {
  id: string;
  title: string;
  slug?: string;
  content: string;
  durationMinutes: number;
  xpReward: number;
  orderIndex: number;
  isCompleted: boolean;
  module: {
    id: string;
    title: string;
    course: {
      id: string;
      title: string;
      slug: string;
    };
  };
  navigation: {
    prevLesson?: { id: string; title: string; orderIndex: number } | null;
    nextLesson?: { id: string; title: string; orderIndex: number } | null;
    moduleQuiz?: { id: string; title: string } | null;
  };
}

export interface CompleteLessonResponse {
  message: string;
  awardedXp: number;
  isFirstTime: boolean;
  lessonProgress: {
    id: string;
    isCompleted: boolean;
    completedAt: string;
  };
  courseProgress: {
    progressPercent: number;
    isCompleted: boolean;
  };
}

export const lessonsApi = {
  getLessonById: async (id: string): Promise<LessonDetail> => {
    const res = await apiClient.get<LessonDetail>(`/lessons/${id}`);
    return res.data;
  },

  completeLesson: async (id: string): Promise<CompleteLessonResponse> => {
    const res = await apiClient.post<CompleteLessonResponse>(`/lessons/${id}/complete`);
    return res.data;
  },
};
