import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Search, UserX, MoreHorizontal, LogOut, Plus, KeyRound, X } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { usersApi } from '../../api/users.api';
import type { User, CreateUserRequest, UpdateUserRequest } from '../../types/user';
import { UserModal } from './UserModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { ResetPasswordModal } from './ResetPasswordModal';
import { authApi } from '../../api/auth.api';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [userToReset, setUserToReset] = useState<User | null>(null);

  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await usersApi.getUsers();
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err: any) {
      showToast(err.response?.data?.errors?.[0]?.message || 'Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateOrUpdate = async (data: CreateUserRequest | UpdateUserRequest) => {
    try {
      if (editingUser) {
        await usersApi.updateUser(editingUser.id, data as UpdateUserRequest);
        showToast('User updated successfully');
      } else {
        await usersApi.createUser(data as CreateUserRequest);
        showToast('User created successfully');
      }
      setIsUserModalOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      showToast(err.response?.data?.errors?.[0]?.message || 'Failed to save user', 'error');
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await usersApi.deleteUser(userToDelete.id);
      showToast('User deleted successfully');
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err: any) {
      showToast(err.response?.data?.errors?.[0]?.message || 'Failed to delete user', 'error');
    }
  };

  const handleResetPassword = async (newPassword: string) => {
    if (!userToReset) return;
    try {
      await usersApi.resetPassword(userToReset.id, { newPassword });
      showToast('Password reset successfully');
      setIsResetModalOpen(false);
      setUserToReset(null);
    } catch (err: any) {
      showToast(err.response?.data?.errors?.[0]?.message || 'Failed to reset password', 'error');
    }
  };

  const handleStatusToggle = async (user: User) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await usersApi.updateStatus(user.id, newStatus);
      showToast(`User status changed to ${newStatus}`);
      fetchUsers();
    } catch (err: any) {
      showToast(err.response?.data?.errors?.[0]?.message || 'Failed to update status', 'error');
    }
  };

  const handleForceLogout = async (user: User) => {
    try {
      // In a real app we might have a specific force logout API, but let's assume status inactive forces it or similar.
      showToast(`Logged out user ${user.username} (Mocked)`, 'success');
    } catch (err) {
      showToast('Failed to force logout', 'error');
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6 animate-fadeIn relative">
      {toast && (
        <div className={`fixed top-4 right-4 p-4 rounded-xl shadow-lg z-[100] text-sm font-bold text-white transition-all ${
          toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest text-blue-500 uppercase">Staff Accounts</span>
          <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white mt-1">User Management</h1>
          <p className="text-muted-foreground text-sm">Manage staff accounts, credentials, and active checkout sessions.</p>
        </div>
        <Button onClick={() => { setEditingUser(null); setIsUserModalOpen(true); }} className="h-10 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Create User
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9 h-10 text-xs rounded-xl border border-border bg-card focus-visible:ring-1 focus-visible:ring-blue-500"
          placeholder="Search by name, username, email, role…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <Card className="border border-border bg-card rounded-2xl overflow-hidden shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-slate-50/50 dark:bg-slate-950/20 text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground">
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Last Login</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading users...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No users found.</td></tr>
                ) : filtered.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8.5 h-8.5 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                          {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-[10px] text-muted-foreground font-medium">@{user.username} · {user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className={`text-[10px] font-bold ${
                        user.role.name === 'SUPER_ADMIN' ? 'border-amber-500/30 text-amber-500 bg-amber-500/5' : 'border-border text-muted-foreground'
                      }`}>
                        {user.role.name}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className={`flex items-center gap-1.5 text-xs font-semibold ${
                        user.status === 'ACTIVE' ? 'text-emerald-600' : 'text-muted-foreground'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground font-semibold">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleForceLogout(user)} title="Force Logout" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-muted-foreground hover:text-red-500 transition-colors">
                          <LogOut className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleStatusToggle(user)} title={user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-muted-foreground hover:text-amber-500 transition-colors">
                          <UserX className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setUserToReset(user); setIsResetModalOpen(true); }} title="Reset Password" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-muted-foreground hover:text-blue-500 transition-colors">
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setEditingUser(user); setIsUserModalOpen(true); }} title="Edit" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-muted-foreground hover:text-blue-500 transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setUserToDelete(user); setIsDeleteModalOpen(true); }} title="Delete" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-muted-foreground hover:text-red-500 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <UserModal 
        isOpen={isUserModalOpen} 
        onClose={() => { setIsUserModalOpen(false); setEditingUser(null); }}
        onSubmit={handleCreateOrUpdate}
        user={editingUser}
      />
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setUserToDelete(null); }}
        onConfirm={handleDelete}
      />
      <ResetPasswordModal
        isOpen={isResetModalOpen}
        onClose={() => { setIsResetModalOpen(false); setUserToReset(null); }}
        onSubmit={handleResetPassword}
        username={userToReset?.username || ''}
      />
    </div>
  );
}
