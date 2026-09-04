import { apiClient } from './client';

export interface LeaderboardUser {
  rank: number;
  userId: string;
  username: string;
  fullName?: string;
  avatarUrl?: string;
  level: number;
  streak: number;
  xpEarned: number;
}

export interface AchievementItem {
  id: string;
  code: string;
  title: string;
  description: string;
  iconUrl?: string;
  xpBonus: number;
  category: string;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export const gamificationApi = {
  getLeaderboard: async (
    period: 'weekly' | 'alltime' = 'alltime',
  ): Promise<LeaderboardUser[]> => {
    const res = await apiClient.get<LeaderboardUser[]>('/gamification/leaderboard', {
      params: { period },
    });
    return res.data;
  },

  getAchievements: async (): Promise<AchievementItem[]> => {
    const res = await apiClient.get<AchievementItem[]>('/gamification/achievements');
    return res.data;
  },

  checkAchievements: async (): Promise<string[]> => {
    const res = await apiClient.post<string[]>('/gamification/check-achievements');
    return res.data;
  },
};
