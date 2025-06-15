import { api } from './api';

export interface Project {
  _id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed';
  startDate: string;
  endDate: string;
  requiredSkills: string[];
  teamSize: number;
  managerId: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface CreateProjectData {
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed';
  startDate: string;
  endDate: string;
  requiredSkills: string[];
  teamSize: number;
}

export interface UpdateProjectData extends Partial<CreateProjectData> {}

export interface ProjectFilters {
  status?: 'planning' | 'active' | 'completed';
  search?: string;
  skills?: string[];
  startDate?: string;
  endDate?: string;
}

export const projectAPI = {
  getAll: async (filters?: ProjectFilters): Promise<Project[]> => {
    const response = await api.get('/projects', { params: filters });
    return response.data;
  },

  getById: async (id: string): Promise<Project> => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  create: async (data: CreateProjectData): Promise<Project> => {
    const response = await api.post('/projects', data);
    return response.data;
  },

  update: async (id: string, data: UpdateProjectData): Promise<Project> => {
    const response = await api.patch(`/projects/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  getProjectStats: async (): Promise<{
    total: number;
    active: number;
    completed: number;
    planning: number;
  }> => {
    const response = await api.get('/projects/stats');
    return response.data;
  },
}; 