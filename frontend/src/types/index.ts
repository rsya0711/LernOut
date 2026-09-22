export type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface User {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  avatarUrl?: string;
  role: Role;
  xp: number;
  level: number;
  streak: number;
  lastActiveAt?: string;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  icon?: string;
  bannerUrl?: string;
  modulesCount?: number;
  lessonsCount?: number;
  progressPercentage?: number;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  orderIndex: number;
  lessonsCount?: number;
  isCompleted?: boolean;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  content: string;
  orderIndex: number;
  durationMinutes: number;
  difficulty: Difficulty;
  isCompleted?: boolean;
}

export interface Quiz {
  id: string;
  lessonId?: string;
  title: string;
  description?: string;
  xpReward: number;
  passingScore: number;
  questionsCount?: number;
}

export interface Question {
  id: string;
  quizId: string;
  prompt: string;
  explanation?: string;
  orderIndex: number;
  options: Option[];
}

export interface Option {
  id: string;
  questionId: string;
  text: string;
  orderIndex: number;
}

export interface SystemHealth {
  status: string;
  uptime: number;
  timestamp: string;
  services: {
    database: string;
    auth: string;
  };
}
