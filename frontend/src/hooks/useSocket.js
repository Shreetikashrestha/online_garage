import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export default function useSocket() {
  const socketRef = useRef(null);
  const { accessToken, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        auth: {
          token: accessToken,
        },
        transports: ['websocket', 'polling'],
      });

      socketRef.current.on('connect', () => {
        console.log('🔌 Socket connected successfully');
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('🔌 Socket connection error:', error.message);
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
      });
    } else {
      socketRef.current.auth = { token: accessToken };
      socketRef.current.disconnect().connect();
    }

    return () => {};
  }, [accessToken, isAuthenticated]);

  const emit = (event, data) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn(`⚠️ Socket not connected. Cannot emit event: ${event}`);
    }
  };

  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off(event, callback);
      }
    };
  };

  const off = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  return {
    socket: socketRef.current,
    connected: socketRef.current?.connected || false,
    emit,
    on,
    off,
  };
}
