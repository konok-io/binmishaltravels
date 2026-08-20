import { Router } from 'express';
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
} from '../controllers/customerController.js';
import { authenticate, authorize } from '../middleware/index.js';

const router = Router();

router.use(authenticate);

router.get('/', getAllCustomers);
router.get('/search', searchCustomers);
router.get('/:id', getCustomerById);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', authorize('super_admin', 'branch_manager'), deleteCustomer);

export default router;
