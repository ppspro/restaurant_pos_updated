import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller';
import { authenticate } from '../../../shared/middlewares/authenticate';

const router = Router();

router.get('/', authenticate, getSettings);
router.patch('/', authenticate, updateSettings);

export default router;
