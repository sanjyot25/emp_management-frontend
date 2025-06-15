import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useToast } from '../../components/ui/use-toast';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Alert, AlertDescription } from '../../components/ui/alert';

interface Engineer {
  _id: string;
  name: string;
  email: string;
  skills: string[];
}

interface Project {
  _id: string;
  name: string;
  description: string;
  status: string;
}

interface AssignmentForm {
  engineerId: string;
  projectId: string;
  role: string;
  allocationPercentage: string | number;
  startDate: string;
  endDate: string;
}

interface AllocationConflict {
  message: string;
  allocations: Record<string, number>;
}

export default function NewAssignment() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState<AssignmentForm>({
    engineerId: '',
    projectId: '',
    role: '',
    allocationPercentage: '100',
    startDate: '',
    endDate: '',
  });
  const [errors, setErrors] = useState<Partial<AssignmentForm>>({});
  const [allocationConflict, setAllocationConflict] = useState<AllocationConflict | null>(null);

  const { data: engineers, isLoading: isLoadingEngineers } = useQuery<Engineer[]>({
    queryKey: ['engineers'],
    queryFn: async () => {
      const response = await api.get('/engineers');
      return response.data;
    },
  });

  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await api.get('/projects');
      return response.data;
    },
  });

  const createAssignment = useMutation({
    mutationFn: async (data: AssignmentForm) => {
      const response = await api.post('/assignments', data);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Assignment created successfully',
      });
      navigate('/assignments');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to create assignment';
      const validationErrors = error.response?.data?.errors;
      
      if (errorMessage.includes('sufficient capacity')) {
        setAllocationConflict({
          message: errorMessage,
          allocations: error.response?.data?.allocations || {},
        });
      }
      
      if (validationErrors) {
        setErrors(
          validationErrors.reduce((acc: any, err: any) => {
            acc[err.path] = err.msg;
            return acc;
          }, {})
        );
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  const handleAllocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm({
      ...form,
      allocationPercentage: value,
    });
    setErrors({ ...errors, allocationPercentage: undefined });
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<AssignmentForm> = {};
    
    if (!form.engineerId) {
      newErrors.engineerId = 'Engineer is required';
    }
    if (!form.projectId) {
      newErrors.projectId = 'Project is required';
    }
    if (!form.role) {
      newErrors.role = 'Role is required';
    }
    if (!form.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!form.endDate) {
      newErrors.endDate = 'End date is required';
    }
    if (form.startDate && form.endDate && new Date(form.startDate) > new Date(form.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    const allocation = Number(form.allocationPercentage);
    if (isNaN(allocation) || allocation < 0 || allocation > 100) {
      newErrors.allocationPercentage = 'Allocation must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      createAssignment.mutate({
        ...form,
        allocationPercentage: Number(form.allocationPercentage),
      });
    }
  };

  if (isLoadingEngineers || isLoadingProjects) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6">
          <div>Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            {allocationConflict && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  <p className="font-semibold">{allocationConflict.message}</p>
                  <p className="mt-2">The engineer is already fully allocated on these dates:</p>
                  <ul className="list-disc list-inside mt-1">
                    {Object.entries(allocationConflict.allocations).map(([date, allocation]) => (
                      <li key={date}>
                        {new Date(date).toLocaleDateString()} ({allocation}% allocated)
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Engineer</Label>
                <Select
                  value={form.engineerId}
                  onValueChange={(value) => {
                    setForm({ ...form, engineerId: value });
                    setErrors({ ...errors, engineerId: undefined });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an engineer" />
                  </SelectTrigger>
                  <SelectContent>
                    {engineers?.map((engineer) => (
                      <SelectItem key={engineer._id} value={engineer._id}>
                        {engineer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.engineerId && (
                  <p className="text-sm text-red-500">{errors.engineerId}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Project</Label>
                <Select
                  value={form.projectId}
                  onValueChange={(value) => {
                    setForm({ ...form, projectId: value });
                    setErrors({ ...errors, projectId: undefined });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.map((project) => (
                      <SelectItem key={project._id} value={project._id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.projectId && (
                  <p className="text-sm text-red-500">{errors.projectId}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  value={form.role}
                  onChange={(e) => {
                    setForm({ ...form, role: e.target.value });
                    setErrors({ ...errors, role: undefined });
                  }}
                  placeholder="e.g. Frontend Developer"
                />
                {errors.role && (
                  <p className="text-sm text-red-500">{errors.role}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Allocation Percentage</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={form.allocationPercentage}
                  onChange={handleAllocationChange}
                />
                {errors.allocationPercentage && (
                  <p className="text-sm text-red-500">{errors.allocationPercentage}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => {
                    setForm({ ...form, startDate: e.target.value });
                    setErrors({ ...errors, startDate: undefined });
                  }}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500">{errors.startDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => {
                    setForm({ ...form, endDate: e.target.value });
                    setErrors({ ...errors, endDate: undefined });
                  }}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500">{errors.endDate}</p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/assignments')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createAssignment.isPending}>
                  {createAssignment.isPending ? 'Creating...' : 'Create Assignment'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 