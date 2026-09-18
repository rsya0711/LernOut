import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(private readonly prisma: PrismaService) {}

  async getQuizById(id: string, userId?: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        module: {
          include: {
            course: {
              select: { id: true, title: true, slug: true },
            },
          },
        },
        course: {
          select: { id: true, title: true, slug: true },
        },
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            options: {
              orderBy: { orderIndex: 'asc' },
              select: {
                id: true,
                questionId: true,
                text: true,
                orderIndex: true,
                // Do NOT expose isCorrect here for anti-cheat
              },
            },
          },
        },
        ...(userId && {
          quizAttempts: {
            where: { userId },
            orderBy: { score: 'desc' },
            take: 1,
            select: {
              id: true,
              score: true,
              isPassed: true,
              completedAt: true,
            },
          },
        }),
      },
    });

    if (!quiz) {
      throw new NotFoundException(`Kuis dengan ID '${id}' tidak ditemukan.`);
    }

    // Sanitize questions (strip explanation and points for safe client delivery)
    const sanitizedQuestions = quiz.questions.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      orderIndex: q.orderIndex,
      type: q.type,
      categoryTag: q.categoryTag,
      options: q.options,
    }));

    const bestAttempt = (quiz as any).quizAttempts?.[0] || null;

    return {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      passingScore: quiz.passingScore,
      xpReward: quiz.xpReward,
      totalQuestions: sanitizedQuestions.length,
      module: quiz.module
        ? {
            id: quiz.module.id,
            title: quiz.module.title,
            course: quiz.module.course,
          }
        : null,
      course: quiz.course,
      bestAttempt,
      questions: sanitizedQuestions,
    };
  }

  async submitQuiz(quizId: string, userId: string, dto: SubmitQuizDto) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        module: {
          include: {
            course: {
              include: {
                modules: {
                  orderBy: { orderIndex: 'asc' },
                  select: { id: true, title: true, orderIndex: true },
                },
              },
            },
          },
        },
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            options: {
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException(`Kuis dengan ID '${quizId}' tidak ditemukan.`);
    }

    const totalQuestions = quiz.questions.length;
    if (totalQuestions === 0) {
      throw new BadRequestException('Kuis ini belum memiliki pertanyaan.');
    }

    // Map user answers by questionId
    const answerMap = new Map<string, string | undefined>();
    dto.answers.forEach((ans) => {
      answerMap.set(ans.questionId, ans.selectedOptionId);
    });

    let correctCount = 0;
    const answerRecords: Array<{
      questionId: string;
      selectedOptionId?: string;
      isCorrect: boolean;
      prompt: string;
      explanation?: string | null;
      userSelectedText?: string;
      correctOptionText: string;
      options: Array<{ id: string; text: string; isCorrect: boolean }>;
    }> = [];

    for (const question of quiz.questions) {
      const selectedOptionId = answerMap.get(question.id);
      const correctOption = question.options.find((opt) => opt.isCorrect);
      const userSelectedOption = question.options.find(
        (opt) => opt.id === selectedOptionId,
      );

      const isCorrect = !!(
        selectedOptionId &&
        correctOption &&
        selectedOptionId === correctOption.id
      );

      if (isCorrect) {
        correctCount++;
      }

      answerRecords.push({
        questionId: question.id,
        selectedOptionId,
        isCorrect,
        prompt: question.prompt,
        explanation: question.explanation,
        userSelectedText: userSelectedOption?.text || '(Tidak dijawab)',
        correctOptionText: correctOption?.text || '',
        options: question.options.map((opt) => ({
          id: opt.id,
          text: opt.text,
          isCorrect: opt.isCorrect,
        })),
      });
    }

    const score = Math.round((correctCount / totalQuestions) * 100);
    const accuracy = score;
    const isPassed = score >= quiz.passingScore;
    const xpEarned = isPassed ? quiz.xpReward : 10; // minimum participation XP

    // 1. Create UserQuizAttempt and UserQuizAnswer records in transaction
    const attempt = await this.prisma.$transaction(async (tx) => {
      const newAttempt = await tx.userQuizAttempt.create({
        data: {
          userId,
          quizId,
          score,
          totalQuestions,
          correctAnswers: correctCount,
          xpEarned,
          isPassed,
          completedAt: new Date(),
        },
      });

      // Bulk create answers
      await tx.userQuizAnswer.createMany({
        data: answerRecords.map((ans) => ({
          attemptId: newAttempt.id,
          questionId: ans.questionId,
          selectedOptionId: ans.selectedOptionId || null,
          isCorrect: ans.isCorrect,
        })),
      });

      // Award XP to user
      await tx.user.update({
        where: { id: userId },
        data: {
          xp: { increment: xpEarned },
          lastActiveAt: new Date(),
        },
      });

      return newAttempt;
    });

    // 2. Recommend next learning material
    let nextRecommendation: {
      type: 'module' | 'course' | 'tryout';
      title: string;
      url: string;
    } = {
      type: 'tryout',
      title: 'Simulasi Tryout UTBK Terpadu',
      url: '/tryout',
    };

    if (quiz.module?.course) {
      const currentModuleIndex = quiz.module.course.modules.findIndex(
        (m) => m.id === quiz.module?.id,
      );
      if (
        currentModuleIndex >= 0 &&
        currentModuleIndex < quiz.module.course.modules.length - 1
      ) {
        const nextMod = quiz.module.course.modules[currentModuleIndex + 1];
        nextRecommendation = {
          type: 'module',
          title: `Lanjut ke ${nextMod.title}`,
          url: `/courses/${quiz.module.course.slug}`,
        };
      } else {
        nextRecommendation = {
          type: 'course',
          title: `Jelajahi Kursus Lainnya`,
          url: '/courses',
        };
      }
    }

    return {
      attemptId: attempt.id,
      quizTitle: quiz.title,
      summary: {
        totalQuestions,
        correctAnswers: correctCount,
        incorrectAnswers: totalQuestions - correctCount,
        score,
        accuracy,
        passingScore: quiz.passingScore,
        isPassed,
        xpEarned,
      },
      review: answerRecords,
      nextRecommendation,
    };
  }

  async getAttemptResult(attemptId: string, userId: string) {
    const attempt = await this.prisma.userQuizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            module: {
              include: {
                course: {
                  select: { id: true, title: true, slug: true },
                },
              },
            },
          },
        },
        answers: {
          include: {
            question: {
              include: {
                options: true,
              },
            },
            selectedOption: true,
          },
        },
      },
    });

    if (!attempt || attempt.userId !== userId) {
      throw new NotFoundException(`Riwayat pengerjaan kuis tidak ditemukan.`);
    }

    const review = attempt.answers.map((ans: any) => {
      const correctOption = ans.question.options.find((opt: any) => opt.isCorrect);
      return {
        questionId: ans.question.id,
        prompt: ans.question.prompt,
        explanation: ans.question.explanation,
        selectedOptionId: ans.selectedOptionId,
        userSelectedText: ans.selectedOption?.text || '(Tidak dijawab)',
        correctOptionText: correctOption?.text || '',
        isCorrect: ans.isCorrect,
        options: ans.question.options.map((opt: any) => ({
          id: opt.id,
          text: opt.text,
          isCorrect: opt.isCorrect,
        })),
      };
    });

    return {
      attemptId: attempt.id,
      quizTitle: attempt.quiz.title,
      completedAt: attempt.completedAt,
      summary: {
        totalQuestions: attempt.totalQuestions,
        correctAnswers: attempt.correctAnswers,
        incorrectAnswers: attempt.totalQuestions - attempt.correctAnswers,
        score: attempt.score,
        accuracy: attempt.score,
        passingScore: attempt.quiz.passingScore,
        isPassed: attempt.isPassed,
        xpEarned: attempt.xpEarned,
      },
      review,
      course: attempt.quiz.module?.course || null,
    };
  }
}
