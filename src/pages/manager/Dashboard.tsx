import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Users, Briefcase, Calendar, Plus } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/auth';
import SearchBar, { SearchFilters } from '@/components/search/SearchBar';
import TeamUtilization from '@/components/analytics/TeamUtilization';
import ProjectDialog from '@/components/projects/ProjectDialog';
import { projectAPI, type Project } from '@/lib/projects';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  planning: number;
}

interface EngineerStats {
  total: number;
  available: number;
  fullyAllocated: number;
}

interface AssignmentStats {
  total: number;
  current: number;
  upcoming: number;
}

interface Engineer {
  _id: string;
  name: string;
  email: string;
  skills: string[];
  seniority: 'junior' | 'mid' | 'senior';
  maxCapacity: number;
  department: string;
}

interface Assignment {
  _id: string;
  engineerId: Engineer;
  projectId: Project;
  role: string;
  allocationPercentage: number;
  startDate: string;
  endDate: string;
}

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [projectStats, setProjectStats] = useState<ProjectStats>({
    total: 0,
    active: 0,
    completed: 0,
    planning: 0,
  });
  const [engineerStats, setEngineerStats] = useState<EngineerStats>({
    total: 0,
    available: 0,
    fullyAllocated: 0,
  });
  const [assignmentStats, setAssignmentStats] = useState<AssignmentStats>({
    total: 0,
    current: 0,
    upcoming: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

  const { data: projects, isLoading: isProjectsLoading, error: projectsError } = useQuery<Project[]>({
    queryKey: ['projects', searchQuery, searchFilters],
    queryFn: () => projectAPI.getAll({
      search: searchQuery,
      ...searchFilters,
    }),
    enabled: isAuthenticated && !isLoading,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  const { data: engineers } = useQuery<Engineer[]>({
    queryKey: ['engineers', searchQuery, searchFilters],
    queryFn: async () => {
      const response = await api.get('/engineers', {
        params: {
          search: searchQuery,
          ...searchFilters,
        },
      });
      return response.data;
    },
    enabled: isAuthenticated && !isLoading,
  });

  const { data: assignments } = useQuery<Assignment[]>({
    queryKey: ['assignments'],
    queryFn: async () => {
      const response = await api.get('/assignments');
      return response.data;
    },
    enabled: isAuthenticated && !isLoading,
  });

  useEffect(() => {
    if (projects) {
      setProjectStats({
        total: projects.length,
        active: projects.filter((p: any) => p.status === 'active').length,
        completed: projects.filter((p: any) => p.status === 'completed').length,
        planning: projects.filter((p: any) => p.status === 'planning').length,
      });
    }
  }, [projects]);

  useEffect(() => {
    if (engineers && assignments) {
      const now = new Date();
      const engineerAllocations = new Map();
      
      assignments.forEach((assignment: any) => {
        const startDate = new Date(assignment.startDate);
        const endDate = new Date(assignment.endDate);
        if (startDate <= now && endDate >= now) {
          const current = engineerAllocations.get(assignment.engineerId) || 0;
          engineerAllocations.set(assignment.engineerId, current + assignment.allocationPercentage);
        }
      });

      setEngineerStats({
        total: engineers.length,
        available: engineers.length - Array.from(engineerAllocations.values()).filter(v => v >= 100).length,
        fullyAllocated: Array.from(engineerAllocations.values()).filter(v => v >= 100).length,
      });
    }
  }, [engineers, assignments]);

  useEffect(() => {
    if (assignments) {
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
      
      setAssignmentStats({
        total: assignments.length,
        current: assignments.filter((a: any) => {
          const startDate = new Date(a.startDate);
          const endDate = new Date(a.endDate);
          return startDate <= now && endDate >= now;
        }).length,
        upcoming: assignments.filter((a: any) => {
          const startDate = new Date(a.startDate);
          return startDate > now && startDate <= thirtyDaysFromNow;
        }).length,
      });
    }
  }, [assignments]);

  const projectChartData = {
    labels: ['Active', 'Completed', 'Planning'],
    datasets: [
      {
        data: [projectStats.active, projectStats.completed, projectStats.planning],
        backgroundColor: ['#2563eb', '#16a34a', '#d97706'],
      },
    ],
  };

  const engineerChartData = {
    labels: ['Available', 'Fully Allocated'],
    datasets: [
      {
        data: [engineerStats.available, engineerStats.fullyAllocated],
        backgroundColor: ['#16a34a', '#dc2626'],
      },
    ],
  };

  const handleSearch = (query: string, filters: SearchFilters) => {
    setSearchQuery(query);
    setSearchFilters(filters);
  };

  const handleCreateProject = () => {
    setSelectedProject(undefined);
    setIsProjectDialogOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsProjectDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manager Dashboard</h1>
          <Button onClick={handleCreateProject}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Project
          </Button>
        </div>

        <div className="mb-8">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search engineers or projects..."
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Projects</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectStats.total}</div>
              <div className="h-[200px]">
                <Doughnut data={projectChartData} options={{ maintainAspectRatio: false }} />
              </div>
              <Button className="w-full mt-4" onClick={() => navigate('/projects')}>
                View Projects
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Engineers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{engineerStats.total}</div>
              <div className="h-[200px]">
                <Doughnut data={engineerChartData} options={{ maintainAspectRatio: false }} />
              </div>
              <Button className="w-full mt-4" onClick={() => navigate('/engineers')}>
                View Engineers
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Assignments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignmentStats.total}</div>
              <p className="text-xs text-muted-foreground">
                Current: {assignmentStats.current} | Upcoming: {assignmentStats.upcoming}
              </p>
              <div className="mt-4 space-y-2">
                <Button className="w-full" onClick={() => navigate('/assignments')}>
                  View Assignments
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => navigate('/assignments/new')}
                >
                  Create Assignment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-8">
          {engineers && assignments && (
            <TeamUtilization
              engineers={engineers}
              assignments={assignments}
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {isProjectsLoading && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading projects...</p>
                  </div>
                )}
                
                {projectsError && (
                  <div className="text-center py-4">
                    <p className="text-destructive">Failed to load projects</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => window.location.reload()}
                    >
                      Retry
                    </Button>
                  </div>
                )}

                {!isProjectsLoading && !projectsError && projects?.slice(0, 5).map((project) => (
                  <div
                    key={project._id}
                    className="flex items-center justify-between p-2 hover:bg-accent rounded-lg cursor-pointer"
                    onClick={() => handleEditProject(project)}
                  >
                    <div>
                      <div className="font-medium">{project.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Status: {project.status}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                ))}
                
                {!isProjectsLoading && !projectsError && !projects?.length && (
                  <div className="text-center py-4 text-muted-foreground">
                    No projects found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {assignments?.slice(0, 5).map((assignment: any) => (
                  <div
                    key={assignment._id}
                    className="flex items-center justify-between p-2 hover:bg-accent rounded-lg cursor-pointer"
                    onClick={() => navigate(`/projects/${assignment.projectId._id}`)}
                  >
                    <div>
                      <div className="font-medium">
                        {assignment.engineerId.name} - {assignment.projectId.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {assignment.role} ({assignment.allocationPercentage}%)
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ProjectDialog
        project={selectedProject}
        isOpen={isProjectDialogOpen}
        onClose={() => setIsProjectDialogOpen(false)}
      />
    </DashboardLayout>
  );
} 