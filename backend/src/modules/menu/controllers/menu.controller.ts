import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../prisma/client';
import fs from 'fs';
import path from 'path';

export const getMenuItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId, isAvailable, search } = req.query;
    
    const whereClause: any = {};
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }
    // Fix: isAvailable query could be "true" or "false" string, but what if we only want active/not deleted?
    // The instructions say "Do not accidentally filter out all records."
    // If we only filter isAvailable when it's passed, it should be fine.
    if (isAvailable !== undefined) {
      whereClause.isAvailable = isAvailable === 'true';
    }
    if (search) {
      const q = String(search).trim();
      whereClause.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { itemNumber: { contains: q, mode: 'insensitive' } }
      ];
    }

    const menuItems = await prisma.menuItem.findMany({
      where: whereClause,
      include: {
        category: true
      },
      orderBy: { name: 'asc' },
    });
    
    console.log("Menu Items:", menuItems.length);
    res.json({ success: true, data: menuItems });
  } catch (error) {
    next(error);
  }
};

export const createMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, categoryId, price, gst, itemType, image, isAvailable } = req.body;
    let finalItemNumber = req.body.itemNumber;

    if (!finalItemNumber) {
      // Fetch all auto-generated item numbers and find the true numerical max
      // This prevents collisions when items are created manually or out-of-order
      const allItems = await prisma.menuItem.findMany({
        where: { itemNumber: { startsWith: 'M' } },
        select: { itemNumber: true },
      });
      
      let maxNum = 0;
      for (const item of allItems) {
        if (item.itemNumber) {
          const num = parseInt(item.itemNumber.substring(1), 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }
      
      const nextNum = maxNum + 1;
      finalItemNumber = `M${String(nextNum).padStart(4, '0')}`;
    }


    const menuItem = await prisma.menuItem.create({
      data: {
        itemNumber: finalItemNumber,
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
    const { itemNumber, name, categoryId, price, gst, itemType, image, isAvailable } = req.body;

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

    const updateData: any = {
      name,
      categoryId,
      price,
      gst,
      itemType,
      image,
      isAvailable,
    };
    if (itemNumber) {
      updateData.itemNumber = itemNumber;
    }

    const menuItem = await prisma.menuItem.update({
      where: { id },
      data: updateData,
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
