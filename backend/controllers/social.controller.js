// controllers/social.controller.js (or add to existing file)

import Task from "../models/task.model.js";

// controllers/social.controller.js

import cloudinary from '../utils/cloudinary.js';

// controllers/social.controller.js

export const addComment = async (req, res) => {

  try {
    const { taskId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    if (!text?.trim() && !req.files?.length) {
      return res.status(400).json({
        success: false,
        message: 'Comment text or attachment required'
      });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
//     console.log(task.comments.length);
// console.log(task.totalCommentsCount);


    // Upload attachments to Cloudinary
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = await Promise.all(req.files.map(async (file) => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              resource_type: 'auto',
              folder: 'todo_app/comments'
            },
            (error, result) => {
              if (error) {
                console.error('Cloudinary upload error:', error);
                reject(error);
              } else {
                resolve({
                  url: result.secure_url,
                  type: file.mimetype.startsWith('image/') ? 'image' :
                        file.mimetype.startsWith('video/') ? 'video' : 'file',
                  filename: file.originalname,
                  size: file.size
                });
              }
            }
          ).end(file.buffer);
        });
      }));
    }

    // ✅ Create comment object with proper structure
    const comment = {
      author: userId,
      text: text?.trim() || '',
      attachments: attachments, // Already an array
      likes: 0,
      likedBy: [],
      replies: [],
      deleted: false,
      createdAt: new Date()
    };

    if (!task.comments) task.comments = [];
    task.comments.push(comment);
    task.comment = task.comments.length;

    await task.save();
    
    // Populate after saving
    await task.populate('comments.author', 'displayName userImage');

    // Create notification
        // if (userToFollow.notificationSettings?.follows !== false) {
        //   await Notification.create({
        //     recipient: userId,
        //     sender: currentUserId,
        //     type: 'follow',
        //     title: 'New Follower',
        //     message: `${currentUser.displayName} started following you`,
        //     link: `/profile/${currentUserId}`
        //   });
        // }

    res.status(201).json({
      success: true,
      data: task.comments[task.comments.length - 1]
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add reply with attachments
export const addReply = async (req, res) => {
  try {
    const { taskId, commentId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    console.log('📝 Add reply request:', { 
      taskId, 
      commentId, 
      text, 
      filesCount: req.files?.length,
      userId 
    });

    if (!text?.trim() && !req.files?.length) {
      return res.status(400).json({
        success: false,
        message: 'Reply text or attachment required'
      });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const comment = task.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Upload attachments to Cloudinary
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = await Promise.all(req.files.map(async (file) => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              resource_type: 'auto',
              folder: 'todo_app/replies'
            },
            (error, result) => {
              if (error) {
                console.error('Cloudinary upload error:', error);
                reject(error);
              } else {
                resolve({
                  url: result.secure_url,
                  type: file.mimetype.startsWith('image/') ? 'image' :
                        file.mimetype.startsWith('video/') ? 'video' : 'file',
                  filename: file.originalname,
                  size: file.size
                });
              }
            }
          ).end(file.buffer);
        });
      }));
    }

    const reply = {
      author: userId,
      text: text?.trim() || '',
      attachments: attachments,
      createdAt: new Date()
    };

    comment.replies.unshift(reply);
    await task.save();
    
    await task.populate('comments.author', 'displayName userImage');
    await task.populate('comments.replies.author', 'displayName userImage');

    res.status(201).json({
      success: true,
      data: comment.replies[comment.replies.length - 1]
    });
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const { taskId, commentId } = req.params;
    const userId = req.user.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const comment = task.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Only author can delete
    if (comment.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    comment.deleted = true;
    comment.text = '';
    comment.attachments = [];

    await task.save();

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete reply
export const deleteReply = async (req, res) => {
  try {
    const { taskId, commentId, replyId } = req.params;
    const userId = req.user.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const comment = task.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }

    // Only author can delete
    if (reply.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this reply'
      });
    }

    reply.deleted = true;
    reply.text = '';
    reply.attachments = [];

    await task.save();

    res.json({
      success: true,
      message: 'Reply deleted successfully'
    });
  } catch (error) {
    console.error('Delete reply error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Toggle reaction (like, love, celebrate, dislike)
export const toggleReaction = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { reactionType } = req.body; // 'like', 'love', 'celebrate', 'dislike'
    const userId = req.user.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (!task.reactions) {
      task.reactions = { like: [], love: [], celebrate: [], dislike: [] };
    }

    // Check if user already reacted with the selected type
    const alreadyReacted = task.reactions[reactionType]?.includes(userId);

    // Remove user from all reaction types first
    ['like', 'love', 'celebrate', 'dislike'].forEach(type => {
      const index = task.reactions[type]?.indexOf(userId);
      if (index > -1) {
        task.reactions[type].splice(index, 1);
      }
    });

    // If user wasn't already reacted with this type, add them
    if (!alreadyReacted) {
      task.reactions[reactionType].push(userId);
    }
    // If they were already reacted, we leave them removed (effectively un-reacting)

    // Update total likes count
    task.likes = Object.values(task.reactions).reduce((sum, arr) => sum + arr.length, 0);

    await task.save();

    res.json({
      success: true,
      data: {
        reactions: task.reactions,
        likes: task.likes
      }
    });
  } catch (error) {
    console.error('Toggle reaction error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Reaction for reply section
export const reactToReply = async (req, res) => {
  const { taskId, commentId, replyId } = req.params;
  const { reactionType } = req.body;
  const userId = req.user.id;

  const task = await Task.findById(taskId);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const comment = task.comments.id(commentId);
  if (!comment) return res.status(404).json({ message: 'Comment not found' });

  const reply = comment.replies.id(replyId);
  if (!reply) return res.status(404).json({ message: 'Reply not found' });

  if (!reply.reactions?.[reactionType]) {
    return res.status(400).json({ message: 'Invalid reaction type' });
  }

  // 🔁 Remove user from all reactions first (LinkedIn-style)
  Object.keys(reply.reactions).forEach(type => {
    reply.reactions[type] = reply.reactions[type].filter(
      id => id.toString() !== userId
    );
  });

  // ✅ Toggle new reaction
  reply.reactions[reactionType].push(userId);

  await task.save();

  res.json({
    success: true,
    reactions: reply.reactions
  });
};

// Like/Unlike a task
export const toggleLike = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user already liked
    const likeIndex = task.likedBy?.indexOf(userId);
    
    if (likeIndex > -1) {
      // Unlike
      task.likedBy.splice(likeIndex, 1);
      task.likes = Math.max(0, (task.likes || 0) - 1);
    } else {
      // Like
      if (!task.likedBy) task.likedBy = [];
      task.likedBy.push(userId);
      task.likes = (task.likes || 0) + 1;
    }

    await task.save();

    res.json({
      success: true,
      data: {
        likes: task.likes,
        isLiked: likeIndex === -1
      }
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// Toggle comment like
export const toggleCommentLike = async (req, res) => {
  try {
    const { taskId, commentId } = req.params;
    const userId = req.user.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const comment = task.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const likeIndex = comment.likedBy?.indexOf(userId);
    
    if (likeIndex > -1) {
      comment.likedBy.splice(likeIndex, 1);
      comment.likes = Math.max(0, (comment.likes || 0) - 1);
    } else {
      if (!comment.likedBy) comment.likedBy = [];
      comment.likedBy.push(userId);
      comment.likes = (comment.likes || 0) + 1;
    }

    await task.save();

    res.json({
      success: true,
      data: {
        likes: comment.likes,
        isLiked: likeIndex === -1
      }
    });
  } catch (error) {
    console.error('Toggle comment like error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Toggle save task
export const toggleSave = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const saveIndex = task.savedBy?.indexOf(userId);
    
    if (saveIndex > -1) {
      // Unsave
      task.savedBy.splice(saveIndex, 1);
      task.saves = Math.max(0, (task.saves || 0) - 1);
    } else {
      // Save
      if (!task.savedBy) task.savedBy = [];
      task.savedBy.push(userId);
      task.saves = (task.saves || 0) + 1;
    }

    await task.save();

    res.json({
      success: true,
      data: {
        saves: task.saves,
        isSaved: saveIndex === -1
      }
    });
  } catch (error) {
    console.error('Toggle save error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get comments for a task with pagination
export const getComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const task = await Task.findById(taskId)
      .populate('comments.author', 'displayName userImage')
      .populate('comments.replies.author', 'displayName userImage');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const comments = (task.comments || [])
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedComments = comments.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedComments,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(comments.length / limit),
        totalComments: comments.length,
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// export const getComments = async (req, res) => {
//   try {
//     const { taskId } = req.params;

//     const task = await Task.findById(taskId)
//       .populate('comments.author', 'displayName userImage')
//       .populate('comments.replies.author', 'displayName userImage');

//     if (!task) {
//       return res.status(404).json({
//         success: false,
//         message: 'Task not found'
//       });
//     }

//     res.json({
//       success: true,
//       data: task.comments || []
//     });
//   } catch (error) {
//     console.error('Get comments error:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// GET /tasks/:taskId/reactions
export const getTaskReactions = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId)
      .populate('reactions.like', 'displayName userImage jobTitle bio')
      .populate('reactions.love', 'displayName userImage jobTitle bio')
      .populate('reactions.celebrate', 'displayName userImage jobTitle bio')
      .populate('reactions.dislike', 'displayName userImage jobTitle bio');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({
      success: true,
      data: task.reactions,
    });
  } catch (error) {
    console.error('Get reactions error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
