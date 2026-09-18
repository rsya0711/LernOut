import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitExamDto } from './dto/submit-exam.dto';

@Injectable()
export class ExamsService {
  constructor(private readonly prisma: PrismaService) {}

  async getExams(userId?: string) {
    const exams = await this.prisma.examTryout.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { questions: true },
        },
        ...(userId && {
          attempts: {
            where: { userId, isFinished: true },
            orderBy: { score: 'desc' },
            take: 1,
            select: {
              id: true,
              score: true,
              submittedAt: true,
            },
          },
        }),
      },
    });

    return exams.map((exam) => ({
      id: exam.id,
      title: exam.title,
      slug: exam.slug,
      description: exam.description,
      durationMinutes: exam.durationMinutes,
      totalQuestions: exam._count.questions,
      passingScore: exam.passingScore,
      bestScore: (exam as any).attempts?.[0]?.score || null,
      lastAttemptId: (exam as any).attempts?.[0]?.id || null,
    }));
  }

  async getExamById(id: string) {
    const exam = await this.prisma.examTryout.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        isPublished: true,
      },
      include: {
        _count: { select: { questions: true } },
      },
    });

    if (!exam) {
      throw new NotFoundException('Paket Tryout UTBK tidak ditemukan.');
    }

    return {
      ...exam,
      totalQuestions: exam._count.questions,
    };
  }

  async startExam(examId: string, userId: string) {
    const exam = await this.prisma.examTryout.findUnique({
      where: { id: examId },
      include: {
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
              },
            },
          },
        },
      },
    });

    if (!exam) {
      throw new NotFoundException('Paket Tryout UTBK tidak ditemukan.');
    }

    // Create an active ExamAttempt
    const attempt = await this.prisma.examAttempt.create({
      data: {
        userId,
        examTryoutId: exam.id,
        startedAt: new Date(),
        isFinished: false,
      },
    });

    const sanitizedQuestions = exam.questions.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      orderIndex: q.orderIndex,
      type: q.type,
      categoryTag: q.categoryTag || 'Umum',
      options: q.options,
    }));

    return {
      attemptId: attempt.id,
      examId: exam.id,
      title: exam.title,
      durationMinutes: exam.durationMinutes,
      startedAt: attempt.startedAt,
      totalQuestions: sanitizedQuestions.length,
      questions: sanitizedQuestions,
    };
  }

  async submitExam(attemptId: string, userId: string, dto: SubmitExamDto) {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        examTryout: {
          include: {
            questions: {
              orderBy: { orderIndex: 'asc' },
              include: {
                options: true,
              },
            },
          },
        },
      },
    });

    if (!attempt || attempt.userId !== userId) {
      throw new NotFoundException('Sesi pengerjaan tryout tidak ditemukan.');
    }

    if (attempt.isFinished) {
      throw new BadRequestException('Tryout ini sudah pernah dikumpulkan.');
    }

    const exam = attempt.examTryout;
    const totalQuestions = exam.questions.length;

    // Map answers by questionId
    const answerMap = new Map<
      string,
      { selectedOptionId?: string; isDoubtful?: boolean }
    >();
    dto.answers.forEach((ans) => {
      answerMap.set(ans.questionId, {
        selectedOptionId: ans.selectedOptionId,
        isDoubtful: ans.isDoubtful ?? false,
      });
    });

    let correctCount = 0;
    let incorrectCount = 0;
    let emptyCount = 0;

    // Category breakdown accumulator
    const categoryStats: Record<
      string,
      { total: number; correct: number; incorrect: number; empty: number }
    > = {};

    const answerRecords: Array<{
      examAttemptId: string;
      questionId: string;
      selectedOptionId: string | null;
      isDoubtful: boolean;
      isCorrect: boolean;
    }> = [];

    const detailedReview: any[] = [];

    for (const question of exam.questions) {
      const userAns = answerMap.get(question.id);
      const selectedOptionId = userAns?.selectedOptionId;
      const isDoubtful = userAns?.isDoubtful ?? false;
      const correctOption = question.options.find((opt) => opt.isCorrect);
      const userSelectedOption = question.options.find(
        (opt) => opt.id === selectedOptionId,
      );

      const category = question.categoryTag || 'Penalaran Umum';
      if (!categoryStats[category]) {
        categoryStats[category] = { total: 0, correct: 0, incorrect: 0, empty: 0 };
      }
      categoryStats[category].total++;

      let isCorrect = false;
      if (!selectedOptionId) {
        emptyCount++;
        categoryStats[category].empty++;
      } else if (correctOption && selectedOptionId === correctOption.id) {
        isCorrect = true;
        correctCount++;
        categoryStats[category].correct++;
      } else {
        incorrectCount++;
        categoryStats[category].incorrect++;
      }

      answerRecords.push({
        examAttemptId: attempt.id,
        questionId: question.id,
        selectedOptionId: selectedOptionId || null,
        isDoubtful,
        isCorrect,
      });

      detailedReview.push({
        questionId: question.id,
        prompt: question.prompt,
        explanation: question.explanation,
        categoryTag: category,
        isCorrect,
        isDoubtful,
        userSelectedText: userSelectedOption?.text || '(Dikosongkan)',
        correctOptionText: correctOption?.text || '',
        options: question.options.map((opt) => ({
          id: opt.id,
          text: opt.text,
          isCorrect: opt.isCorrect,
        })),
      });
    }

    // UTBK IRT Simulation Score (Baseline 200 + Scaled up to 850)
    const accuracy =
      totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const scaledScore = Math.round(200 + (accuracy / 100) * 650);

    const timeSpentSeconds = Math.round(
      (Date.now() - new Date(attempt.startedAt).getTime()) / 1000,
    );

    // Persist attempt results in transaction
    await this.prisma.$transaction(async (tx) => {
      await tx.examAttempt.update({
        where: { id: attempt.id },
        data: {
          isFinished: true,
          submittedAt: new Date(),
          score: scaledScore,
        },
      });

      // Upsert answers
      for (const ans of answerRecords) {
        await tx.examAttemptAnswer.upsert({
          where: {
            examAttemptId_questionId: {
              examAttemptId: ans.examAttemptId,
              questionId: ans.questionId,
            },
          },
          create: ans,
          update: ans,
        });
      }

      // Award XP to user for completing UTBK tryout
      await tx.user.update({
        where: { id: userId },
        data: {
          xp: { increment: 150 }, // UTBK completion gives generous XP
          lastActiveAt: new Date(),
        },
      });
    });

    return {
      attemptId: attempt.id,
      examTitle: exam.title,
      summary: {
        totalQuestions,
        correctCount,
        incorrectCount,
        emptyCount,
        accuracy,
        scaledScore,
        passingScore: exam.passingScore,
        isPassed: scaledScore >= exam.passingScore,
        timeSpentSeconds,
        xpEarned: 150,
      },
      categoryBreakdown: Object.entries(categoryStats).map(([catName, stats]) => ({
        category: catName,
        ...stats,
        accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
        score: Math.round(200 + (stats.total > 0 ? (stats.correct / stats.total) * 650 : 0)),
      })),
      review: detailedReview,
    };
  }

  async getAttemptResult(attemptId: string, userId: string) {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        examTryout: {
          include: {
            questions: {
              orderBy: { orderIndex: 'asc' },
              include: { options: true },
            },
          },
        },
        answers: {
          include: {
            selectedOption: true,
          },
        },
      },
    });

    if (!attempt || attempt.userId !== userId) {
      throw new NotFoundException('Hasil tryout tidak ditemukan.');
    }

    const answerMap = new Map(attempt.answers.map((a) => [a.questionId, a]));
    const totalQuestions = attempt.examTryout.questions.length;

    let correctCount = 0;
    let incorrectCount = 0;
    let emptyCount = 0;

    const categoryStats: Record<
      string,
      { total: number; correct: number; incorrect: number; empty: number }
    > = {};

    const review = attempt.examTryout.questions.map((q) => {
      const userAns: any = answerMap.get(q.id);
      const correctOpt = q.options.find((o) => o.isCorrect);
      const category = q.categoryTag || 'Penalaran Umum';

      if (!categoryStats[category]) {
        categoryStats[category] = { total: 0, correct: 0, incorrect: 0, empty: 0 };
      }
      categoryStats[category].total++;

      const isCorrect = userAns?.isCorrect ?? false;
      const isDoubtful = userAns?.isDoubtful ?? false;
      const selectedOptionId = userAns?.selectedOptionId;

      if (!selectedOptionId) {
        emptyCount++;
        categoryStats[category].empty++;
      } else if (isCorrect) {
        correctCount++;
        categoryStats[category].correct++;
      } else {
        incorrectCount++;
        categoryStats[category].incorrect++;
      }

      return {
        questionId: q.id,
        prompt: q.prompt,
        explanation: q.explanation,
        categoryTag: category,
        isCorrect,
        isDoubtful,
        selectedOptionId,
        userSelectedText: (userAns as any)?.selectedOption?.text || '(Dikosongkan)',
        correctOptionText: correctOpt?.text || '',
        options: q.options.map((opt) => ({
          id: opt.id,
          text: opt.text,
          isCorrect: opt.isCorrect,
        })),
      };
    });

    const accuracy =
      totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const timeSpentSeconds =
      attempt.submittedAt && attempt.startedAt
        ? Math.round(
            (new Date(attempt.submittedAt).getTime() -
              new Date(attempt.startedAt).getTime()) /
              1000,
          )
        : 0;

    return {
      attemptId: attempt.id,
      examTitle: attempt.examTryout.title,
      submittedAt: attempt.submittedAt,
      summary: {
        totalQuestions,
        correctCount,
        incorrectCount,
        emptyCount,
        accuracy,
        scaledScore: attempt.score || 0,
        passingScore: attempt.examTryout.passingScore,
        isPassed: (attempt.score || 0) >= attempt.examTryout.passingScore,
        timeSpentSeconds,
        xpEarned: 150,
      },
      categoryBreakdown: Object.entries(categoryStats).map(([catName, stats]) => ({
        category: catName,
        ...stats,
        accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
        score: Math.round(200 + (stats.total > 0 ? (stats.correct / stats.total) * 650 : 0)),
      })),
      review,
    };
  }

  async getUserExamHistory(userId: string) {
    const attempts = await this.prisma.examAttempt.findMany({
      where: { userId, isFinished: true },
      orderBy: { submittedAt: 'desc' },
      include: {
        examTryout: {
          select: { id: true, title: true, slug: true, durationMinutes: true },
        },
      },
    });

    return attempts.map((a) => ({
      id: a.id,
      examId: a.examTryout.id,
      title: a.examTryout.title,
      score: a.score,
      startedAt: a.startedAt,
      submittedAt: a.submittedAt,
    }));
  }
}
