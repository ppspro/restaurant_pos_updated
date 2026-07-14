import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

export const PublicRoute = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    if (user.role === 'SUPER_ADMIN') {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/billing" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
