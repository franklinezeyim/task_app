import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';

// Follow a user
export const followUser = async (req, res) => {
  try {
    const { userId } = req.params; // User to follow
    const currentUserId = req.user.id; // Currently logged-in user

    // Prevent self-follow
    if (userId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    // Find both users
    const [userToFollow, currentUser] = await Promise.all([
      User.findById(userId),
      User.findById(currentUserId)
    ]);

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already following
    if (currentUser.following.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You are already following this user'
      });
    }

    // Add to following/followers arrays
    currentUser.following.push(userId);
    userToFollow.followers.push(currentUserId);

    // Update counts
    currentUser.followingCount = currentUser.following.length;
    userToFollow.followersCount = userToFollow.followers.length;

    await Promise.all([
      currentUser.save(),
      userToFollow.save()
    ]);

    // Create notification
    if (userToFollow.notificationSettings?.follows !== false) {
      await Notification.create({
        recipient: userId,
        sender: currentUserId,
        type: 'follow',
        title: 'New Follower',
        message: `${currentUser.displayName} started following you`,
        link: `/profile/${currentUserId}`
      });
    }

    console.log(`✅ ${currentUser.displayName} followed ${userToFollow.displayName}`);

    res.json({
      success: true,
      message: 'Successfully followed user',
      data: {
        isFollowing: true,
        followersCount: userToFollow.followersCount
      }
    });
  } catch (error) {
    console.error('❌ Follow user error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Unfollow a user
export const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params; // User to unfollow
    const currentUserId = req.user.id;

    // Find both users
    const [userToUnfollow, currentUser] = await Promise.all([
      User.findById(userId),
      User.findById(currentUserId)
    ]);

    if (!userToUnfollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if not following
    if (!currentUser.following.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You are not following this user'
      });
    }

    // Remove from following/followers arrays
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== userId
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== currentUserId
    );

    // Update counts
    currentUser.followingCount = currentUser.following.length;
    userToUnfollow.followersCount = userToUnfollow.followers.length;

    await Promise.all([
      currentUser.save(),
      userToUnfollow.save()
    ]);

    console.log(`✅ ${currentUser.displayName} unfollowed ${userToUnfollow.displayName}`);

    res.json({
      success: true,
      message: 'Successfully unfollowed user',
      data: {
        isFollowing: false,
        followersCount: userToUnfollow.followersCount
      }
    });
  } catch (error) {
    console.error('❌ Unfollow user error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get followers list
export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findById(userId)
      .populate({
        path: 'followers',
        select: 'displayName firstName lastName userImage bio followersCount jobTitle lastSeen',
        options: {
          skip: (parseInt(page) - 1) * parseInt(limit),
          limit: parseInt(limit)
        }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        followers: user.followers,
        total: user.followersCount,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(user.followersCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Get followers error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get following list
export const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findById(userId)
      .populate({
        path: 'following',
        select: 'displayName firstName lastName userImage bio followersCount jobTitle lastSeen',
        options: {
          skip: (parseInt(page) - 1) * parseInt(limit),
          limit: parseInt(limit)
        }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        following: user.following,
        total: user.followingCount,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(user.followingCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Get following error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Check if following a user
export const checkFollowStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId)
      .select('following');

    const isFollowing = currentUser.following.includes(userId);

    res.json({
      success: true,
      data: {
        isFollowing
      }
    });
  } catch (error) {
    console.error('❌ Check follow status error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get suggested users to follow
export const getSuggestedUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { limit = 5 } = req.query;

    const currentUser = await User.findById(currentUserId)
      .select('following');

    // Find users that current user is not following
    const suggestedUsers = await User.find({
      _id: { 
        $ne: currentUserId,
        $nin: currentUser.following 
      }
    })
      .select('displayName firstName lastName userImage bio followersCount lastSeen')
      .sort({ followersCount: -1 }) // Sort by popularity
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: suggestedUsers
    });
  } catch (error) {
    console.error('❌ Get suggested users error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};













// export const followUser = async (req, res) => {
//   const follower = req.user.id;
//   const following = req.params.userId;

//   if (follower === following) {
//     return res.status(400).json({ message: "Cannot follow yourself" });
//   }

//   await Follow.create({ follower, following });
//   res.json({ success: true });
// };

// export const unfollowUser = async (req, res) => {
//   await Follow.findOneAndDelete({
//     follower: req.user.id,
//     following: req.params.userId,
//   });

//   res.json({ success: true });
// };

// export const getFollowing = async (req, res) => {
//   const following = await Follow.find({ follower: req.user.id })
//     .populate("following", "displayName userImage");

//   res.json(following.map(f => f.following));
// };
