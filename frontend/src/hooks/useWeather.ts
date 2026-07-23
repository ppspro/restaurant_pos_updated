import { useQuery } from '@tanstack/react-query';
import { api } from '../api/axios';

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  updatedAt: string;
}

export const useWeather = () => {
  return useQuery({
    queryKey: ['weather'],
    queryFn: async (): Promise<WeatherData> => {
      const response = await api.get('/system/weather');
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};
