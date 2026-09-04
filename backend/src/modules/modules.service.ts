import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ModulesService {
  constructor(private readonly prisma: PrismaService) {}

  async getModuleById(id: string, userId?: string) {
    const module = await this.prisma.module.findUnique({
      where: { id },
      include: {
        course: {
          select: { id: true, title: true, slug: true },
        },
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
    });

    if (!module) {
      throw new NotFoundException(`Modul dengan ID '${id}' tidak ditemukan.`);
    }

    const lessons = module.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      slug: lesson.slug,
      orderIndex: lesson.orderIndex,
      durationMinutes: lesson.durationMinutes,
      xpReward: lesson.xpReward,
      isCompleted: (lesson as any).lessonProgresses?.[0]?.isCompleted || false,
    }));

    return {
      id: module.id,
      title: module.title,
      description: module.description,
      orderIndex: module.orderIndex,
      course: module.course,
      lessons,
      quizzes: module.quizzes,
    };
  }
}
