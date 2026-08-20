import { Router } from 'express';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getServicesByCategory,
} from '../controllers/serviceController.js';
import { authenticate, authorize } from '../middleware/index.js';

const router = Router();

router.use(authenticate);

router.get('/', getAllServices);
router.get('/category/:category', getServicesByCategory);
router.get('/:id', getServiceById);
router.post('/', authorize('super_admin'), createService);
router.put('/:id', authorize('super_admin'), updateService);
router.delete('/:id', authorize('super_admin'), deleteService);

export default router;
