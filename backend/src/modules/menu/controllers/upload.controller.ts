import { Request, Response } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../../../uploads/menu');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    if (file.mimetype === 'image/svg+xml') {
      return cb(new Error('SVG files are not allowed'));
    }
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

export const handleImageUpload = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Process image with sharp
    const timestamp = Date.now();
    const originalName = path.parse(req.file.originalname).name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const filename = `${originalName}-${timestamp}.webp`;
    const outputPath = path.join(uploadDir, filename);

    await sharp(req.file.buffer)
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);

    const imageUrl = `/uploads/menu/${filename}`;
    return res.json({ success: true, data: { imageUrl } });
  } catch (error: any) {
    console.error('Image upload error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Image upload failed' });
  }
};
