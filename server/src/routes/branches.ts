import { Router } from 'express';
import {
  getAllBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
} from '../controllers/branchController.js';
import { authenticate, authorize } from '../middleware/index.js';

const router = Router();

router.use(authenticate);

router.get('/', getAllBranches);
router.get('/:id', getBranchById);
router.post('/', authorize('super_admin'), createBranch);
router.put('/:id', authorize('super_admin'), updateBranch);
router.delete('/:id', authorize('super_admin'), deleteBranch);

export default router;
