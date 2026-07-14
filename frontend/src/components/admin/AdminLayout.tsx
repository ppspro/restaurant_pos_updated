import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, ShieldCheck, Monitor,
  Printer, Settings, ScrollText, Database, Key, Activity, ChevronLeft, ChevronRight, Sliders
} from 'lucide-react';
import { DashboardHeader } from '../dashboard/DashboardHeader';

const navItems = [
  { label: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Users Control', path: '/admin/users', icon: Users },
  { label: 'Role Policies', path: '/admin/roles', icon: ShieldCheck },
  { label: 'Menu Management', path: '/admin/menu', icon: Sliders },
  { label: 'POS Registers', path: '/admin/terminals', icon: Monitor },
  { label: 'Thermal Printers', path: '/admin/printers', icon: Printer },
  { label: 'Platform Audits', path: '/admin/audit', icon: ScrollText },
  { label: 'System Settings', path: '/admin/settings', icon: Settings },
  { label: 'Data Backups', path: '/admin/backup', icon: Database },
  { label: 'SaaS License', path: '/admin/license', icon: Key },
  { label: 'System Health', path: '/admin/health', icon: Activity },
];

export default function AdminLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors duration-300">
      {/* Sidebar */}
      <aside
        className={`relative shrink-0 border-r border-border bg-card flex flex-col transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-4 h-6 w-6 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-primary shadow-sm z-10"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* Brand Header */}
        <div className={`px-4 py-5 border-b border-border flex items-center gap-2.5 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs shrink-0">
            AC
          </div>
          {!collapsed && (
            <div>
              <p className="text-[9px] uppercase tracking-widest font-extrabold text-muted-foreground leading-none">System</p>
              <h2 className="text-sm font-black mt-1 leading-none">Admin Panel</h2>
            </div>
          )}
        </div>

        {/* Nav list */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1.5 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 relative ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-800/40'
                } ${collapsed ? 'justify-center px-0' : ''}`}
                title={item.label}
              >
                {isActive && !collapsed && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full shadow-[0_0_8px_rgba(37,99,235,0.4)]"></span>}
                <Icon className={`w-4.5 h-4.5 shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="px-6 py-4 border-t border-border bg-slate-50/50 dark:bg-slate-950/10">
            <p className="text-[9px] text-muted-foreground font-extrabold uppercase tracking-wider">SUPER_ADMIN ACCESS</p>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Integrated Topbar */}
        <DashboardHeader />
        
        <main className="flex-1 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
