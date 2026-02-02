// sockets/server.js
import { Server } from "socket.io";
import { setupSocket } from "./socket.js"; // Your existing handler

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // Your React app port
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  setupSocket(io); // Your existing setupSocket function
  console.log("✅ Socket.IO server initialized on port 8000");
  
  return io;
};
