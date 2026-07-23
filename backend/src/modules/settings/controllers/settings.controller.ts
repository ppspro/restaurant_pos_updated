import { Request, Response } from 'express';
import { prisma } from '../../../prisma/client';
import { logger } from '../../../shared/logger';

export const getSettings = async (req: Request, res: Response) => {
  try {
    let settings = await prisma.restaurantSettings.findFirst();
    if (!settings) {
      settings = await prisma.restaurantSettings.create({
        data: {
          restaurantName: "Express Diner",
          address: "123 Main St",
          phone: "123-456-7890",
          email: "info@expressdiner.com",
          gstNumber: "GST123456",
          city: "Bhubaneswar",
          country: "India",
        }
      });
    }
    res.json(settings);
  } catch (error: any) {
    logger.error(`Get Settings Error: ${error.message}`);
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    let settings = await prisma.restaurantSettings.findFirst();
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }

    settings = await prisma.restaurantSettings.update({
      where: { id: settings.id },
      data: {
        restaurantName: data.restaurantName ?? settings.restaurantName,
        address: data.address ?? settings.address,
        latitude: data.latitude ?? settings.latitude,
        longitude: data.longitude ?? settings.longitude,
        city: data.city ?? settings.city,
        country: data.country ?? settings.country,
        timezone: data.timezone ?? settings.timezone,
        weatherEnabled: data.weatherEnabled ?? settings.weatherEnabled,
        temperatureUnit: data.temperatureUnit ?? settings.temperatureUnit,
      }
    });

    res.json(settings);
  } catch (error: any) {
    logger.error(`Update Settings Error: ${error.message}`);
    res.status(500).json({ message: 'Failed to update settings' });
  }
};
