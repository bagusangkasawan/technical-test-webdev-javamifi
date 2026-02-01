// Finance Routes - Routes untuk manajemen transaksi keuangan
import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware';
import * as financeController from '../controllers/financeController';

const router = Router();
router.use(authenticateToken);
router.use(authorizeRoles('admin', 'manager'));

router.get('/', financeController.getAllTransactions);
router.get('/summary', financeController.getFinanceSummary);
router.get('/categories', financeController.getTransactionsByCategory);
router.get('/monthly', financeController.getMonthlyReport);
router.get('/:id', financeController.getTransactionById);
router.post('/', financeController.createTransaction);
router.put('/:id', financeController.updateTransaction);
router.delete('/:id', authorizeRoles('admin'), financeController.deleteTransaction);

export default router;
