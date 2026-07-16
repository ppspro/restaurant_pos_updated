import React from 'react';
import { Bell } from 'lucide-react';
// import { useQuery } from '@tanstack/react-query';
// import { notificationApi } from '../../api/notification.api';

export function NotificationBell() {
  // Hardcoded for Phase 1 UI structure
  const unreadCount = 3;

  return (
    <div className="relative cursor-pointer hover:bg-slate-800 p-2 rounded-full transition-colors">
      <Bell className="w-5 h-5 text-slate-300" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-slate-900">
          {unreadCount}
        </span>
      )}
    </div>
  );
}
