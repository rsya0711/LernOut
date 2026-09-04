import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  async getLessonById(id: string, userId?: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        module: {
          include: {
            course: {
              select: { id: true, title: true, slug: true },
            },
            lessons: {
              orderBy: { orderIndex: 'asc' },
              select: { id: true, title: true, orderIndex: true },
            },
            quizzes: {
              orderBy: { orderIndex: 'asc' },
              select: { id: true, title: true },
            },
          },
        },
        ...(userId && {
          lessonProgresses: {
            where: { userId },
            select: { isCompleted: true, completedAt: true },
          },
        }),
      },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson dengan ID '${id}' tidak ditemukan.`);
    }

    // Determine sequence (prev lesson, next lesson, or module quiz)
    const siblingLessons = lesson.module.lessons;
    const currentIndex = siblingLessons.findIndex((l) => l.id === lesson.id);
    const prevLesson = currentIndex > 0 ? siblingLessons[currentIndex - 1] : null;
    const nextLesson =
      currentIndex < siblingLessons.length - 1
        ? siblingLessons[currentIndex + 1]
        : null;
    const moduleQuiz = lesson.module.quizzes?.[0] || null;

    const isCompleted =
      (lesson as any).lessonProgresses?.[0]?.isCompleted || false;

    return {
      id: lesson.id,
      title: lesson.title,
      slug: lesson.slug,
      content: lesson.content,
      durationMinutes: lesson.durationMinutes,
      xpReward: lesson.xpReward,
      orderIndex: lesson.orderIndex,
      isCompleted,
      module: {
        id: lesson.module.id,
        title: lesson.module.title,
        course: lesson.module.course,
      },
      navigation: {
        prevLesson,
        nextLesson,
        moduleQuiz,
      },
    };
  }

  async completeLesson(lessonId: string, userId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: {
              include: {
                modules: {
                  include: {
                    lessons: { select: { id: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson dengan ID '${lessonId}' tidak ditemukan.`);
    }

    const courseId = lesson.module.course.id;

    // 1. Upsert Lesson Progress
    const existingProgress = await this.prisma.userLessonProgress.findUnique({
      where: {
        userId_lessonId: { userId, lessonId },
      },
    });

    const isFirstTime = !existingProgress || !existingProgress.isCompleted;

    const lessonProgress = await this.prisma.userLessonProgress.upsert({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      create: {
        userId,
        lessonId,
        isCompleted: true,
        completedAt: new Date(),
      },
      update: {
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    // 2. Award XP if first time completed
    let awardedXp = 0;
    if (isFirstTime) {
      awardedXp = lesson.xpReward || 15;
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          xp: { increment: awardedXp },
          lastActiveAt: new Date(),
        },
      });
    }

    // 3. Compute overall Course progress
    const allCourseLessonIds = lesson.module.course.modules.flatMap((m) =>
      m.lessons.map((l) => l.id),
    );
    const totalLessons = allCourseLessonIds.length;

    const completedLessonsCount = await this.prisma.userLessonProgress.count({
      where: {
        userId,
        lessonId: { in: allCourseLessonIds },
        isCompleted: true,
      },
    });

    const progressPercent =
      totalLessons > 0
        ? Math.round((completedLessonsCount / totalLessons) * 100)
        : 100;
    const isCourseCompleted = progressPercent >= 100;

    const courseProgress = await this.prisma.userCourseProgress.upsert({
      where: {
        userId_courseId: { userId, courseId },
      },
      create: {
        userId,
        courseId,
        progressPercent,
        isCompleted: isCourseCompleted,
        completedAt: isCourseCompleted ? new Date() : null,
      },
      update: {
        progressPercent,
        isCompleted: isCourseCompleted,
        completedAt: isCourseCompleted ? new Date() : null,
      },
    });

    return {
      message: 'Lesson berhasil diselesaikan!',
      awardedXp,
      isFirstTime,
      lessonProgress,
      courseProgress: {
        progressPercent: courseProgress.progressPercent,
        isCompleted: courseProgress.isCompleted,
      },
    };
  }
}
