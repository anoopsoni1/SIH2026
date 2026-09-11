import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { config } from './config/env';
import { connectDatabase } from './config/database';
import { logger } from './config/logger';
import { initializeSocketIO } from './sockets/socketHandler';

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: config.corsOrigin,
    methods: ['GET', 'POST'],
  },
});

initializeSocketIO(io);

const startServer = async () => {
  await connectDatabase();

  server.listen(config.port, () => {
    logger.info(`🚀 Cooperative Labour Marketplace API running on port ${config.port} [${config.env}]`);
  });
};

startServer().catch((err) => {
  logger.error('Server startup crash error:', err);
  process.exit(1);
});
