import { create } from 'zustand';
import { api } from '../lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'manager' | 'engineer';
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      set({ user: response.data.user, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to login',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, error: null });
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true, error: null });
      const token = localStorage.getItem('token');
      if (!token) {
        set({ user: null, isLoading: false });
        return;
      }

      const response = await api.get('/auth/profile');
      set({ user: response.data, isLoading: false });
    } catch (error) {
      localStorage.removeItem('token');
      set({ user: null, isLoading: false });
    }
  },
})); 