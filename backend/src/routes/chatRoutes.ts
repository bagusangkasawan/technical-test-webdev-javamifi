// Chat Routes - Routes untuk AI chatbot dengan Gemini
import { Router } from 'express';
import { authenticateToken } from '../middleware';
import * as chatController from '../controllers/chatController';

const router = Router();
router.use(authenticateToken);

router.post('/', chatController.chat);
router.get('/analyze', chatController.analyzeData);
router.get('/sessions', chatController.getChatSessions);
router.get('/history/:sessionId', chatController.getChatHistory);
router.delete('/sessions/:sessionId', chatController.deleteChatSession);

export default router;
