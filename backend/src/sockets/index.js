import registerTrackingHandlers from './tracking.socket.js';
import registerNotificationHandlers from './notifications.socket.js';

export default function registerAllSocketHandlers(io, socket) {
  registerTrackingHandlers(io, socket);
  registerNotificationHandlers(io, socket);
}
