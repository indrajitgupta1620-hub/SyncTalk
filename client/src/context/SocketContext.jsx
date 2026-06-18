import { createContext, useEffect, useState, useContext, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) {
      // Disconnect if user logs out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      return;
    }

    const token = sessionStorage.getItem('accessToken');
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
    });

    newSocket.on('online_users', (users) => {
      setOnlineUsers(users);
    });

    newSocket.on('user_online', ({ userId }) => {
      setOnlineUsers((prev) => [...new Set([...prev, userId])]);
    });

    newSocket.on('user_offline', ({ userId }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });

    newSocket.on('mention_notification', (data) => {
      setNotifications((prev) => [data, ...prev].slice(0, 50));
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const joinRoom = useCallback(
    (conversationId) => {
      if (socketRef.current) {
        socketRef.current.emit('join_room', { conversationId });
      }
    },
    []
  );

  const leaveRoom = useCallback(
    (conversationId) => {
      if (socketRef.current) {
        socketRef.current.emit('leave_room', { conversationId });
      }
    },
    []
  );

  const sendMessage = useCallback(
    (data) => {
      if (socketRef.current) {
        socketRef.current.emit('send_message', data);
      }
    },
    []
  );

  const emitTyping = useCallback(
    (conversationId) => {
      if (socketRef.current) {
        socketRef.current.emit('typing', { conversationId });
      }
    },
    []
  );

  const emitStopTyping = useCallback(
    (conversationId) => {
      if (socketRef.current) {
        socketRef.current.emit('stop_typing', { conversationId });
      }
    },
    []
  );

  const markRead = useCallback(
    (conversationId, messageId) => {
      if (socketRef.current) {
        socketRef.current.emit('mark_read', { conversationId, messageId });
      }
    },
    []
  );

  const clearNotification = useCallback((index) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const isOnline = useCallback(
    (userId) => onlineUsers.includes(userId),
    [onlineUsers]
  );

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        notifications,
        joinRoom,
        leaveRoom,
        sendMessage,
        emitTyping,
        emitStopTyping,
        markRead,
        clearNotification,
        isOnline,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
