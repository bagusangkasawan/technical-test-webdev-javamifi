// Inventory Routes - Routes untuk manajemen produk dan stok
import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware';
import * as inventoryController from '../controllers/inventoryController';

const router = Router();
router.use(authenticateToken);

router.get('/', inventoryController.getAllProducts);
router.get('/stats', inventoryController.getInventoryStats);
router.get('/categories', inventoryController.getCategories);
router.get('/:id', inventoryController.getProductById);
router.post('/', authorizeRoles('admin', 'manager'), inventoryController.createProduct);
router.put('/:id', authorizeRoles('admin', 'manager'), inventoryController.updateProduct);
router.patch('/:id/stock', authorizeRoles('admin', 'manager'), inventoryController.updateStock);
router.delete('/:id', authorizeRoles('admin'), inventoryController.deleteProduct);

export default router;
