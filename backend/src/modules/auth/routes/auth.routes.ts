import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { ShiftController } from '../controllers/shift.controller';
import { TerminalHealthController } from '../controllers/terminalHealth.controller';
import { loginValidator } from '../validators/login.validator';
import { changePasswordValidator } from '../validators/changePassword.validator';
import { validate } from '../../../shared/middlewares/validate';
import { authenticate } from '../../../shared/middlewares/authenticate';
import { checkPermission } from '../../../shared/middlewares/permission';

const router = Router();

// Public routes
router.post('/login', loginValidator, validate, AuthController.login);
router.post('/refresh', AuthController.refresh);

// Authenticated routes
router.post('/logout', authenticate, AuthController.logout);
router.post('/logout-all', authenticate, AuthController.logoutAll);
router.get('/me', authenticate, AuthController.me);
router.put('/change-password', authenticate, changePasswordValidator, validate, AuthController.changePassword);

// Session Management
router.get('/sessions', authenticate, AuthController.getSessions);
router.delete('/sessions/:sessionId', authenticate, AuthController.terminateSession);

// Terminals and Shifts
router.get('/terminals', authenticate, ShiftController.getTerminals);
router.get('/business-day/active', authenticate, ShiftController.getActiveBusinessDay);
router.post('/business-day/open', authenticate, checkPermission('MANAGE_BUSINESS_DAY'), ShiftController.openBusinessDay);
router.post('/business-day/close', authenticate, checkPermission('MANAGE_BUSINESS_DAY'), ShiftController.closeBusinessDay);

router.get('/shifts/current', authenticate, checkPermission('VIEW_OWN_SHIFT'), ShiftController.getCurrentShift);
router.post('/shifts/open', authenticate, checkPermission('OPEN_OWN_SHIFT'), ShiftController.openShift);
router.post('/shifts/close', authenticate, checkPermission('CLOSE_OWN_SHIFT'), ShiftController.closeShift);

// Printers and Drawers
router.get('/printers', authenticate, TerminalHealthController.getPrinters);
router.get('/printers/diagnostics', authenticate, TerminalHealthController.getPrinterDiagnostics);
router.post('/printers/:printerId/test', authenticate, TerminalHealthController.testPrinter);

router.get('/shifts/:shiftId/summary', authenticate, checkPermission('VIEW_OWN_SHIFT'), TerminalHealthController.getShiftSummary);
router.post('/drawers/:drawerId/open', authenticate, TerminalHealthController.openDrawer);
router.post('/drawers/:drawerId/cash', authenticate, TerminalHealthController.adjustCash);

export default router;
export { router as authRouter };
