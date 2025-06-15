import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useToast } from '../../components/ui/use-toast';
import { useAuth } from '../../hooks/useAuth';

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
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed';
  requiredSkills: string[];
  teamSize: number;
  team: Array<{
    engineer: Engineer;
    role: string;
    allocationPercentage: number;
    startDate: string;
    endDate: string;
  }>;
}

interface AssignmentForm {
  engineerId: string;
  role: string;
  allocationPercentage: number;
  startDate: string;
  endDate: string;
}

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState<AssignmentForm>({
    engineerId: '',
    role: '',
    allocationPercentage: 100,
    startDate: '',
    endDate: '',
  });

  const { data: project } = useQuery<Project>({
    queryKey: ['project', id],
    queryFn: async () => {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    },
  });

  const { data: engineers } = useQuery<Engineer[]>({
    queryKey: ['engineers'],
    queryFn: async () => {
      const response = await api.get('/engineers');
      return response.data;
    },
  });

  const assignEngineerMutation = useMutation({
    mutationFn: async (data: AssignmentForm) => {
      const response = await api.post('/assignments', {
        ...data,
        projectId: id,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      setIsAssignDialogOpen(false);
      setAssignmentForm({
        engineerId: '',
        role: '',
        allocationPercentage: 100,
        startDate: '',
        endDate: '',
      });
      toast({
        title: 'Success',
        description: 'Engineer assigned to project successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to assign engineer',
        variant: 'destructive',
      });
    },
  });

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    assignEngineerMutation.mutate(assignmentForm);
  };

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        {user?.role === 'manager' && (
          <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button>Assign Engineer</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Engineer to Project</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAssignSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Engineer</label>
                  <Select
                    value={assignmentForm.engineerId}
                    onValueChange={(value) =>
                      setAssignmentForm({ ...assignmentForm, engineerId: value })
                    }
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
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Input
                    value={assignmentForm.role}
                    onChange={(e) =>
                      setAssignmentForm({ ...assignmentForm, role: e.target.value })
                    }
                    placeholder="e.g. Frontend Developer"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Allocation Percentage</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={assignmentForm.allocationPercentage}
                    onChange={(e) =>
                      setAssignmentForm({
                        ...assignmentForm,
                        allocationPercentage: parseInt(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={assignmentForm.startDate}
                    onChange={(e) =>
                      setAssignmentForm({ ...assignmentForm, startDate: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={assignmentForm.endDate}
                    onChange={(e) =>
                      setAssignmentForm({ ...assignmentForm, endDate: e.target.value })
                    }
                  />
                </div>

                <Button type="submit" className="w-full">
                  Assign Engineer
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Description</h3>
                <p className="text-gray-600">{project.description}</p>
              </div>
              <div>
                <h3 className="font-medium">Status</h3>
                <p className="text-gray-600">{project.status}</p>
              </div>
              <div>
                <h3 className="font-medium">Timeline</h3>
                <p className="text-gray-600">
                  {new Date(project.startDate).toLocaleDateString()} -{' '}
                  {new Date(project.endDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h3 className="font-medium">Required Skills</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {project.requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Members ({project.team.length}/{project.teamSize})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {project.team.map((member) => (
                <div
                  key={member.engineer._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium">{member.engineer.name}</div>
                    <div className="text-sm text-gray-600">
                      {member.role} • {member.allocationPercentage}% Allocation
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(member.startDate).toLocaleDateString()} -{' '}
                      {new Date(member.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/engineers/${member.engineer._id}`)}
                  >
                    View Profile
                  </Button>
                </div>
              ))}
              {project.team.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No team members assigned yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 