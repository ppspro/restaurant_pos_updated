import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useQueryClient } from '@tanstack/react-query';

export const useAuth = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const authStoreLogin = useAuthStore((state) => state.login);
  const authStoreLogout = useAuthStore((state) => state.logout);
  const loading = useAuthStore((state) => state.loading);

  const login = async (credentials: any) => {
    setError(null);
    try {
      const user = await authStoreLogin(credentials);
      if (user.role === 'SUPER_ADMIN') {
        navigate('/dashboard');
      } else {
        navigate('/billing');
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.errors?.[0]?.message || err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errMsg);
    }
  };

  const logout = async (reason?: string) => {
    try {
      await authStoreLogout(reason);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      queryClient.clear();
      navigate('/login', { replace: true });
    }
  };

  return {
    login,
    logout,
    loading,
    error,
  };
};
export default useAuth;
