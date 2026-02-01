// Project Routes - Routes untuk manajemen proyek dan tugas
import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware';
import * as projectController from '../controllers/projectController';

const router = Router();
router.use(authenticateToken);

router.get('/', projectController.getAllProjects);
router.get('/stats', projectController.getProjectStats);
router.get('/:id', projectController.getProjectById);
router.post('/', authorizeRoles('admin', 'manager'), projectController.createProject);
router.put('/:id', authorizeRoles('admin', 'manager'), projectController.updateProject);
router.delete('/:id', authorizeRoles('admin'), projectController.deleteProject);
router.post('/:id/tasks', authorizeRoles('admin', 'manager'), projectController.addTask);
router.put('/:projectId/tasks/:taskId', authorizeRoles('admin', 'manager'), projectController.updateTask);
router.patch('/:projectId/tasks/:taskId/toggle', projectController.toggleTask);
router.delete('/:projectId/tasks/:taskId', authorizeRoles('admin', 'manager'), projectController.deleteTask);

export default router;
