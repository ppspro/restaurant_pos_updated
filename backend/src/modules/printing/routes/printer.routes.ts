import { Router } from 'express';
import {
  getPrinters,
  getPrinterById,
  createPrinter,
  updatePrinter,
  deletePrinter,
  testPrint
} from '../controllers/printer.controller';

const router = Router();

router.get('/', getPrinters);
router.get('/:id', getPrinterById);
router.post('/', createPrinter);
router.put('/:id', updatePrinter);
router.delete('/:id', deletePrinter);
router.post('/:id/test', testPrint);

export default router;
