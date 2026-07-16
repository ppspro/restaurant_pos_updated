import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, Settings, FileText, Package, Users, Bell, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { name: 'Analytics Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'POS Checkout Portal', href: '/billing', icon: Receipt },
  { name: 'Orders Management', href: '/dashboard/orders', icon: Package },
  { name: 'Reports & Closeout', href: '/dashboard/reports', icon: FileText },
  { name: 'Staff Management', href: '/dashboard/customers', icon: Users },
  { name: 'System Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Admin Operations', href: '/admin', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 flex-col border-r border-gray-150 dark:border-gray-800 bg-white dark:bg-slate-900 md:flex shrink-0 select-none">
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-150 dark:border-gray-800 px-6 bg-slate-50/50 dark:bg-slate-950/20">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">
          ED
        </div>
        <span className="text-base font-extrabold tracking-tight text-gray-950 dark:text-white">
          Express Diner <span className="text-[10px] text-blue-500 font-bold tracking-normal">POS</span>
        </span>
      </div>
      
      <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">
        <span className="block text-[10px] font-extrabold tracking-wider text-gray-400 uppercase px-3 mb-2">Navigation</span>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/dashboard'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold tracking-wide transition-all relative',
                isActive
                  ? 'bg-slate-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-blue-650 rounded-r-lg"></span>}
                <item.icon className="h-4.5 w-4.5 shrink-0" />
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-150 dark:border-gray-800 p-4 bg-slate-50/50 dark:bg-slate-950/20">
        <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-slate-900 p-3.5 shadow-sm space-y-1 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <div>
            <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Terminal T01</p>
            <p className="text-[10px] text-gray-400">Replication Status: Online</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
