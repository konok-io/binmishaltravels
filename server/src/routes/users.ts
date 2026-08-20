import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus,
} from '../controllers/userController.js';
import { register } from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/index.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('super_admin', 'branch_manager'), getAllUsers);
router.get('/:id', getUserById);
router.post('/', authorize('super_admin'), register);
router.put('/:id', authorize('super_admin', 'branch_manager'), updateUser);
router.delete('/:id', authorize('super_admin'), deleteUser);
router.patch('/:id/toggle-status', authorize('super_admin'), toggleUserStatus);

export default router;
