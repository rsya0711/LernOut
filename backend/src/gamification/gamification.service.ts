import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GamificationService {
  constructor(private readonly prisma: PrismaService) {}

  async getLeaderboard(period: 'weekly' | 'alltime' = 'alltime') {
    if (period === 'weekly') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Group XP from StreakLog in last 7 days
      const weeklyLogs = await this.prisma.streakLog.groupBy({
        by: ['userId'],
        where: {
          date: { gte: sevenDaysAgo },
        },
        _sum: {
          xpEarned: true,
        },
        orderBy: {
          _sum: {
            xpEarned: 'desc',
          },
        },
        take: 50,
      });

      const userIds = weeklyLogs.map((log) => log.userId);
      const users = await this.prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          username: true,
          fullName: true,
          avatarUrl: true,
          level: true,
          streak: true,
        },
      });

      const userMap = new Map(users.map((u) => [u.id, u]));

      return weeklyLogs.map((log, index) => {
        const user = userMap.get(log.userId);
        return {
          rank: index + 1,
          userId: log.userId,
          username: user?.username || 'Learner',
          fullName: user?.fullName || null,
          avatarUrl: user?.avatarUrl || null,
          level: user?.level || 1,
          streak: user?.streak || 0,
          xpEarned: log._sum.xpEarned || 0,
        };
      });
    }

    // All-time leaderboard based on total user XP
    const topUsers = await this.prisma.user.findMany({
      orderBy: { xp: 'desc' },
      take: 50,
      select: {
        id: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        level: true,
        streak: true,
        xp: true,
      },
    });

    return topUsers.map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      username: user.username,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      level: user.level,
      streak: user.streak,
      xpEarned: user.xp,
    }));
  }

  async getAchievements(userId?: string) {
    const achievements = await this.prisma.achievement.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        ...(userId && {
          userAchievements: {
            where: { userId },
            select: { unlockedAt: true },
          },
        }),
      },
    });

    return achievements.map((ach) => {
      const userAch = (ach as any).userAchievements?.[0] || null;
      return {
        id: ach.id,
        code: ach.code,
        title: ach.title,
        description: ach.description,
        iconUrl: ach.iconUrl,
        xpBonus: ach.xpBonus,
        category: ach.category,
        isUnlocked: !!userAch,
        unlockedAt: userAch?.unlockedAt || null,
      };
    });
  }

  async checkAndUnlockAchievements(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userAchievements: { select: { achievementId: true } },
      },
    });

    if (!user) return [];

    const unlockedIds = new Set(
      user.userAchievements.map((ua) => ua.achievementId),
    );
    const allAchievements = await this.prisma.achievement.findMany();
    const newlyUnlocked: string[] = [];

    // Query user metrics
    const lessonsCount = await this.prisma.userLessonProgress.count({
      where: { userId, isCompleted: true },
    });

    const quizAttempts = await this.prisma.userQuizAttempt.findMany({
      where: { userId },
      select: { score: true, isPassed: true },
    });

    const perfectQuizCount = quizAttempts.filter((q) => q.score >= 100).length;

    for (const ach of allAchievements) {
      if (unlockedIds.has(ach.id)) continue;

      let qualify = false;
      if (ach.code === 'FIRST_LESSON' && lessonsCount >= 1) qualify = true;
      if (ach.code === 'FIRST_QUIZ' && quizAttempts.length >= 1) qualify = true;
      if (ach.code === 'TEN_LESSONS' && lessonsCount >= 10) qualify = true;
      if (ach.code === 'PERFECT_QUIZ' && perfectQuizCount >= 1) qualify = true;
      if (ach.code === 'XP_1000' && user.xp >= 1000) qualify = true;
      if (ach.code === 'SEVEN_DAY_STREAK' && user.streak >= 7) qualify = true;

      if (qualify) {
        await this.prisma.userAchievement.create({
          data: {
            userId,
            achievementId: ach.id,
          },
        });

        // Award bonus XP
        await this.prisma.user.update({
          where: { id: userId },
          data: { xp: { increment: ach.xpBonus } },
        });

        newlyUnlocked.push(ach.title);
      }
    }

    return newlyUnlocked;
  }
}
