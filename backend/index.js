import express from 'express';
import connectDb from './utils/connectDb.js';
import userRouter from './routes/user.route.js'
import profileRouter from './routes/profile.route.js'
import taskRouter from './routes/task.route.js'
import socialInteractions from './routes/social.route.js'

import followRoutes from './routes/follow.route.js';
import messageRoutes from './routes/message.route.js'
import notificationRoutes from './routes/notification.route.js';

import commentRoutes from "./routes/comment.route.js";

import cors from 'cors'
import cookieParser from 'cookie-parser';
import { startLateTaskChecker } from './utils/taskLateChecker.js';
import http from "http";
import { initSocket } from './sockets/server.js';




const app = express();

// // Middleware
// app.use(helmet({
//   crossOriginResourcePolicy: { policy: "cross-origin" },
// })); // Security headers

app.use(express.json())
app.use(cors({origin: process.env.CLIENT_URL, credentials: true}))
app.use(cookieParser())


app.use('/user', userRouter)
app.use('/user', profileRouter)
app.use('/task', taskRouter)

app.use('/socials', socialInteractions)

app.use('/follow', followRoutes);
app.use('/messages', messageRoutes);
app.use('/notifications', notificationRoutes);

app.use("/socials", commentRoutes);


startLateTaskChecker()

// app._router.stack.forEach((r) => {
//   if (r.route) {
//     console.log(Object.keys(r.route.methods), r.route.path);
//   }
// });


const server = http.createServer(app);
const io = initSocket(server)

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  connectDb();
  console.log(`🚀 Server + Socket.IO running on port ${PORT}`);
});

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
});