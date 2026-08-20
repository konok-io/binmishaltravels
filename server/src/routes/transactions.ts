import { Router } from 'express';
import {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionStats,
} from '../controllers/transactionController.js';
import { authenticate, authorize } from '../middleware/index.js';

const router = Router();

router.use(authenticate);

router.get('/', getAllTransactions);
router.get('/stats', getTransactionStats);
router.get('/:id', getTransactionById);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', authorize('super_admin', 'branch_manager'), deleteTransaction);

export default router;
