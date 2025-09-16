import {
  chatController,
  sessionController,
} from '../controllers/chatController';
import { Router } from 'express';

const router = Router();

// Chat generation endpoint
router.post('/v1/create/chat/session', sessionController);
router.post('/v1/generate/chat/:session_id/response', chatController);

export default router;
