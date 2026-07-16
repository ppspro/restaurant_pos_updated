import { Router } from 'express';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../controllers/menu.controller';
import { upload, handleImageUpload } from '../controllers/upload.controller';

const router = Router();

router.get('/', getMenuItems);
router.post('/', createMenuItem);
router.put('/:id', updateMenuItem);
router.delete('/:id', deleteMenuItem);
router.post('/upload-image', upload.single('image'), handleImageUpload);

export default router;
