import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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
        managedCategories: { select: { id: true, name: true, slug: true } },
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

  async updateUserCategories(userId: string, categoryIds: string[]) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        managedCategories: {
          set: categoryIds.map(id => ({ id })),
        },
      },
      select: { id: true, username: true, role: true, managedCategories: { select: { id: true, name: true, slug: true } } },
    });
  }

  // --- Security Helpers ---
  private checkCategoryAccess(user: any, categoryId: string) {
    if (user.role === Role.SUPER_ADMIN) return;
    const hasAccess = user.managedCategories?.some((c: any) => c.id === categoryId);
    if (!hasAccess) {
      throw new ForbiddenException('Akses ditolak: Kamu tidak memiliki izin untuk mengelola kategori mata pelajaran ini.');
    }
  }

  private async checkCourseAccess(user: any, courseId: string) {
    if (user.role === Role.SUPER_ADMIN) return;
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Kursus tidak ditemukan');
    this.checkCategoryAccess(user, course.categoryId);
  }

  private async checkModuleAccess(user: any, moduleId: string) {
    if (user.role === Role.SUPER_ADMIN) return;
    const mod = await this.prisma.module.findUnique({ where: { id: moduleId }, include: { course: true } });
    if (!mod) throw new NotFoundException('Modul tidak ditemukan');
    this.checkCategoryAccess(user, mod.course.categoryId);
  }

  async createCourse(user: any, data: {
    categoryId: string;
    title: string;
    slug: string;
    description: string;
    thumbnail?: string;
    level?: any;
    isPublished?: boolean;
  }) {
    this.checkCategoryAccess(user, data.categoryId);
    return this.prisma.course.create({ data });
  }

  async updateCourse(user: any, id: string, data: any) {
    await this.checkCourseAccess(user, id);
    if (data.categoryId) {
      this.checkCategoryAccess(user, data.categoryId);
    }
    return this.prisma.course.update({ where: { id }, data });
  }

  async deleteCourse(user: any, id: string) {
    await this.checkCourseAccess(user, id);
    return this.prisma.course.delete({ where: { id } });
  }

  // --- Curriculum Management ---

  async createModule(user: any, data: { courseId: string; title: string; description?: string; orderIndex: number }) {
    await this.checkCourseAccess(user, data.courseId);
    return this.prisma.module.create({ data });
  }

  async deleteModule(user: any, id: string) {
    await this.checkModuleAccess(user, id);
    return this.prisma.module.delete({ where: { id } });
  }

  async createLesson(user: any, data: {
    moduleId: string;
    title: string;
    slug: string;
    content: string;
    durationMinutes: number;
    xpReward: number;
    orderIndex: number;
  }) {
    await this.checkModuleAccess(user, data.moduleId);
    return this.prisma.lesson.create({ data });
  }

  async deleteLesson(user: any, id: string) {
    if (user.role !== Role.SUPER_ADMIN) {
      const lesson = await this.prisma.lesson.findUnique({ where: { id } });
      if (!lesson) throw new NotFoundException('Lesson tidak ditemukan');
      await this.checkModuleAccess(user, lesson.moduleId);
    }
    return this.prisma.lesson.delete({ where: { id } });
  }

  async createQuiz(user: any, data: {
    moduleId: string;
    title: string;
    description?: string;
    passingScore: number;
    xpReward: number;
    orderIndex: number;
  }) {
    await this.checkModuleAccess(user, data.moduleId);
    return this.prisma.quiz.create({ data });
  }

  async createQuestion(user: any, data: {
    quizId: string;
    prompt: string;
    explanation?: string;
    points: number;
    type: any;
    orderIndex: number;
    categoryTag?: string;
    options: { text: string; isCorrect: boolean; orderIndex: number }[];
  }) {
    if (user.role !== Role.SUPER_ADMIN) {
      const quiz = await this.prisma.quiz.findUnique({ where: { id: data.quizId } });
      if (!quiz) throw new NotFoundException('Quiz tidak ditemukan');
      if (quiz.moduleId) {
        await this.checkModuleAccess(user, quiz.moduleId);
      }
    }
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
