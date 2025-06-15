import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/auth';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Calendar, Clock } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Project {
  _id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed';
}

interface Assignment {
  _id: string;
  projectId: Project;
  role: string;
  allocationPercentage: number;
  startDate: string;
  endDate: string;
}

interface CapacityData {
  maxCapacity: number;
  currentAllocations: {
    project: string;
    percentage: number;
    startDate: string;
    endDate: string;
    role: string;
  }[];
  totalAllocated: number;
  availableCapacity: number;
}

export default function EngineerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [capacityData, setCapacityData] = useState<CapacityData>({
    maxCapacity: 100,
    currentAllocations: [],
    totalAllocated: 0,
    availableCapacity: 100,
  });

  const { data: capacity } = useQuery<CapacityData>({
    queryKey: ['engineer-capacity', user?._id],
    queryFn: async () => {
      const response = await api.get(`/engineers/${user?._id}/capacity`);
      return response.data;
    },
    enabled: !!user?._id,
  });

  const { data: assignments } = useQuery<Assignment[]>({
    queryKey: ['engineer-assignments', user?._id],
    queryFn: async () => {
      const response = await api.get(`/engineers/${user?._id}/assignments`);
      return response.data;
    },
    enabled: !!user?._id,
  });

  useEffect(() => {
    if (capacity) {
      setCapacityData(capacity);
    }
  }, [capacity]);

  const capacityChartData = {
    labels: ['Allocated', 'Available'],
    datasets: [
      {
        data: [capacityData.totalAllocated, capacityData.availableCapacity],
        backgroundColor: ['#2563eb', '#16a34a'],
      },
    ],
  };

  const currentAssignments = assignments?.filter((assignment: Assignment) => {
    const now = new Date();
    const startDate = new Date(assignment.startDate);
    const endDate = new Date(assignment.endDate);
    return startDate <= now && endDate >= now;
  }) || [];

  const upcomingAssignments = assignments?.filter((assignment: Assignment) => {
    const now = new Date();
    const startDate = new Date(assignment.startDate);
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    return startDate > now && startDate <= thirtyDaysFromNow;
  }) || [];

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Engineer Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Current Capacity</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{capacityData.totalAllocated}% Allocated</div>
              <div className="h-[200px]">
                <Doughnut data={capacityChartData} options={{ maintainAspectRatio: false }} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Current Projects</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentAssignments.length} Active</div>
              <p className="text-xs text-muted-foreground mb-4">
                {upcomingAssignments.length} upcoming in the next 30 days
              </p>
              <Button className="w-full" onClick={() => navigate('/my-assignments')}>
                View All Assignments
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentAssignments.map((assignment: Assignment) => (
                  <div
                    key={assignment._id}
                    className="flex items-center justify-between p-4 bg-accent/50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{assignment.projectId.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {assignment.role} • {assignment.allocationPercentage}% Allocation
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Project Status: {assignment.projectId.status}
                      </div>
                    </div>
                    {user?.role !== 'engineer' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/projects/${assignment.projectId._id}`)}
                      >
                        View Project
                      </Button>
                    )}
                  </div>
                ))}
                {currentAssignments.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No current assignments
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAssignments.map((assignment: Assignment) => (
                  <div
                    key={assignment._id}
                    className="flex items-center justify-between p-4 bg-accent/50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{assignment.projectId.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {assignment.role} • {assignment.allocationPercentage}% Allocation
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Starts: {new Date(assignment.startDate).toLocaleDateString()}
                      </div>
                    </div>
                    {user?.role !== 'engineer' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/projects/${assignment.projectId._id}`)}
                      >
                        View Project
                      </Button>
                    )}
                  </div>
                ))}
                {upcomingAssignments.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No upcoming assignments
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 