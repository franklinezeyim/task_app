// sockets/socket.js
import User from '../models/user.model.js';

const onlineUsers = new Map(); // userId -> socketId
const userSockets = new Map(); // userId -> socketId

export const setupSocket = (io) => {
  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    console.log('🔌 Socket connected:', socket.id, 'userId:', userId);

    if (userId) {
      userSockets.set(userId, socket.id);
      onlineUsers.set(userId, socket.id);
      
      // Update user online status in database
      User.findByIdAndUpdate(userId, { isOnline: true }).catch(console.error);
      
      // Broadcast online status to all clients
      socket.broadcast.emit('user:status', { userId, isOnline: true });

      // ✅ Send current online users to the newly connected user
      socket.emit('online:users', { userIds: Array.from(onlineUsers.keys()) });
    }

    // Handle explicit online event
    socket.on('user:online', async ({ userId }) => {
      userSockets.set(userId, socket.id);
      onlineUsers.set(userId, socket.id);
      
      await User.findByIdAndUpdate(userId, { isOnline: true }).catch(console.error);
      
      socket.broadcast.emit('user:status', { userId, isOnline: true });
    });

    // Handle explicit offline event
    socket.on('user:offline', async ({ userId }) => {
      userSockets.delete(userId);
      onlineUsers.delete(userId);
      
      await User.findByIdAndUpdate(userId, { 
        isOnline: false, 
        lastSeen: new Date() 
      }).catch(console.error);
      
      socket.broadcast.emit('user:status', { userId, isOnline: false });
    });

    // Typing handlers
    socket.on('user:typing', ({ recipientId, conversationId }) => {
      const recipientSocketId = userSockets.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('user:typing', { 
          senderId: userId,
          conversationId 
        });
      }
    });

    socket.on('user:stop-typing', ({ recipientId, conversationId }) => {
      const recipientSocketId = userSockets.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('user:stop-typing', { 
          senderId: userId,
          conversationId 
        });
      }
    });

    // Message deleted
    socket.on('message:deleted', ({ messageId, canUndo }) => {
      socket.broadcast.emit('message:deleted', { messageId, canUndo });
    });

    // Message restored
    socket.on('message:restored', ({ messageId, message }) => {
      const recipientId = message.recipient._id || message.recipient;
      const recipientSocketId = userSockets.get(recipientId);
      
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('message:restored', { messageId, message });
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      const userId = socket.handshake.query.userId;
    console.log('🔌 Socket disconnected:', socket.id, 'userId:', userId);
      if (userId) {
        userSockets.delete(userId);
        onlineUsers.delete(userId);

        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: new Date()
        }).catch(console.error);

        socket.broadcast.emit('user:status', {
          userId,
          isOnline: false
        });
      }
    });
  });
};

// Helper function to get userId from socketId
function getUserIdFromSocket(socketId) {
  for (const [userId, sId] of userSockets.entries()) {
    if (sId === socketId) return userId;
  }
  return null;
}