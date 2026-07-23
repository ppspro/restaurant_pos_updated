import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../prisma/client';
import ExcelJS from 'exceljs';
import { ItemType } from '@prisma/client';
import multer from 'multer';

// Multer config for Excel
const storage = multer.memoryStorage();
export const uploadExcel = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  },
});

export const exportMenuItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const menuItems = await prisma.menuItem.findMany({
      include: { category: true },
      orderBy: { itemNumber: 'asc' }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Menu Items');

    worksheet.columns = [
      { header: 'Item Number', key: 'itemNumber', width: 15 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Price', key: 'price', width: 10 },
      { header: 'Item Type', key: 'itemType', width: 15 },
      { header: 'Available', key: 'isAvailable', width: 10 }
    ];

    menuItems.forEach(item => {
      worksheet.addRow({
        itemNumber: item.itemNumber,
        name: item.name,
        category: item.category.name,
        price: Number(item.price),
        itemType: item.itemType,
        isAvailable: item.isAvailable ? 'Yes' : 'No'
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=' + 'menu_items.xlsx');

    await workbook.xlsx.write(res);
    res.status(200).end();
  } catch (error) {
    next(error);
  }
};

export const importMenuItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer as any);
    const worksheet = workbook.worksheets[0];

    const results = { imported: 0, updated: 0, errors: [] as string[] };
    
    const defaultCategory = await prisma.category.findFirst();
    if (!defaultCategory) {
      return res.status(400).json({ success: false, message: 'No categories exist in the database' });
    }

    const categories = await prisma.category.findMany();
    const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));

    const rows = worksheet.getRows(2, worksheet.rowCount) || [];

    for (const row of rows) {
      let itemNumber = row.getCell(1).text?.trim();
      const name = row.getCell(2).text?.trim();
      const categoryName = row.getCell(3).text?.trim();
      const priceStr = row.getCell(4).text?.trim();
      const itemTypeStr = row.getCell(5).text?.trim();
      const availableStr = row.getCell(6).text?.trim();

      if (!name || !priceStr) {
        continue;
      }

      const price = parseFloat(priceStr);
      if (isNaN(price)) {
        results.errors.push(`Row ${row.number}: Invalid price for item ${name}`);
        continue;
      }

      const itemType = (itemTypeStr.toUpperCase() === 'PACKED') ? ItemType.PACKED : ItemType.KITCHEN;
      const isAvailable = (availableStr.toLowerCase() === 'no' || availableStr.toLowerCase() === 'false') ? false : true;
      
      let categoryId = defaultCategory.id;
      if (categoryName && categoryMap.has(categoryName.toLowerCase())) {
        categoryId = categoryMap.get(categoryName.toLowerCase())!;
      }

      if (!itemNumber) {
        const lastItem = await prisma.menuItem.findFirst({
          where: { itemNumber: { startsWith: 'M' } },
          orderBy: { itemNumber: 'desc' }
        });
        if (lastItem && lastItem.itemNumber) {
          const lastNum = parseInt(lastItem.itemNumber.substring(1), 10);
          itemNumber = `M${String(lastNum + 1).padStart(4, '0')}`;
        } else {
          itemNumber = 'M0001';
        }
      }

      try {
        const existing = await prisma.menuItem.findUnique({ where: { itemNumber } });
        if (existing) {
          await prisma.menuItem.update({
            where: { itemNumber },
            data: { name, categoryId, price, itemType, isAvailable }
          });
          results.updated++;
        } else {
          await prisma.menuItem.create({
            data: { itemNumber, name, categoryId, price, gst: 5.0, itemType, isAvailable }
          });
          results.imported++;
        }
      } catch (err: any) {
         results.errors.push(`Row ${row.number}: Error processing item ${name} - ${err.message}`);
      }
    }

    res.json({ success: true, ...results });
  } catch (error) {
    next(error);
  }
};
