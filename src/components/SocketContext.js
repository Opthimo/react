// src/components/SocketContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { SOCKET_URL } from '../config';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(`${SOCKET_URL}`, {
      path: '/socket.io/',
      transports: ['websocket'],
      secure: true,
      withCredentials: true,
      rejectUnauthorized: false,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket.IO connect_error:', error);
    });

    newSocket.on('error', (error) => {
      console.error('Socket.IO error:', error);
    });

    newSocket.on('disconnect', (reason) => {
      console.warn('Socket.IO disconnected:', reason);
    });

    return () => {
      newSocket.off('connect');
      newSocket.off('connect_error');
      newSocket.off('error');
      newSocket.off('disconnect');
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};