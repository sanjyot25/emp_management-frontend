import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import ProjectDialog from '@/components/projects/ProjectDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Project } from '@/lib/projects';



const ProjectList: React.FC = () => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await api.get('/projects');
      return response.data;
    },
    enabled: isAuthenticated && !isAuthLoading,
  });

  if (isLoading || isAuthLoading) {
    return <div>Loading projects...</div>;
  }

  if (error) {
    return <div>Error loading projects: {error.toString()}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button onClick={() => setIsProjectDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects?.map((project) => (
          <Link
            key={project._id}
            to={`/projects/${project._id}`}
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
            <p className="text-gray-600 mb-4">{project.description}</p>
            <div className="flex justify-between items-center">
              <span className={`px-3 py-1 rounded text-sm ${
                project.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : project.status === 'completed'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {project.status}
              </span>
              <div className="text-sm text-gray-500">
                {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <ProjectDialog
        isOpen={isProjectDialogOpen}
        onClose={() => setIsProjectDialogOpen(false)}
      />
    </div>
  );
};

export default ProjectList; 