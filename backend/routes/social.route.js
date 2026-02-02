// routes/task.routes.js (or social.routes.js)
import express from "express";
import { 
  toggleLike, 
  toggleSave, 
  addComment, 
  addReply, 
  toggleCommentLike,
  getComments, 
  deleteComment,
  toggleReaction,
  reactToReply,
  deleteReply,
  getTaskReactions
} from '../controllers/social.controller.js';

import { verifyToken } from '../middleware/verfyToken.js';
import { upload } from "../controllers/message.controller.js";
const router = express.Router();

router.post('/tasks/:taskId/comments', verifyToken, upload.array('attachments', 5), addComment);
router.post('/tasks/:taskId/comments/:commentId/reply', verifyToken, upload.array('attachments', 5), addReply);
router.delete('/tasks/:taskId/comments/:commentId', verifyToken, deleteComment);
router.delete('/tasks/:taskId/comments/:commentId/replies/:replyId', verifyToken, deleteReply);
router.post('/tasks/:taskId/react', verifyToken, toggleReaction);
router.post('/tasks/:taskId/comments/:commentId/replies/:replyId/react', verifyToken, reactToReply);

// router.post('/tasks/:taskId/like', verifyToken, toggleLike);
router.post('/tasks/:taskId/save', verifyToken, toggleSave);
// router.post('/tasks/:taskId/comments', verifyToken, addComment);
router.get('/tasks/:taskId/comments', getComments);
router.post('/tasks/:taskId/comments/:commentId/reply', verifyToken, addReply);
router.post('/tasks/:taskId/comments/:commentId/like', verifyToken, toggleCommentLike);
router.get('/tasks/:taskId/reactions', verifyToken, getTaskReactions);


export default router;