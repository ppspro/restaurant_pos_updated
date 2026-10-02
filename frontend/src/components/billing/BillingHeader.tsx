import React, { useState, useEffect, useRef } from 'react';
import { Search, Clock, Calendar, User, Scan, History, ArrowRight, LogOut, Lock, Key, FileText, ChevronDown, Sun, Moon } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useBillingStore } from '../../store/billing.store';
import { useAuthStore } from '../../store/auth.store';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../../theme/ThemeContext';
import { ProfileModal } from '../auth/ProfileModal';
import { ChangePasswordModal } from '../auth/ChangePasswordModal';
import { LockScreenOverlay } from '../auth/LockScreenOverlay';
import { ShiftDetailsModal } from '../auth/ShiftDetailsModal';

export const BillingHeader = () => {
  const {
    searchQuery,
    setSearchQuery,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    barcodeScan,
    cart,
    clearCart,
  } = useBillingStore();

  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const [time, setTime] = useState<string>('');
  const [businessDate, setBusinessDate] = useState<string>('Loading...');
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [simulatedBarcode, setSimulatedBarcode] = useState<string>('');
  const [scanStatus, setScanStatus] = useState<string>('');
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  
  // New Modals State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isLockScreenActive, setIsLockScreenActive] = useState(false);
  const [isShiftDetailsOpen, setIsShiftDetailsOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Live clock
  useEffect(() => {
    const formatter = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });
    setTime(formatter.format(new Date()));
    const timer = setInterval(() => {
      setTime(formatter.format(new Date()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Business Date
  useEffect(() => {
    const fetchDate = async () => {
      const fallbackDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date());
      try {
        const token = useAuthStore.getState().accessToken;
        const response = await axios.get('/api/v1/auth/business-day/active', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data?.businessDate) {
          const date = new Date(response.data.businessDate);
          setBusinessDate(new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date));
        } else {
          setBusinessDate(fallbackDate);
        }
      } catch (e) {
        setBusinessDate(fallbackDate);
      }
    };
    fetchDate();
  }, []);

  // Keyboard shortcut listener F1 & Logout (Ctrl+Shift+L)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setIsSignOutDialogOpen(true);
        setIsProfileOpen(false);
      }
      if (e.key === 'Escape') {
        setIsProfileOpen(false);
        setIsSignOutDialogOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside history overlay and profile dropdown
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (
        historyRef.current &&
        !historyRef.current.contains(e.target as Node) &&
        searchInputRef.current !== e.target
      ) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      addRecentSearch(searchQuery);
      setShowHistory(false);
    }
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulatedBarcode) return;
    const success = barcodeScan(simulatedBarcode);
    if (success) {
      setScanStatus('Success! Item added to cart.');
      setTimeout(() => setScanStatus(''), 2000);
    } else {
      setScanStatus('Failed: Barcode not found.');
      setTimeout(() => setScanStatus(''), 2000);
    }
    setSimulatedBarcode('');
  };

  const simulateRandomScan = () => {
    const mockBarcodes = ['8901234567890', '8901234567893', '8901234567894'];
    const chosen = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
    const success = barcodeScan(chosen);
    if (success) {
      setScanStatus(`Simulated Scan Success: Barcode ${chosen}`);
      setTimeout(() => setScanStatus(''), 2000);
    }
  };

  const handleSignOutClick = () => {
    setIsProfileOpen(false);
    if (cart.length > 0) {
      setLogoutError("You have items in the cart. Complete or clear the cart before signing out.");
    } else {
      setLogoutError('');
    }
    setIsSignOutDialogOpen(true);
  };

  const confirmSignOut = async () => {
    if (cart.length > 0) return;
    try {
      await logout('End of Shift');
      clearCart();
      localStorage.clear();
      sessionStorage.clear();
      // Use window.location.href to force a full page reload, ensuring all in-memory React Query caches and Zustand stores are completely wiped.
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <header className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 border-b bg-white dark:bg-gray-900 border-gray-150 dark:border-gray-800">
      <div className="flex items-center gap-3">
        <img
          src="/images/Shree Krishna banner.png"
          alt="Shree Krishna"
          className="h-10 object-contain rounded-lg shadow-sm"
        />
        <div>
          <h1 className="text-md font-bold text-gray-900 dark:text-white">Shree Krishna</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Terminal: <span className="font-semibold text-gray-700 dark:text-gray-200">T-01</span></p>
        </div>
      </div>

      {/* Center Search / History Drawer */}
      <div className="w-full max-w-md relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search items... (Press F1 to focus)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchSubmit}
            onFocus={() => setShowHistory(true)}
            className="pl-10 h-10 w-full"
          />
        </div>

        {/* Search history drop-down */}
        {showHistory && recentSearches.length > 0 && (
          <div
            ref={historyRef}
            className="absolute left-0 right-0 top-11 bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-800 rounded-xl shadow-xl z-50 p-3 space-y-2 text-xs"
          >
            <div className="flex justify-between text-[10px] uppercase font-bold text-gray-400">
              <span className="flex items-center gap-1">
                <History className="h-3.5 w-3.5" />
                Recent Searches
              </span>
              <button onClick={clearRecentSearches} className="hover:underline">Clear All</button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {recentSearches.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchQuery(s);
                    setShowHistory(false);
                  }}
                  className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 rounded-full transition-colors text-gray-700 dark:text-gray-300"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Barcode scanner panel simulation */}
      <div className="flex items-center gap-2">
        <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-1.5">
          <div className="relative w-36">
            <Scan className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              type="text"
              placeholder="Barcode scan..."
              value={simulatedBarcode}
              onChange={(e) => setSimulatedBarcode(e.target.value)}
              className="pl-7 h-8 text-[10px] w-full"
            />
          </div>
          <Button type="submit" size="sm" variant="outline" className="h-8 px-2 text-[10px] font-bold">
            <ArrowRight className="h-3 w-3" />
          </Button>
        </form>
        <Button onClick={simulateRandomScan} size="sm" className="h-8 text-[10px] font-bold shrink-0 bg-blue-500 hover:bg-blue-600">
          Simulate Scan
        </Button>
      </div>

      {/* Live Clock & User Profile */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-950/20 rounded-md border border-gray-100 dark:border-gray-800">
          <Calendar className="h-3.5 w-3.5 text-blue-500" />
          <span className="font-medium">{businessDate}</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-950/20 rounded-md border border-gray-100 dark:border-gray-800 min-w-[100px] justify-center">
          <Clock className="h-3.5 w-3.5 text-green-500 shrink-0" />
          <span className="font-mono text-xs">{time}</span>
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500 dark:text-gray-400 shrink-0"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        
        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 pl-1 pr-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                {user?.name || 'Cashier User'}
              </span>
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 leading-tight">
                {user?.role === 'SUPER_ADMIN' ? 'Administrator' : 'Cashier'}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 ml-1 text-gray-400" />
          </button>

          {isProfileOpen && (
            <>
              {/* Overlay blocker */}
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
              
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl z-50 overflow-hidden py-2 animate-fade-in-down">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 mb-2">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Signed In As</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.username || 'cashier'}</p>
              </div>
              <button onClick={() => { setIsProfileModalOpen(true); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                <User className="h-4 w-4" /> My Profile
              </button>
              <button onClick={() => { setIsChangePasswordOpen(true); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                <Key className="h-4 w-4" /> Change Password
              </button>
              <button onClick={() => { setIsLockScreenActive(true); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                <Lock className="h-4 w-4" /> Lock Screen
              </button>
              <button onClick={() => { setIsShiftDetailsOpen(true); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                <FileText className="h-4 w-4" /> Shift Details
              </button>
              <div className="h-px bg-gray-100 dark:bg-gray-800 my-2"></div>
              <button 
                onClick={handleSignOutClick}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
            </>
          )}
        </div>
      </div>

      {/* Scan status alert ribbon */}
      {scanStatus && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-blue-500 text-white font-bold text-xs px-4 py-1.5 rounded-full shadow-md animate-fade-in-down">
          {scanStatus}
        </div>
      )}

      {/* Sign Out Dialog */}
      {isSignOutDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-6 w-[400px] max-w-[90vw] animate-fade-in-up">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">End Shift & Sign Out</h2>
            
            {logoutError ? (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold rounded-lg">
                {logoutError}
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to sign out?<br/>
                Make sure all orders are completed before ending your shift.
              </p>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setIsSignOutDialogOpen(false)}
                className="font-bold rounded-xl"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmSignOut} 
                disabled={cart.length > 0}
                className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}

      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      <ChangePasswordModal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)} />
      <ShiftDetailsModal isOpen={isShiftDetailsOpen} onClose={() => setIsShiftDetailsOpen(false)} />
      {isLockScreenActive && <LockScreenOverlay onUnlock={() => setIsLockScreenActive(false)} />}
    </header>
  );
};
export default BillingHeader;
