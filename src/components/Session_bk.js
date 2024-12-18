// src/components/Session.js
import React, { useEffect, useState } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

const Session = () => {
  const socket = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const room = 'default_room';

  useEffect(() => {
    if (user && socket) {
      socket.emit('join_room', { room });

      socket.on('user_joined', (data) => {
        setMessages((prev) => [...prev, `${data.user} hat den Raum betreten`]);
      });

      socket.on('receive_message', (data) => {
        setMessages((prev) => [...prev, `${data.user}: ${data.message}`]);
      });

      return () => {
        socket.emit('leave_room', { room });
        socket.off('user_joined');
        socket.off('receive_message');
      };
    }
  }, [socket, user, room]);

  const sendMessage = () => {
    const message = 'Hallo zusammen!';
    socket.emit('send_message', { room, message });
  };

  if (!user) {
    return <p>Bitte einloggen, um an der Session teilzunehmen.</p>;
  }

  return (
    <div>
      <h2>Session</h2>
      <button onClick={sendMessage}>Nachricht senden</button>
      <div>
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
    </div>
  );
};

export default Session;
