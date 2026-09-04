import { apiClient } from './client';

export interface QuizOption {
  id: string;
  questionId: string;
  text: string;
  orderIndex: number;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  orderIndex: number;
  type: string;
  categoryTag?: string;
  options: QuizOption[];
}

export interface QuizDetail {
  id: string;
  title: string;
  description?: string;
  passingScore: number;
  xpReward: number;
  totalQuestions: number;
  module?: {
    id: string;
    title: string;
    course: {
      id: string;
      title: string;
      slug: string;
    };
  } | null;
  course?: {
    id: string;
    title: string;
    slug: string;
  } | null;
  bestAttempt?: {
    id: string;
    score: number;
    isPassed: boolean;
    completedAt: string;
  } | null;
  questions: QuizQuestion[];
}

export interface QuizAnswerItem {
  questionId: string;
  selectedOptionId?: string;
}

export interface SubmitQuizPayload {
  answers: QuizAnswerItem[];
}

export interface QuestionReviewItem {
  questionId: string;
  prompt: string;
  explanation?: string;
  selectedOptionId?: string;
  userSelectedText: string;
  correctOptionText: string;
  isCorrect: boolean;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
}

export interface QuizResultResponse {
  attemptId: string;
  quizTitle: string;
  summary: {
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    score: number;
    accuracy: number;
    passingScore: number;
    isPassed: boolean;
    xpEarned: number;
  };
  review: QuestionReviewItem[];
  nextRecommendation?: {
    type: 'module' | 'course' | 'tryout';
    title: string;
    url: string;
  };
}

export const quizzesApi = {
  getQuizById: async (id: string): Promise<QuizDetail> => {
    const res = await apiClient.get<QuizDetail>(`/quizzes/${id}`);
    return res.data;
  },

  submitQuiz: async (
    id: string,
    payload: SubmitQuizPayload,
  ): Promise<QuizResultResponse> => {
    const res = await apiClient.post<QuizResultResponse>(
      `/quizzes/${id}/submit`,
      payload,
    );
    return res.data;
  },

  getAttemptResult: async (attemptId: string): Promise<QuizResultResponse> => {
    const res = await apiClient.get<QuizResultResponse>(
      `/quizzes/attempts/${attemptId}`,
    );
    return res.data;
  },
};
