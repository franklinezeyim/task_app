import Notification from '../models/notification.model.js';
import User from '../models/user.model.js';

// Get user's notifications
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, unreadOnly = false } = req.query;

    const query = { recipient: userId };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('sender', 'displayName userImage')
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ recipient: userId, read: false })
    ]);

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('❌ Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('❌ Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { recipient: userId, read: false },
      { 
        $set: { 
          read: true, 
          readAt: new Date() 
        } 
      }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('❌ Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const result = await Notification.deleteOne({
      _id: notificationId,
      recipient: userId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('❌ Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete all notifications
export const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.deleteMany({ recipient: userId });

    res.json({
      success: true,
      message: 'All notifications deleted'
    });
  } catch (error) {
    console.error('❌ Delete all notifications error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get unread notification count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Notification.countDocuments({
      recipient: userId,
      read: false
    });

    res.json({
      success: true,
      data: {
        unreadCount: count
      }
    });
  } catch (error) {
    console.error('❌ Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update notification settings
export const updateNotificationSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, push, follows, messages, tasks } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update settings
    if (email !== undefined) user.notificationSettings.email = email;
    if (push !== undefined) user.notificationSettings.push = push;
    if (follows !== undefined) user.notificationSettings.follows = follows;
    if (messages !== undefined) user.notificationSettings.messages = messages;
    if (tasks !== undefined) user.notificationSettings.tasks = tasks;

    await user.save();

    res.json({
      success: true,
      message: 'Notification settings updated',
      data: user.notificationSettings
    });
  } catch (error) {
    console.error('❌ Update notification settings error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to create notification (can be imported by other controllers)
export const createNotification = async ({
  recipientId,
  senderId,
  type,
  title,
  message,
  link,
  relatedTask,
  relatedMessage
}) => {
  try {
    // Check if recipient has this notification type enabled
    const recipient = await User.findById(recipientId).select('notificationSettings');
    
    const settingMap = {
      'follow': 'follows',
      'message': 'messages',
      'task_comment': 'tasks',
      'task_like': 'tasks',
      'task_mention': 'tasks',
      'task_assigned': 'tasks'
    };

    const settingKey = settingMap[type];
    if (settingKey && recipient.notificationSettings?.[settingKey] === false) {
      console.log(`⏭️ Notification skipped (user settings): ${type} for ${recipientId}`);
      return null;
    }

    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      title,
      message,
      link,
      relatedTask,
      relatedMessage
    });

    console.log(`✅ Notification created: ${type} for ${recipientId}`);
    return notification;
  } catch (error) {
    console.error('❌ Create notification error:', error);
    return null;
  }
};













// export const getNotifications = async (req, res) => {
//   const notifications = await Notification.find({ user: req.user.id })
//     .sort({ createdAt: -1 })
//     .limit(20);

//   res.json(notifications);
// };

// export const markAsRead = async (req, res) => {
//   await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
//   res.json({ success: true });
// };
