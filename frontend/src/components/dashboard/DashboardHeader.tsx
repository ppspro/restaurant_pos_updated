import React, { useState, useEffect } from 'react';
import { Menu, Bell, Search, Sun, Moon, Monitor, CheckCircle2, User, Settings, Lock, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LogoutDialog } from '../auth/LogoutDialog';

export function DashboardHeader() {
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4.5 w-4.5 text-amber-500 animate-fadeIn" />;
      case 'dark':
        return <Moon className="h-4.5 w-4.5 text-blue-400 animate-fadeIn" />;
      case 'system':
        return <Monitor className="h-4.5 w-4.5 text-gray-500 animate-fadeIn" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card px-4 md:px-6 backdrop-blur-md select-none">
      <div className="flex items-center gap-4 flex-1">
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
        
        {/* Modern Search bar */}
        <div className="hidden md:flex max-w-md w-full">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search catalog, order numbers, transactions..."
              className="h-9 w-80 lg:w-96 rounded-xl border border-border bg-slate-50/50 dark:bg-slate-950/20 focus-visible:bg-white pl-10 text-xs focus-visible:ring-1 focus-visible:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Current Time Display */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-900/50 border border-border rounded-xl text-xs font-semibold text-muted-foreground">
          <span>{currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          <span className="w-1 h-1 rounded-full bg-border"></span>
          <span className="text-foreground">{currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
        </div>
        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0 text-muted-foreground hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900"></span>
          <span className="sr-only">Notifications</span>
        </Button>

        {/* Theme Toggle Button */}
        <Button
          onClick={cycleTheme}
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl"
          title={`Active Theme: ${theme.toUpperCase()} (Click to toggle)`}
        >
          {getThemeIcon()}
          <span className="sr-only">Toggle theme</span>
        </Button>

        <div className="h-8 border-l border-border hidden sm:block"></div>

        {/* ── REDESIGNED PREMIUM USER PROFILE CARD ── */}
        <div className="relative">
          <div
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 px-3 py-1.5 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer select-none"
          >
            {/* Avatar Container */}
            <div className="relative h-11 w-11 shrink-0 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-violet-600 p-[2px] shadow-md hover:scale-103 transition-transform duration-300">
              <div className="h-full w-full rounded-full bg-slate-950 flex items-center justify-center text-white text-sm font-black tracking-wider">
                AU
              </div>
              {/* Online Indicator */}
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-950"></span>
            </div>
            
            <div className="hidden sm:block text-left">
              <div className="flex items-center gap-1">
                <p className="text-xs font-bold text-gray-900 dark:text-white leading-none">Admin User</p>
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <p className="text-[10px] text-muted-foreground font-semibold mt-1">System Administrator</p>
            </div>
          </div>

          {/* Premium Dropdown Menu */}
          {dropdownOpen && (
            <>
              {/* Overlay blocker */}
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
              
              <div className="absolute right-0 mt-2.5 w-52 rounded-2xl border border-border bg-card p-2 shadow-lg z-50 animate-fadeIn">
                <div className="px-3 py-2 border-b border-border text-left">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-none">Signed In As</p>
                  <p className="text-xs font-black mt-1 leading-none text-gray-900 dark:text-white">admin@pos.com</p>
                </div>
                <div className="space-y-1.5 mt-2">
                  <button
                    onClick={() => { setDropdownOpen(false); navigate('/admin'); }}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl w-full text-left transition-colors"
                  >
                    <User className="w-4 h-4 text-blue-500" /> My Profile
                  </button>
                  <button
                    onClick={() => { setDropdownOpen(false); navigate('/admin/settings'); }}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl w-full text-left transition-colors"
                  >
                    <Settings className="w-4 h-4 text-blue-500" /> Account Settings
                  </button>
                  <button
                    onClick={() => { setDropdownOpen(false); navigate('/admin/roles'); }}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl w-full text-left transition-colors"
                  >
                    <Lock className="w-4 h-4 text-blue-500" /> Change Password
                  </button>
                  
                  <div className="border-t border-border my-1.5"></div>
                  
                  <button
                    onClick={() => { setDropdownOpen(false); setIsLogoutModalOpen(true); }}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-xl w-full text-left transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <LogoutDialog isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} />
    </header>
  );
}
export default DashboardHeader;
