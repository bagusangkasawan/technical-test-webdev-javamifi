// User Routes - Routes untuk autentikasi dan manajemen pengguna
import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware';
import * as userController from '../controllers/userController';

const router = Router();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/password', authenticateToken, userController.updatePassword);
router.get('/', authenticateToken, authorizeRoles('admin'), userController.getAllUsers);
router.get('/:id', authenticateToken, authorizeRoles('admin', 'manager'), userController.getUserById);
router.put('/:id', authenticateToken, authorizeRoles('admin'), userController.updateUser);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), userController.deleteUser);

export default router;
