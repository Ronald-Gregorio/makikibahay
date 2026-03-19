import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import listingRoutes from './routes/listings.js';
import messageRoutes from './routes/messages.js';
import verificationRoutes from './routes/verification.js';
import dashboardRoutes from './routes/dashboard.js';
import settingsRoutes from './routes/settings.js';
import savedSearchRoutes from './routes/savedSearches.js';
import walkthroughRoutes from './routes/walkthroughs.js';
// import surveyRoutes from './routes/survey.js';

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

const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    console.log(`CORS Debug: Request from ${origin} to ${req.url}`);
  }
  next();
});

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS Denied for origin:', origin);
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.set('io', io);

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

import uploadRoutes from './routes/upload.js';
import reviewRoutes from './routes/reviews.js';
import adminRoutes from './routes/admin.js';
import { initSettings } from './controllers/settingsController.js';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/saved-searches', savedSearchRoutes);
app.use('/api/walkthroughs', walkthroughRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const startServer = async () => {
  console.log('Starting server initialization...');
  console.log('Configured PORT:', PORT);
  console.log('MONGODB_URI present:', !!process.env.MONGODB_URI);

  try {
    await connectDB();
    console.log('Database connected successfully.');
    
    await initSettings();
    console.log('Default settings initialized.');

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { app, io };