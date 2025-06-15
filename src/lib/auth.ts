import { api } from './api';

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'manager' | 'engineer';
  skills?: string[];
  seniority?: 'junior' | 'mid' | 'senior';
  maxCapacity?: number;
  department?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    _id: string;
    email: string;
    name: string;
    role: 'manager' | 'engineer';
  };
}

export const authAPI = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getCurrentUser: async (): Promise<AuthResponse['user']> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
}; 