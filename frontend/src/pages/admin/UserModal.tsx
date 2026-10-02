import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import type { CreateUserRequest, UpdateUserRequest, User } from '../../types/user';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => void;
  user: User | null;
}

export function UserModal({ isOpen, onClose, onSubmit, user }: UserModalProps) {
  const [formData, setFormData] = useState<CreateUserRequest>({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'CASHIER',
    status: 'ACTIVE',
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone || '',
        role: user.role.name,
        status: user.status,
      });
      setConfirmPassword('');
      setErrors({});
    } else {
      setFormData({
        fullName: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        role: 'CASHIER',
        status: 'ACTIVE',
      });
      setConfirmPassword('');
      setErrors({});
    }
  }, [user, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName = 'Full Name is required';
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Valid Email is required';
    }
    
    if (!user) {
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 8) newErrors.password = 'Min 8 characters';
      else if (!/[A-Z]/.test(formData.password)) newErrors.password = 'Need uppercase letter';
      else if (!/[a-z]/.test(formData.password)) newErrors.password = 'Need lowercase letter';
      else if (!/[0-9]/.test(formData.password)) newErrors.password = 'Need a number';
      else if (!/[@$!%*?&]/.test(formData.password)) newErrors.password = 'Need special character';
      
      if (formData.password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-card w-full max-w-xl rounded-2xl shadow-xl border border-border overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-bold">{user ? 'Edit User' : 'Create User'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Full Name *</label>
              <input 
                type="text" 
                value={formData.fullName} 
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                className="w-full h-10 px-3 text-sm rounded-xl border border-border bg-background focus:ring-1 focus:ring-blue-500" 
              />
              {errors.fullName && <p className="text-[10px] text-red-500">{errors.fullName}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Username *</label>
              <input 
                type="text" 
                value={formData.username} 
                onChange={e => setFormData({...formData, username: e.target.value})}
                className="w-full h-10 px-3 text-sm rounded-xl border border-border bg-background focus:ring-1 focus:ring-blue-500" 
              />
              {errors.username && <p className="text-[10px] text-red-500">{errors.username}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Email *</label>
              <input 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full h-10 px-3 text-sm rounded-xl border border-border bg-background focus:ring-1 focus:ring-blue-500" 
              />
              {errors.email && <p className="text-[10px] text-red-500">{errors.email}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
              <input 
                type="text" 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full h-10 px-3 text-sm rounded-xl border border-border bg-background focus:ring-1 focus:ring-blue-500" 
              />
            </div>
          </div>

          {!user && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 relative">
                <label className="text-xs font-semibold text-muted-foreground">Password *</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full h-10 pl-3 pr-10 text-sm rounded-xl border border-border bg-background focus:ring-1 focus:ring-blue-500" 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-[10px] text-red-500">{errors.password}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Confirm Password *</label>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-xl border border-border bg-background focus:ring-1 focus:ring-blue-500" 
                />
                {errors.confirmPassword && <p className="text-[10px] text-red-500">{errors.confirmPassword}</p>}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Role</label>
              <select 
                value={formData.role} 
                onChange={e => setFormData({...formData, role: e.target.value})}
                className="w-full h-10 px-3 text-sm rounded-xl border border-border bg-background focus:ring-1 focus:ring-blue-500"
              >
                <option value="CASHIER">CASHIER</option>
                <option value="MANAGER">MANAGER</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Status</label>
              <select 
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value})}
                className="w-full h-10 px-3 text-sm rounded-xl border border-border bg-background focus:ring-1 focus:ring-blue-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors">
              {user ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
