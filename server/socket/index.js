const { Server } = require('socket.io');

let io;

/**
 * Initializes Socket.IO on the given HTTP server.
 * Each client joins a room keyed by their ownerId (userId or guest sessionId)
 * so cart updates only broadcast to that specific user's open tabs/devices.
 */
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    const { ownerId } = socket.handshake.query;

    if (!ownerId) {
      console.warn('Socket connected without ownerId, disconnecting.');
      socket.disconnect(true);
      return;
    }

    socket.join(ownerId);
    console.log(`Socket ${socket.id} joined room: ${ownerId}`);

    socket.on('disconnect', () => {
      console.log(`Socket ${socket.id} disconnected from room: ${ownerId}`);
    });
  });

  return io;
}

/**
 * Emits a cart:update event to a specific user's room.
 * Called by cart controllers after any successful DB mutation.
 */
function emitCartUpdate(ownerId, cartPayload) {
  if (!io) {
    console.warn('Socket.IO not initialized yet.');
    return;
  }
  io.to(ownerId).emit('cart:update', cartPayload);
}

module.exports = { initSocket, emitCartUpdate };
