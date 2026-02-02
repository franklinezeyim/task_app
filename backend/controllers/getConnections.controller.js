import mongoose from 'mongoose';
import Follow from '../models/follow.model.js';

export const getUserConnections = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const connections = await Follow.aggregate([
      {
        $match: { follower: userId }
      },
      {
        $lookup: {
          from: 'follows',
          let: { followedUser: '$following' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$follower', '$$followedUser'] },
                    { $eq: ['$following', userId] }
                  ]
                }
              }
            }
          ],
          as: 'mutual'
        }
      },
      { $match: { mutual: { $ne: [] } } },
      {
        $lookup: {
          from: 'users',
          localField: 'following',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          user: {
            _id: '$user._id',
            firstName: '$user.firstName',
            lastName: '$user.lastName',
            displayName: '$user.displayName',
            userImage: '$user.userImage',
            jobTitle: '$user.jobTitle',
            bio: '$user.bio'
          }
        }
      }
    ]);

    res.json({
      success: true,
      count: connections.length,
      data: connections.map(c => c.user)
    });

  } catch (error) {
    console.error('Connections error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
