export type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

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
  createdAt: string;
  lastActiveAt?: string;
  userAchievements?: Array<{
    id: string;
    achievement: {
      id: string;
      code: string;
      title: string;
      description: string;
      iconUrl?: string;
      xpBonus: number;
      category: string;
    };
    unlockedAt: string;
  }>;
  courseProgresses?: Array<{
    id: string;
    progressPercent: number;
    isCompleted: boolean;
    course: {
      id: string;
      title: string;
      slug: string;
      thumbnail?: string;
    };
  }>;
}

export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  identifier: string; // Email or username
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  fullName?: string;
}
