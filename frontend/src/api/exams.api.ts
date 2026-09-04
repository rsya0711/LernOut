import { apiClient } from './client';

export interface ExamPackage {
  id: string;
  title: string;
  slug: string;
  description: string;
  durationMinutes: number;
  totalQuestions: number;
  passingScore: number;
  bestScore?: number | null;
  lastAttemptId?: string | null;
}

export interface ExamQuestion {
  id: string;
  prompt: string;
  orderIndex: number;
  type: string;
  categoryTag: string;
  options: Array<{
    id: string;
    questionId: string;
    text: string;
    orderIndex: number;
  }>;
}

export interface StartExamResponse {
  attemptId: string;
  examId: string;
  title: string;
  durationMinutes: number;
  startedAt: string;
  totalQuestions: number;
  questions: ExamQuestion[];
}

export interface ExamAnswerItem {
  questionId: string;
  selectedOptionId?: string;
  isDoubtful?: boolean;
}

export interface ExamResultResponse {
  attemptId: string;
  examTitle: string;
  summary: {
    totalQuestions: number;
    correctCount: number;
    incorrectCount: number;
    emptyCount: number;
    accuracy: number;
    scaledScore: number;
    passingScore: number;
    isPassed: boolean;
    timeSpentSeconds: number;
    xpEarned: number;
  };
  categoryBreakdown: Array<{
    category: string;
    total: number;
    correct: number;
    incorrect: number;
    empty: number;
    accuracy: number;
    score: number;
  }>;
  review: Array<{
    questionId: string;
    prompt: string;
    explanation?: string;
    categoryTag: string;
    isCorrect: boolean;
    isDoubtful: boolean;
    userSelectedText: string;
    correctOptionText: string;
    options: Array<{
      id: string;
      text: string;
      isCorrect: boolean;
    }>;
  }>;
}

export const examsApi = {
  getExams: async (): Promise<ExamPackage[]> => {
    const res = await apiClient.get<ExamPackage[]>('/exams');
    return res.data;
  },

  getExamById: async (id: string): Promise<ExamPackage> => {
    const res = await apiClient.get<ExamPackage>(`/exams/${id}`);
    return res.data;
  },

  startExam: async (id: string): Promise<StartExamResponse> => {
    const res = await apiClient.post<StartExamResponse>(`/exams/${id}/start`);
    return res.data;
  },

  submitExam: async (
    attemptId: string,
    answers: ExamAnswerItem[],
  ): Promise<ExamResultResponse> => {
    const res = await apiClient.post<ExamResultResponse>(
      `/exams/attempts/${attemptId}/submit`,
      { answers },
    );
    return res.data;
  },

  getAttemptResult: async (attemptId: string): Promise<ExamResultResponse> => {
    const res = await apiClient.get<ExamResultResponse>(
      `/exams/attempts/${attemptId}/results`,
    );
    return res.data;
  },

  getExamHistory: async () => {
    const res = await apiClient.get('/exams/history');
    return res.data;
  },
};
