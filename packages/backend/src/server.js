import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from 'redis';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create session endpoint
app.post('/api/sessions', async (req, res) => {
  try {
    const sessionId = uuidv4();
    const inviteToken = uuidv4();
    const ttl = parseInt(process.env.SESSION_TTL || '600');
    
    // Store in Redis with TTL
    const sessionData = {
      id: sessionId,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    
    await redis.setEx(
      `session:${sessionId}`,
      ttl,
      JSON.stringify(sessionData)
    );
    
    res.json({
      sessionId,
      inviteToken,
      inviteLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/join/${sessionId}?token=${inviteToken}`,
      expiresIn: ttl
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// WebSocket handlers
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join-session', (data) => {
    const { sessionId, userId } = data;
    socket.join(`session:${sessionId}`);
    console.log(`User ${userId} joined session ${sessionId}`);
  });

  socket.on('send-message', (data) => {
    const { sessionId, encryptedMessage, timestamp } = data;
    
    // Relay encrypted message to other user(s) in session
    io.to(`session:${sessionId}`).emit('receive-message', {
      encryptedMessage,
      timestamp,
      fromUser: socket.id
    });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.PORT || 3001;

redis.connect().then(() => {
  console.log('✅ Redis connected');
  
  httpServer.listen(PORT, () => {
    console.log(`✅ GhostChat Backend running on port ${PORT}`);
    console.log(`📡 WebSocket server ready`);
  });
}).catch(err => {
  console.error('❌ Failed to connect to Redis:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await redis.disconnect();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
