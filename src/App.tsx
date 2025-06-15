import { useEffect } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  createRoutesFromElements,
  Route,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ManagerDashboard from './pages/manager/Dashboard';
import EngineerDashboard from './pages/engineer/Dashboard';
import ProjectList from './pages/projects/ProjectList';
import ProjectDetails from './pages/projects/ProjectDetails';
import EngineerList from './pages/engineers/EngineerList';
import EngineerDetails from './pages/engineers/EngineerDetails';
import AssignmentList from './pages/assignments/AssignmentList';
import NewAssignment from './pages/assignments/NewAssignment';
import ProfilePage from './pages/profile/ProfilePage';
import { useAuthStore } from './stores/auth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { isAuthenticated, user, checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        {/* Public Routes */}
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
        />
        <Route
          path="/register"
          element={!isAuthenticated ? <Register /> : <Navigate to="/" />}
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              user?.role === 'manager' ? (
                <ManagerDashboard />
              ) : (
                <EngineerDashboard />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/profile"
          element={
            isAuthenticated ? (
              <ProfilePage />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Manager Routes */}
        <Route
          path="/projects"
          element={
            isAuthenticated && user?.role === 'manager' ? (
              <ProjectList />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/projects/:id"
          element={
            isAuthenticated && user?.role === 'manager' ? (
              <ProjectDetails />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/engineers"
          element={
            isAuthenticated && user?.role === 'manager' ? (
              <EngineerList />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/engineers/:id"
          element={
            isAuthenticated && user?.role === 'manager' ? (
              <EngineerDetails />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/assignments"
          element={
            isAuthenticated && user?.role === 'manager' ? (
              <AssignmentList />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/assignments/new"
          element={
            isAuthenticated && user?.role === 'manager' ? (
              <NewAssignment />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Engineer Routes */}
        <Route
          path="/my-assignments"
          element={
            isAuthenticated && user?.role === 'engineer' ? (
              <AssignmentList />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </>
    ),
    {
      future: {
        v7_relativeSplatPath: true,
      },
    }
  );

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
