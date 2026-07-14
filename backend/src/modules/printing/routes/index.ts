import { Router } from 'express';
import printerRoutes from './printer.routes';

const router = Router();
router.use('/', printerRoutes);

export default router;
