import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL as string;

export interface User {
  id: string;
  name: string;
  username: string;
  role: 'SUPER_ADMIN' | 'CASHIER';
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: any) => Promise<any>;
  logout: (reason?: string) => Promise<void>;
  setUser: (user: User | null) => void;
  refresh: () => Promise<string>;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: false,

      login: async (credentials) => {
        set({ loading: true });
        try {
          const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
          const { accessToken, refreshToken, user } = response.data.data;
          set({
            accessToken,
            refreshToken,
            user,
            isAuthenticated: true,
            loading: false,
          });
          return user;
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      logout: async (reason?: string) => {
        set({ loading: true });
        const { accessToken } = get();
        try {
          if (accessToken) {
            await axios.post(
              `${BASE_URL}/auth/logout`,
              { reason },
              {
                headers: { Authorization: `Bearer ${accessToken}` },
              }
            );
          }
        } catch (error) {
          console.error('Logout request failed:', error);
        } finally {
          get().clearSession();
          set({ loading: false });
        }
      },

      setUser: (user) => set({ user }),

      refresh: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          get().clearSession();
          throw new Error('No refresh token available');
        }

        try {
          const response = await axios.post(`${BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
          set({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          });
          return newAccessToken;
        } catch (error) {
          get().clearSession();
          throw error;
        }
      },

      clearSession: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'pos-auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
