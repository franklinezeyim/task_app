// routes/follow.routes.js
import express from 'express';
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowStatus,
  getSuggestedUsers
} from '../controllers/follow.controller.js';
import { verifyToken } from '../middleware/verfyToken.js';
import { getUserConnections } from '../controllers/getConnections.controller.js';

const router = express.Router();

router.use(verifyToken); 
router.get('/users/me/connections', getUserConnections);

router.post('/:userId/follow', followUser);
router.delete('/:userId/unfollow', unfollowUser);
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);
router.get('/:userId/follow-status', checkFollowStatus);
router.get('/suggestions', getSuggestedUsers);



export default router;