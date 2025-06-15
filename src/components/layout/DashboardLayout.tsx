import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import { Button } from '../ui/button';
import {
  Users,
  Briefcase,
  Calendar,
  LogOut,
  User,
  LayoutDashboard,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { user, clearAuth, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold">ERM System</h1>
              <div className="hidden md:flex items-center space-x-4">
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2"
                  onClick={() => navigate('/')}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
                {user?.role === 'manager' ? (
                  <>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2"
                      onClick={() => navigate('/projects')}
                    >
                      <Briefcase className="h-4 w-4" />
                      <span>Projects</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2"
                      onClick={() => navigate('/engineers')}
                    >
                      <Users className="h-4 w-4" />
                      <span>Engineers</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2"
                      onClick={() => navigate('/assignments')}
                    >
                      <Calendar className="h-4 w-4" />
                      <span>Assignments</span>
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2"
                    onClick={() => navigate('/my-assignments')}
                  >
                    <Calendar className="h-4 w-4" />
                    <span>My Assignments</span>
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                className="flex items-center space-x-2"
                onClick={() => navigate('/profile')}
              >
                <User className="h-4 w-4" />
                <span>{user?.name}</span>
              </Button>
              <Button
                variant="ghost"
                className="flex items-center space-x-2"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto py-6">{children}</main>
    </div>
  );
} 