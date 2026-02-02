import express from 'express';
import {
  sendMessage,
  getMessages,
  getConversations,
  deleteMessage,
  markConversationAsRead,
  getUnreadCount,
  upload,
  restoreMessage
} from '../controllers/message.controller.js';
import { verifyToken } from '../middleware/verfyToken.js';

const router = express.Router();

router.use(verifyToken);

router.post('/send', upload.array('attachments', 5), sendMessage);
router.get('/conversations', getConversations);
router.get('/conversations/:conversationId', getMessages);
router.patch('/conversations/:conversationId/read', markConversationAsRead);
router.delete('/:messageId', deleteMessage);
router.patch('/:messageId/restore', restoreMessage);
router.get('/unread-count', getUnreadCount);

export default router;