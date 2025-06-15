import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/auth';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import DashboardLayout from '../../components/layout/DashboardLayout';

interface Assignment {
  _id: string;
  projectId: {
    _id: string;
    name: string;
    description: string;
    status: string;
  };
  engineerId: {
    _id: string;
    name: string;
    email: string;
    skills: string[];
  };
  role: string;
  startDate: string;
  endDate: string;
  allocationPercentage: number;
}

export default function AssignmentList() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isManager = user?.role === 'manager';

  const { data: assignments, isLoading } = useQuery<Assignment[]>({
    queryKey: ['assignments'],
    queryFn: async () => {
      const response = await api.get('/assignments');
      return response.data;
    },
  });

  // Debug logs
  console.log('Logged-in user:', user);
  console.log('Assignments data:', assignments);

  // Filter assignments for engineers
  const filteredAssignments = isManager
    ? assignments
    : assignments?.filter((assignment) => assignment.engineerId._id === user?._id);

  if (isLoading) {
    return <div>Loading assignments...</div>;
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {isManager ? 'All Assignments' : 'My Assignments'}
          </h1>
          {isManager && (
            <Button onClick={() => navigate('/assignments/new')}>
              Create Assignment
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {filteredAssignments?.map((assignment) => (
            <Card key={assignment._id}>
              <CardHeader>
                <CardTitle>{assignment.projectId.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Engineer</p>
                    <p className="font-medium">{assignment.engineerId.name}</p>
                    <p className="text-sm text-gray-500">{assignment.role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Timeline</p>
                    <p className="font-medium">
                      {new Date(assignment.startDate).toLocaleDateString()} -{' '}
                      {new Date(assignment.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Allocation: {assignment.allocationPercentage}%
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  {isManager && (
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/projects/${assignment.projectId._id}`)}
                    >
                      View Project
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredAssignments?.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No assignments found
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 