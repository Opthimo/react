// src/components/Move.js
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

function Move() {
  const { user } = useAuth();
  const socket = useSocket();
  const canvasRef = useRef(null);
  const [positions, setPositions] = useState({});

  const handleMouseMove = useCallback((e) => {
    if (!canvasRef.current || !user) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    socket?.emit('mouseMove', { username: user.username, x, y });
  }, [socket, user]);

  const handleMouseClick = useCallback(() => {
    if (!user) return;
    socket?.emit('mouseClick', { username: user.username });
  }, [socket, user]);

  const handleTouchMove = useCallback((e) => {
    if (!canvasRef.current || !user) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    socket?.emit('mouseMove', { username: user.username, x, y });
  }, [socket, user]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !socket || !user) return;

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleMouseClick);
    canvas.addEventListener('touchmove', handleTouchMove);

    socket.on('mousePositions', setPositions);
    socket.on('mouseClick', (username) => {
      console.log(`${username} clicked`);
    });

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleMouseClick);
      canvas.removeEventListener('touchmove', handleTouchMove);
      socket.off('mousePositions');
      socket.off('mouseClick');
    };
  }, [socket, user, handleMouseMove, handleMouseClick, handleTouchMove]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    Object.entries(positions).forEach(([username, { x, y, color }]) => {
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.font = '12px Arial';
      ctx.fillText(username, x + 12, y + 4);
    });
  }, [positions]);

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      style={{ border: '1px solid black' }}
    />
  );
}

export default Move;