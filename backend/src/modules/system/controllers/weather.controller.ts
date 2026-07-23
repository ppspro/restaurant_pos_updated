import { Request, Response } from 'express';
import { weatherService } from '../services/weather.service';
import { logger } from '../../../shared/logger';

export const getWeather = async (req: Request, res: Response) => {
  try {
    const clientIp = req.ip || req.connection.remoteAddress;
    const data = await weatherService.getLocalWeather(clientIp);
    res.json(data);
  } catch (error: any) {
    logger.error(`Weather Controller Error: ${error.stack || error.message}`);
    res.status(500).json({ message: 'Failed to fetch weather data' });
  }
};
