import { apiClient } from './client';
import { AuthResponse, LoginCredentials, RegisterData, User } from '../types/auth.types';

export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  /**
   * Login with email or username
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return res.data;
  },

  /**
   * Refresh JWT token
   */
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const res = await apiClient.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      refreshToken,
    });
    return res.data;
  },

  /**
   * Get current authenticated user profile
   */
  getMe: async (): Promise<User> => {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },

  /**
   * Logout current session
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore network errors on logout
    }
  },
};
