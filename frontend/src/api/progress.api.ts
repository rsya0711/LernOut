import { apiClient } from './client';

export interface UserProgressResponse {
  user: {
    id: string;
    username: string;
    fullName?: string;
    avatarUrl?: string;
    streak: number;
    lastActiveAt?: string;
  };
  gamification: {
    xp: number;
    level: number;
    currentXp: number;
    currentLevelBaseXp: number;
    nextLevelTargetXp: number;
    xpNeededForNextLevel: number;
    progressPercent: number;
    streakDays: number;
  };
  stats: {
    totalLessonsCompleted: number;
    totalQuizzesAttempted: number;
    totalQuestionsAnswered: number;
    totalCorrectAnswers: number;
    overallAccuracy: number;
  };
  activeCourses: Array<{
    id: string;
    title: string;
    slug: string;
    category: string;
    thumbnail?: string;
    level: string;
    progressPercent: number;
    isCompleted: boolean;
    enrolledAt: string;
    updatedAt: string;
  }>;
  recentQuizAttempts: Array<{
    id: string;
    quizTitle: string;
    score: number;
    isPassed: boolean;
    xpEarned: number;
    completedAt: string;
  }>;
  weeklyStreakHistory: Array<{
    id: string;
    date: string;
    xpEarned: number;
  }>;
}

export const progressApi = {
  getUserProgress: async (): Promise<UserProgressResponse> => {
    const res = await apiClient.get<UserProgressResponse>('/progress/me');
    return res.data;
  },

  getUserActivity: async () => {
    const res = await apiClient.get('/progress/activity');
    return res.data;
  },
};

export const usersApi = {
  getMe: async () => {
    const res = await apiClient.get('/users/me');
    return res.data;
  },

  updateProfile: async (data: { fullName?: string; avatarUrl?: string }) => {
    const res = await apiClient.patch('/users/me', data);
    return res.data;
  },
};
