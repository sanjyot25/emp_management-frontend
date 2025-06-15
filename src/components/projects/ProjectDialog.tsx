import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import ProjectForm from './ProjectForm';
import { projectAPI, type Project, type CreateProjectData } from '@/lib/projects';

interface ProjectDialogProps {
  project?: Project;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectDialog({ project, isOpen, onClose }: ProjectDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (data: CreateProjectData) => {
    try {
      setIsLoading(true);
      if (project) {
        await projectAPI.update(project._id, data);
        toast.success('Project updated successfully');
      } else {
        await projectAPI.create(data);
        toast.success('Project created successfully');
      }
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onClose();
    } catch (error) {
      toast.error('Failed to save project');
      console.error('Project save error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px] p-0">
        <DialogHeader className="p-6 pb-4 sticky top-0 bg-background z-10 border-b">
          <DialogTitle>
            {project ? 'Edit Project' : 'Create New Project'}
          </DialogTitle>
          <DialogDescription>
            {project
              ? 'Update the project details below'
              : 'Fill in the project details below'}
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6">
          <ProjectForm
            initialData={project}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
} 