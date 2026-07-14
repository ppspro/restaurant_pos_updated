import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

interface RoleGuardProps {
  allowedRoles: ('SUPER_ADMIN' | 'CASHIER')[];
}

export const RoleGuard = ({ allowedRoles }: RoleGuardProps) => {
  const { user } = useAuthStore();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RoleGuard;
