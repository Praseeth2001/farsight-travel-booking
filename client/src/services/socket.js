import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket;

/**
 * Creates (or returns existing) socket connection joined to the given owner's room.
 * ownerId comes from the cart API response (see CartContext), since the real
 * session identifier is stored in an httpOnly cookie and isn't readable by JS.
 */
export function connectSocket(ownerId) {
  if (socket && socket.connected) return socket;

  socket = io(SOCKET_URL, {
    query: { ownerId },
    withCredentials: true,
    transports: ['websocket', 'polling'],
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = undefined;
  }
}
