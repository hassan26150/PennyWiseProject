const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const app = require('./src/app');
const connectDB = require('./src/config/db');
const env = require('./src/config/env');
const logger = require('./src/utils/logger');
const startPriceDropCron = require('./src/services/priceDropCron');
const startRecommendationCron = require('./src/services/recommendationCron');
const startDisputeCron = require('./src/services/disputeCron');

const startServer = async () => {
  // Connect to MongoDB Atlas
  await connectDB();

  // Create HTTP server
  const server = http.createServer(app);

  // Initialize Socket.IO
  const io = new Server(server, {
    cors: {
      origin: '*', // Allow mobile app clients
      methods: ['GET', 'POST']
    }
  });

  // Export io to be used in services
  app.set('io', io);

  // Authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }
    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`🔌 Socket connected: User ${socket.user.id}`);
    
    // Join a room based on the user's ID
    socket.join(socket.user.id.toString());

    socket.on('disconnect', () => {
      logger.info(`🔌 Socket disconnected: User ${socket.user.id}`);
    });
  });

  // Start background jobs
  startPriceDropCron();
  startRecommendationCron();
  startDisputeCron();

  // Start Express server
  server.listen(env.PORT, () => {
    logger.info(`🚀 PennyWise API & Socket.IO running on port ${env.PORT} [${env.NODE_ENV}]`);
    logger.info(`📍 Health check: http://localhost:${env.PORT}/api/health`);
  });
};

startServer().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
