import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const notificationApi = {
  getInbox: async (): Promise<any[]> => {
    const { data } = await api.get('/notifications');
    return data.data;
  },
  getUnreadCount: async (): Promise<number> => {
    const { data } = await api.get('/notifications/unread-count');
    return data.data.count;
  },
  markAsRead: async (id: string) => {
    const { data } = await api.patch(`/notifications/${id}/read`);
    return data;
  },
  getPreferences: async () => {
    const { data } = await api.get('/notifications/preferences');
    return data.data;
  }
};

// ──────────────────────────────────
// React Query Hooks
// ──────────────────────────────────

/** Polls unread count every 15 seconds – used by the global header bell */
export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationApi.getUnreadCount,
    refetchInterval: 15000,
    staleTime: 10000,
  });
};

/** Full inbox – no aggressive polling, fetched on demand */
export const useNotificationInbox = () => {
  return useQuery({
    queryKey: ['notifications', 'inbox'],
    queryFn: notificationApi.getInbox,
    staleTime: 30000,
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: ['notifications', 'preferences'],
    queryFn: notificationApi.getPreferences,
  });
};
