import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { RootLayout } from './layouts/RootLayout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { CourseCatalogPage } from './pages/courses/CourseCatalogPage';
import { CourseDetailPage } from './pages/courses/CourseDetailPage';
import { LessonViewPage } from './pages/lessons/LessonViewPage';
import { QuizEnginePage } from './pages/quizzes/QuizEnginePage';
import { QuizResultPage } from './pages/quizzes/QuizResultPage';
import { UserDashboardPage } from './pages/dashboard/UserDashboardPage';
import { LeaderboardPage } from './pages/gamification/LeaderboardPage';
import { TryoutCatalogPage } from './pages/tryout/TryoutCatalogPage';
import { TryoutExamPage } from './pages/tryout/TryoutExamPage';
import { TryoutResultPage } from './pages/tryout/TryoutResultPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Standalone Exam & Quiz Engine Modes for maximal focus */}
            <Route path="/quizzes/:id" element={<QuizEnginePage />} />
            <Route
              path="/tryout/:id/exam"
              element={
                <ProtectedRoute>
                  <TryoutExamPage />
                </ProtectedRoute>
              }
            />

            <Route element={<RootLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* User Dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Course, Module & Lesson Routes */}
              <Route path="/courses" element={<CourseCatalogPage />} />
              <Route path="/courses/:slug" element={<CourseDetailPage />} />
              <Route path="/lessons/:id" element={<LessonViewPage />} />

              {/* Quiz Result & Review Route */}
              <Route path="/quizzes/result/:attemptId" element={<QuizResultPage />} />

              {/* Tryout Module Routes */}
              <Route path="/tryout" element={<TryoutCatalogPage />} />
              <Route
                path="/tryout/result/:attemptId"
                element={
                  <ProtectedRoute>
                    <TryoutResultPage />
                  </ProtectedRoute>
                }
              />

              {/* Leaderboard & Achievements Route */}
              <Route path="/leaderboard" element={<LeaderboardPage />} />

              {/* Admin Panel (Protected: ADMIN only) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Catch all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
