import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CourseQueryDto } from './dto/course-query.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async getCategories() {
    return this.prisma.category.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        _count: {
          select: { courses: true },
        },
      },
    });
  }

  async getCourses(query: CourseQueryDto, userId?: string) {
    const { category, search, level } = query;

    const where: any = {
      isPublished: true,
    };

    if (category) {
      where.category = {
        slug: category,
      };
    }

    if (level) {
      where.level = level;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const courses = await this.prisma.course.findMany({
      where,
      orderBy: { orderIndex: 'asc' },
      include: {
        category: {
          select: { id: true, name: true, slug: true, icon: true },
        },
        modules: {
          include: {
            _count: {
              select: { lessons: true, quizzes: true },
            },
          },
        },
        _count: {
          select: { modules: true, quizzes: true },
        },
        ...(userId && {
          courseProgresses: {
            where: { userId },
            select: { progressPercent: true, isCompleted: true },
          },
        }),
      },
    });

    // Format with total lessons count and user progress
    return courses.map((course) => {
      const totalLessons = course.modules.reduce(
        (acc, mod) => acc + mod._count.lessons,
        0,
      );
      const totalQuizzes = course.modules.reduce(
        (acc, mod) => acc + mod._count.quizzes,
        course._count.quizzes,
      );

      const userProgress = (course as any).courseProgresses?.[0] || null;

      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        thumbnail: course.thumbnail,
        level: course.level,
        category: course.category,
        modulesCount: course._count.modules,
        lessonsCount: totalLessons,
        quizzesCount: totalQuizzes,
        userProgress: userProgress
          ? {
              progressPercent: userProgress.progressPercent,
              isCompleted: userProgress.isCompleted,
            }
          : null,
      };
    });
  }

  async getCourseBySlug(slug: string, userId?: string) {
    const course = await this.prisma.course.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
        isPublished: true,
      },
      include: {
        category: true,
        modules: {
          orderBy: { orderIndex: 'asc' },
          include: {
            lessons: {
              orderBy: { orderIndex: 'asc' },
              select: {
                id: true,
                title: true,
                slug: true,
                orderIndex: true,
                durationMinutes: true,
                xpReward: true,
                ...(userId && {
                  lessonProgresses: {
                    where: { userId },
                    select: { isCompleted: true },
                  },
                }),
              },
            },
            quizzes: {
              orderBy: { orderIndex: 'asc' },
              select: {
                id: true,
                title: true,
                description: true,
                xpReward: true,
                passingScore: true,
                _count: { select: { questions: true } },
              },
            },
          },
        },
        courseProgresses: userId
          ? {
              where: { userId },
              select: { progressPercent: true, isCompleted: true },
            }
          : false,
      },
    });

    if (!course) {
      throw new NotFoundException(`Kursus dengan identifier '${slug}' tidak ditemukan.`);
    }

    const totalLessons = course.modules.reduce(
      (acc, mod) => acc + mod.lessons.length,
      0,
    );
    let completedLessonsCount = 0;

    // Map module lessons with completion boolean
    const modulesFormatted = course.modules.map((module) => {
      const lessonsFormatted = module.lessons.map((lesson) => {
        const isCompleted =
          (lesson as any).lessonProgresses?.[0]?.isCompleted || false;
        if (isCompleted) completedLessonsCount++;
        return {
          id: lesson.id,
          title: lesson.title,
          slug: lesson.slug,
          orderIndex: lesson.orderIndex,
          durationMinutes: lesson.durationMinutes,
          xpReward: lesson.xpReward,
          isCompleted,
        };
      });

      return {
        id: module.id,
        title: module.title,
        description: module.description,
        orderIndex: module.orderIndex,
        lessons: lessonsFormatted,
        quizzes: module.quizzes,
      };
    });

    const userProgress = (course as any).courseProgresses?.[0] || null;

    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      thumbnail: course.thumbnail,
      level: course.level,
      category: course.category,
      totalLessons,
      completedLessons: completedLessonsCount,
      modules: modulesFormatted,
      userProgress: userProgress
        ? {
            progressPercent: userProgress.progressPercent,
            isCompleted: userProgress.isCompleted,
          }
        : null,
    };
  }
}
