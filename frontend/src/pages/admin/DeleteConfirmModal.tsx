import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  title = "Delete User",
  message = "Are you sure you want to delete this user? This action cannot be undone."
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-card w-full max-w-sm rounded-2xl shadow-xl border border-border overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <div className="flex items-center gap-2 text-red-500">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="text-lg font-bold">{title}</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {message}
          </p>
        </div>
        <div className="flex justify-end gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-sm shadow-red-500/20">
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
}
