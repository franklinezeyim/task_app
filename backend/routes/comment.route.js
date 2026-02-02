// routes/comment.routes.js
import express from "express";
import {
  addComment,
  getComments,
  deleteComment,
  reactToComment,
  addReply,
  getReplies,
  deleteReply,
  reactToReply,
} from "../controllers/comment.controller.js";
import { verifyToken } from "../middleware/verfyToken.js";
import { upload } from "../controllers/message.controller.js"; // or wherever your multer config is

const router = express.Router();

// Comments
router.post("/tasks/:taskId/comments", verifyToken, upload.array("attachments", 5), addComment);
router.get("/tasks/:taskId/comments", verifyToken, getComments);
router.delete("/comments/:commentId", verifyToken, deleteComment);
router.post("/comments/:commentId/reactions", verifyToken, reactToComment);

// Replies
router.post("/comments/:commentId/replies", verifyToken, upload.array("attachments", 5), addReply);
router.get("/comments/:commentId/replies", verifyToken, getReplies);
router.delete("/replies/:replyId", verifyToken, deleteReply);
router.post("/replies/:replyId/reactions", verifyToken, reactToReply);

export default router;