import React from 'react';
import type { NotificationType } from './GlobalNotificationProvider';

interface ToastProps {
  type: NotificationType;
  message: string;
  onClose?: () => void;
}

export const Toast = ({ type, message, onClose }: ToastProps) => {
  const bgClasses = {
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-400',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400',
    warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-900/30 dark:text-amber-400',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-900/30 dark:text-blue-400',
  };

  return (
    <div className={`p-4 border rounded-xl shadow-md ${bgClasses[type]} flex items-center justify-between`}>
      <span className="text-sm font-medium">{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-3 text-xs opacity-70 hover:opacity-100 focus:outline-none">
          Dismiss
        </button>
      )}
    </div>
  );
};
export default Toast;
