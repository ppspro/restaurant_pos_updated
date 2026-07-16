import React, { useState } from 'react';
import { X, KeyRound, Eye, EyeOff, RefreshCcw } from 'lucide-react';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  username: string;
}

export function ResetPasswordModal({ isOpen, onClose, onSubmit, username }: ResetPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$!%*?&";
    let newPass = "";
    newPass += "A"; // Ensure uppercase
    newPass += "a"; // Ensure lowercase
    newPass += "1"; // Ensure number
    newPass += "@"; // Ensure special char
    for (let i = 0; i < 8; i++) {
      newPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(newPass);
    setError('');
  };

  const validate = () => {
    if (!password) {
      setError('Password is required');
      return false;
    }
    if (password.length < 8) {
      setError('Min 8 characters');
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setError('Need uppercase letter');
      return false;
    }
    if (!/[a-z]/.test(password)) {
      setError('Need lowercase letter');
      return false;
    }
    if (!/[0-9]/.test(password)) {
      setError('Need a number');
      return false;
    }
    if (!/[@$!%*?&]/.test(password)) {
      setError('Need special character');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(password);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-card w-full max-w-sm rounded-2xl shadow-xl border border-border overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold">Reset Password</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Reset password for <strong>{username}</strong>. You can type a new password or generate one.
            </p>
            <div className="space-y-1 relative">
              <label className="text-xs font-semibold text-muted-foreground">New Password *</label>
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    className="w-full h-10 pl-3 pr-10 text-sm rounded-xl border border-border bg-background focus:ring-1 focus:ring-blue-500" 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button type="button" onClick={generatePassword} title="Generate Password" className="h-10 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-foreground rounded-xl transition-colors">
                  <RefreshCcw className="w-4 h-4" />
                </button>
              </div>
              {error && <p className="text-[10px] text-red-500">{error}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-border">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm shadow-blue-500/20">
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
