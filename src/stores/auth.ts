import { create } from 'zustand';
import { api } from '../lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'manager' | 'engineer';
  skills?: string[];
  seniority?: 'junior' | 'mid' | 'senior';
  department?: string;
  maxCapacity?: number;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  // Hydrate user from localStorage
  const storedUser = localStorage.getItem('user');
  let initialUser = null;
  try {
    if (storedUser) initialUser = JSON.parse(storedUser);
  } catch {}

  return {
    token: localStorage.getItem('token'),
    user: initialUser,
    isAuthenticated: !!localStorage.getItem('token') && !!initialUser,
    isLoading: true,
    error: null,

    setAuth: (token: string, user: User) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    },

    clearAuth: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    },

    checkAuth: async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('[Auth Debug] Token in localStorage:', token);
        if (!token) {
          set({
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });
          console.log('[Auth Debug] No token found, logging out.');
          return;
        }
        const response = await api.get('/auth/profile');
        console.log('[Auth Debug] /auth/profile response:', response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        set({
          user: response.data,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('[Auth Debug] Auth check failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Authentication failed',
        });
        window.location.href = '/login';
      }
    },
  };
}); 