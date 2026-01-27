import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', ({ roomId }: { roomId: string }) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('sendMessage', ({ roomId, content, receiverId }: { roomId: string; content: string; receiverId: string }) => {
    const messageData = {
      id: socket.id,
      roomId,
      content,
      senderId: socket.handshake.auth.userId,
      receiverId,
      sentAt: new Date(),
    };

    socket.to(roomId).emit('messageReceived', messageData);
    console.log(`Message sent in room ${roomId} from ${socket.handshake.auth.userId}`);
  });

  socket.on('typing', ({ roomId, isTyping }: { roomId: string; isTyping: boolean }) => {
    socket.to(roomId).emit('typing', {
      userId: socket.handshake.auth.userId,
      isTyping
    });
  });

  socket.on('messageRead', ({ roomId, messageId }: { roomId: string; messageId: string }) => {
    socket.to(roomId).emit('messageRead', {
      messageId,
      readAt: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import listingRoutes from './routes/listings.js';
import messageRoutes from './routes/messages.js';
import surveyRoutes from './routes/survey.js';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/survey', surveyRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const startServer = async () => {
  await connectDB();
  
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export { app, io };