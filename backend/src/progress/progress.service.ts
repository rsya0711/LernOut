import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  // Level progression formula: Level = floor(sqrt(xp / 50)) + 1
  // Threshold to next level = ((Level)^2) * 50
  calculateLevel(xp: number) {
    const level = Math.floor(Math.sqrt(xp / 50)) + 1;
    const currentLevelBaseXp = Math.pow(level - 1, 2) * 50;
    const nextLevelTargetXp = Math.pow(level, 2) * 50;
    const xpInCurrentLevel = xp - currentLevelBaseXp;
    const xpNeededForNextLevel = nextLevelTargetXp - currentLevelBaseXp;
    const progressPercent = Math.min(
      100,
      Math.max(0, Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100)),
    );

    return {
      level,
      currentXp: xp,
      currentLevelBaseXp,
      nextLevelTargetXp,
      xpNeededForNextLevel,
      progressPercent,
    };
  }

  async getUserProgress(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        courseProgresses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                thumbnail: true,
                level: true,
                category: { select: { name: true } },
              },
            },
          },
          orderBy: { updatedAt: 'desc' },
        },
        quizAttempts: {
          orderBy: { completedAt: 'desc' },
          take: 5,
          include: {
            quiz: {
              select: { id: true, title: true },
            },
          },
        },
        streakLogs: {
          orderBy: { date: 'desc' },
          take: 7,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan.');
    }

    const levelStats = this.calculateLevel(user.xp);

    // Synchronize level in User model if changed
    if (user.level !== levelStats.level) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { level: levelStats.level },
      });
    }

    // Calculate total questions attempted and overall accuracy
    const allQuizAttempts = await this.prisma.userQuizAttempt.findMany({
      where: { userId },
      select: {
        totalQuestions: true,
        correctAnswers: true,
        score: true,
      },
    });

    const totalQuestionsAnswered = allQuizAttempts.reduce(
      (acc, curr) => acc + curr.totalQuestions,
      0,
    );
    const totalCorrectAnswers = allQuizAttempts.reduce(
      (acc, curr) => acc + curr.correctAnswers,
      0,
    );
    const overallAccuracy =
      totalQuestionsAnswered > 0
        ? Math.round((totalCorrectAnswers / totalQuestionsAnswered) * 100)
        : 0;

    const totalLessonsCompleted = await this.prisma.userLessonProgress.count({
      where: { userId, isCompleted: true },
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        streak: user.streak,
        lastActiveAt: user.lastActiveAt,
      },
      gamification: {
        xp: user.xp,
        ...levelStats,
        streakDays: user.streak,
      },
      stats: {
        totalLessonsCompleted,
        totalQuizzesAttempted: allQuizAttempts.length,
        totalQuestionsAnswered,
        totalCorrectAnswers,
        overallAccuracy,
      },
      activeCourses: user.courseProgresses.map((cp) => ({
        id: cp.course.id,
        title: cp.course.title,
        slug: cp.course.slug,
        category: cp.course.category.name,
        thumbnail: cp.course.thumbnail,
        level: cp.course.level,
        progressPercent: cp.progressPercent,
        isCompleted: cp.isCompleted,
        enrolledAt: cp.enrolledAt,
        updatedAt: cp.updatedAt,
      })),
      recentQuizAttempts: user.quizAttempts.map((qa) => ({
        id: qa.id,
        quizTitle: qa.quiz.title,
        score: qa.score,
        isPassed: qa.isPassed,
        xpEarned: qa.xpEarned,
        completedAt: qa.completedAt,
      })),
      weeklyStreakHistory: user.streakLogs,
    };
  }

  async getUserActivity(userId: string) {
    // Get last 30 days activity
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const logs = await this.prisma.streakLog.findMany({
      where: {
        userId,
        date: { gte: thirtyDaysAgo },
      },
      orderBy: { date: 'asc' },
    });

    return logs;
  }
}
