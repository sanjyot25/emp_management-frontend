import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Label } from '../ui/label';
import type { Project } from '@/lib/projects';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['planning', 'active', 'completed']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  requiredSkills: z.array(z.string()),
  teamSize: z.number().min(1, 'Team size must be at least 1'),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  initialData?: Project;
  onSubmit: (data: ProjectFormData) => void;
  isLoading?: boolean;
}

const commonSkills = [
  'React',
  'Node.js',
  'Python',
  'Java',
  'TypeScript',
  'AWS',
  'Docker',
];

export default function ProjectForm({ initialData, onSubmit, isLoading }: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      status: initialData?.status || 'planning',
      startDate: initialData?.startDate?.split('T')[0] || '',
      endDate: initialData?.endDate?.split('T')[0] || '',
      requiredSkills: initialData?.requiredSkills || [],
      teamSize: initialData?.teamSize || 1,
    },
  });

  const selectedSkills = watch('requiredSkills') || [];

  const handleSkillSelect = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      setValue('requiredSkills', [...selectedSkills, skill]);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setValue(
      'requiredSkills',
      selectedSkills.filter((skill) => skill !== skillToRemove)
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Project Name</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Enter project name"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Enter project description"
          className="min-h-[100px]"
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          onValueChange={(value) =>
            setValue('status', value as 'planning' | 'active' | 'completed')
          }
          defaultValue={initialData?.status || 'planning'}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            {...register('startDate')}
          />
          {errors.startDate && (
            <p className="text-sm text-destructive">{errors.startDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            {...register('endDate')}
          />
          {errors.endDate && (
            <p className="text-sm text-destructive">{errors.endDate.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Required Skills</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedSkills.map((skill) => (
            <div
              key={skill}
              className="flex items-center gap-1 bg-primary/10 text-primary rounded-full px-3 py-1"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="hover:text-destructive"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <Select onValueChange={handleSkillSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Add required skill" />
          </SelectTrigger>
          <SelectContent>
            {commonSkills.map((skill) => (
              <SelectItem
                key={skill}
                value={skill}
                disabled={selectedSkills.includes(skill)}
              >
                {skill}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="teamSize">Team Size</Label>
        <Input
          id="teamSize"
          type="number"
          min="1"
          {...register('teamSize', { valueAsNumber: true })}
        />
        {errors.teamSize && (
          <p className="text-sm text-destructive">{errors.teamSize.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Saving...' : initialData ? 'Update Project' : 'Create Project'}
      </Button>
    </form>
  );
} 