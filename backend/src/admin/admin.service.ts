import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalCourses,
      totalLessons,
      totalQuestions,
      totalQuizAttempts,
      totalExamAttempts,
      quizAvg,
      examAvg,
      popularCourses,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.course.count(),
      this.prisma.lesson.count(),
      this.prisma.question.count(),
      this.prisma.userQuizAttempt.count(),
      this.prisma.examAttempt.count({ where: { isFinished: true } }),
      this.prisma.userQuizAttempt.aggregate({
        _avg: { score: true },
      }),
      this.prisma.examAttempt.aggregate({
        where: { isFinished: true },
        _avg: { score: true },
      }),
      this.prisma.course.findMany({
        take: 3,
        include: {
          _count: {
            select: { courseProgresses: true },
          },
          category: { select: { name: true } },
        },
        orderBy: {
          courseProgresses: { _count: 'desc' },
        },
      }),
    ]);

    // Active users in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeUsers = await this.prisma.user.count({
      where: { lastActiveAt: { gte: sevenDaysAgo } },
    });

    return {
      overview: {
        totalUsers,
        activeUsers,
        totalCourses,
        totalLessons,
        totalQuestions,
        totalQuizAttempts,
        totalExamAttempts,
        averageQuizScore: Math.round(quizAvg._avg.score || 0),
        averageExamScore: Math.round(examAvg._avg.score || 0),
      },
      popularCourses: popularCourses.map((c) => ({
        id: c.id,
        title: c.title,
        category: c.category.name,
        enrolledCount: c._count.courseProgresses,
      })),
    };
  }

  async getUsers(search?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
        xp: true,
        level: true,
        streak: true,
        lastActiveAt: true,
        createdAt: true,
      },
      take: 50,
    });
  }

  async updateUserRole(userId: string, role: Role) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, username: true, role: true },
    });
  }

  async createCourse(data: {
    categoryId: string;
    title: string;
    slug: string;
    description: string;
    thumbnail?: string;
    level?: any;
    isPublished?: boolean;
  }) {
    return this.prisma.course.create({ data });
  }

  async updateCourse(id: string, data: any) {
    return this.prisma.course.update({ where: { id }, data });
  }

  async deleteCourse(id: string) {
    return this.prisma.course.delete({ where: { id } });
  }

  // --- Curriculum Management ---

  async createModule(data: { courseId: string; title: string; description?: string; orderIndex: number }) {
    return this.prisma.module.create({ data });
  }

  async deleteModule(id: string) {
    return this.prisma.module.delete({ where: { id } });
  }

  async createLesson(data: {
    moduleId: string;
    title: string;
    slug: string;
    content: string;
    durationMinutes: number;
    xpReward: number;
    orderIndex: number;
  }) {
    return this.prisma.lesson.create({ data });
  }

  async deleteLesson(id: string) {
    return this.prisma.lesson.delete({ where: { id } });
  }

  async createQuiz(data: {
    moduleId: string;
    title: string;
    description?: string;
    passingScore: number;
    xpReward: number;
    orderIndex: number;
  }) {
    return this.prisma.quiz.create({ data });
  }

  async createQuestion(data: {
    quizId: string;
    prompt: string;
    explanation?: string;
    points: number;
    type: any;
    orderIndex: number;
    categoryTag?: string;
    options: { text: string; isCorrect: boolean; orderIndex: number }[];
  }) {
    const { options, ...questionData } = data;
    return this.prisma.question.create({
      data: {
        ...questionData,
        options: {
          create: options,
        },
      },
    });
  }
}
