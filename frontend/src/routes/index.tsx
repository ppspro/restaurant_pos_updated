import { createBrowserRouter, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import POSLayout from '../layouts/POSLayout';
import Login from '../pages/auth/Login';
import AdminDashboard from '../pages/admin/AdminDashboard';
import POSWorkspace from '../pages/billing/POSWorkspace';
import NotFound from '../pages/errors/NotFound';
import Unauthorized from '../pages/errors/Unauthorized';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import RoleGuard from './RoleGuard';

// Lazy-loaded pages
import ReportsDashboard from '../pages/reports/ReportsDashboard';
import OrderManagementDashboard from '../pages/orders/OrderManagementDashboard';
import InventoryLayout from '../components/inventory/InventoryLayout';
import InventoryDashboard from '../pages/inventory/InventoryDashboard';
import KitchenDashboard from '../pages/kitchen/KitchenDashboard';
import CustomerDashboard from '../pages/customers/CustomerDashboard';
import NotificationDashboard from '../pages/notifications/NotificationDashboard';
import AdminLayout from '../components/admin/AdminLayout';
import UserManagement from '../pages/admin/UserManagement';
import RoleManagement from '../pages/admin/RoleManagement';
import MenuManagement from '../pages/admin/MenuManagement';

// Newly created Admin Console pages
import Terminals from '../pages/admin/Terminals';
import Printers from '../pages/admin/Printers';
import AuditLogs from '../pages/admin/AuditLogs';
import SystemConfig from '../pages/admin/SystemConfig';
import Backup from '../pages/admin/Backup';
import License from '../pages/admin/License';
import SystemHealth from '../pages/admin/SystemHealth';

export const router = createBrowserRouter([
  // ── Public Routes ──
  {
    element: <PublicRoute />,
    children: [
      {
        path: '/login',
        element: <AuthLayout />,
        children: [{ index: true, element: <Login /> }],
      },
    ],
  },

  // ── Protected Routes ──
  {
    element: <ProtectedRoute />,
    children: [
      // ── Admin-only: Dashboard with sidebar ──
      {
        element: <RoleGuard allowedRoles={['SUPER_ADMIN']} />,
        children: [
          {
            path: '/dashboard',
            element: <DashboardLayout />,
            children: [
              { index: true, element: <AdminDashboard /> },
              { path: 'orders', element: <OrderManagementDashboard /> },
              { path: 'reports', element: <ReportsDashboard /> },
              { path: 'kitchen', element: <KitchenDashboard /> },
              { path: 'customers', element: <CustomerDashboard /> },
              { path: 'notifications', element: <NotificationDashboard /> },
            ],
          },
          // Inventory has its own sub-layout with tabs
          {
            path: '/inventory',
            element: <DashboardLayout />,
            children: [
              {
                element: <InventoryLayout />,
                children: [
                  { index: true, element: <InventoryDashboard /> },
                ],
              },
            ],
          },
          // Admin console has its own sidebar layout
          {
            path: '/admin',
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminDashboard /> },
              { path: 'users', element: <UserManagement /> },
              { path: 'roles', element: <RoleManagement /> },
              { path: 'menu', element: <MenuManagement /> },
              { path: 'terminals', element: <Terminals /> },
              { path: 'printers', element: <Printers /> },
              { path: 'audit', element: <AuditLogs /> },
              { path: 'settings', element: <SystemConfig /> },
              { path: 'backup', element: <Backup /> },
              { path: 'license', element: <License /> },
              { path: 'health', element: <SystemHealth /> },
            ],
          },
        ],
      },

      // ── POS Checkout (Admin + Cashier) ──
      {
        element: <RoleGuard allowedRoles={['SUPER_ADMIN', 'CASHIER']} />,
        children: [
          {
            path: '/billing',
            element: <POSWorkspace />,
          },
        ],
      },
    ],
  },

  // ── Standalone pages ──
  {
    path: '/unauthorized',
    element: <Unauthorized />,
  },
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
