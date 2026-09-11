import { Server as SocketIOServer, Socket } from 'socket.io';
import { AuthService } from '../services/AuthService';
import { logger } from '../config/logger';

export const initializeSocketIO = (io: SocketIOServer) => {
  // Socket auth middleware
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    if (!token) {
      return next(new Error('Authentication error: Token required'));
    }
    try {
      const decoded = AuthService.verifyAccessToken(token);
      (socket as any).user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    logger.info(`Socket Connected: ${socket.id} (User: ${user?.userId})`);

    // Join user-scoped room
    if (user?.userId) {
      socket.join(`user:${user.userId}`);
    }

    // Join booking tracking room
    socket.on('booking:join', (bookingId: string) => {
      socket.join(`booking:${bookingId}`);
      logger.info(`User ${user?.userId} joined tracking room: booking:${bookingId}`);
    });

    // Real-time worker location updates
    socket.on('worker:location', (data: { bookingId: string; latitude: number; longitude: number }) => {
      io.to(`booking:${data.bookingId}`).emit('worker:location_update', {
        workerId: user?.userId,
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('disconnect', () => {
      logger.info(`Socket Disconnected: ${socket.id}`);
    });
  });
};
