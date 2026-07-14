import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../prisma/client';
import fs from 'fs';
import path from 'path';

export const getMenuItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId, isAvailable } = req.query;
    
    const whereClause: any = {};
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }
    if (isAvailable !== undefined) {
      whereClause.isAvailable = isAvailable === 'true';
    }

    const menuItems = await prisma.menuItem.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    });
    
    res.json({ success: true, data: menuItems });
  } catch (error) {
    next(error);
  }
};

export const createMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, categoryId, price, gst, itemType, image, isAvailable } = req.body;
    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        categoryId,
        price,
        gst,
        itemType,
        image,
        isAvailable,
      },
    });
    res.status(201).json({ success: true, data: menuItem });
  } catch (error) {
    next(error);
  }
};

export const updateMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { name, categoryId, price, gst, itemType, image, isAvailable } = req.body;

    const existing = await prisma.menuItem.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    // Delete old image if it has changed
    if (existing.image && image && existing.image !== image) {
      const oldPath = path.join(__dirname, '../../../../', existing.image);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const menuItem = await prisma.menuItem.update({
      where: { id },
      data: {
        name,
        categoryId,
        price,
        gst,
        itemType,
        image,
        isAvailable,
      },
    });

    res.json({ success: true, data: menuItem });
  } catch (error) {
    next(error);
  }
};

export const deleteMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.menuItem.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    // Delete image if exists
    if (existing.image) {
      const imgPath = path.join(__dirname, '../../../../', existing.image);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }

    await prisma.menuItem.delete({ where: { id } });

    res.json({ success: true, message: 'Menu item deleted successfully' });
  } catch (error) {
    next(error);
  }
};
