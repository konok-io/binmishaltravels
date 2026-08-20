import { Router } from 'express';
import authRoutes from './auth.js';
import branchRoutes from './branches.js';
import userRoutes from './users.js';
import serviceRoutes from './services.js';
import customerRoutes from './customers.js';
import transactionRoutes from './transactions.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/branches', branchRoutes);
router.use('/users', userRoutes);
router.use('/services', serviceRoutes);
router.use('/customers', customerRoutes);
router.use('/transactions', transactionRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
