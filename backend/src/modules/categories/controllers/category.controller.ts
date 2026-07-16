import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../prisma/client';

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { displayOrder: 'asc' },
    });
    console.log("Categories:", categories.length);
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};
