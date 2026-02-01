// Routes Index - Konfigurasi semua API routes
import { Router } from 'express';
import userRoutes from './userRoutes';
import inventoryRoutes from './inventoryRoutes';
import financeRoutes from './financeRoutes';
import projectRoutes from './projectRoutes';
import chatRoutes from './chatRoutes';

const router = Router();

router.use('/auth', userRoutes);
router.use('/users', userRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/finance', financeRoutes);
router.use('/projects', projectRoutes);
router.use('/chat', chatRoutes);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
