import { Router } from 'express';
import { AuditController } from '../controllers/audit.controller';

const router = Router();

router.get('/export', AuditController.exportAuditLogs);

export default router;
