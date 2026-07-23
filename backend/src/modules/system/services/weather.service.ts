import axios from 'axios';
import { logger } from '../../../shared/logger';
import { prisma } from '../../../prisma/client';

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

class WeatherService {
  private cache: { data: WeatherData | null; timestamp: number } = { data: null, timestamp: 0 };
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  async getLocalWeather(clientIp?: string): Promise<WeatherData> {
    const now = Date.now();
    if (this.cache.data && (now - this.cache.timestamp) < this.CACHE_TTL) {
      return this.cache.data;
    }

    try {
      let dbSettings = await prisma.restaurantSettings.findFirst();
      let settings: any = dbSettings;
      if (!dbSettings) {
        // If settings don't exist, we use a fallback but don't throw
        settings = {
          city: 'Bhubaneswar',
          weatherEnabled: true,
          latitude: null,
          longitude: null,
        };
      }

      if (!settings.weatherEnabled) {
        throw new Error('Weather is disabled in settings');
      }

      const apiKey = process.env.WEATHER_API_KEY;
      
      // If we don't have a real key, mock the response so the UI still works
      if (!apiKey || apiKey === 'mock_key_for_now' || apiKey === 'your_api_key') {
        logger.warn('Mocking weather data due to missing real API key');
        return this.returnMockData(settings);
      }

      let lat = settings.latitude ? Number(settings.latitude) : null;
      let lon = settings.longitude ? Number(settings.longitude) : null;
      let city = settings.city;

      let url = '';
      if (lat && lon) {
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
      } else if (city) {
        url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;
      } else {
        throw new Error('Location not configured in settings');
      }

      const response = await axios.get(url, { timeout: 5000 });
      const data = response.data;

      const weatherData: WeatherData = {
        location: data.name,
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        updatedAt: new Date().toISOString()
      };

      this.cache = { data: weatherData, timestamp: now };
      return weatherData;
    } catch (error: any) {
      logger.error(`Weather fetch failed: ${error.message}`);
      
      if (this.cache.data) {
        logger.warn('Returning stale weather cache due to API failure');
        return this.cache.data; // Return stale cache if API fails
      }
      
      return this.returnMockData(); // Ultimate fallback so frontend never receives 500 for weather
    }
  }

  private returnMockData(settings?: any): WeatherData {
    const data: WeatherData = {
      location: settings?.city || 'Bhubaneswar',
      temperature: 29,
      condition: 'Partly Cloudy',
      description: 'Scattered Clouds',
      icon: '03d',
      humidity: 81,
      windSpeed: 7.4,
      updatedAt: new Date().toISOString()
    };
    
    // Update cache with mock data so it doesn't try constantly on every render if API fails
    this.cache = { data, timestamp: Date.now() };
    return data;
  }
}

export const weatherService = new WeatherService();
