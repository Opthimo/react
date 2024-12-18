// Session.js
import React, { useEffect, useState } from 'react';
import { useSocket } from './SocketContext'; // Stelle sicher, dass der Pfad korrekt ist

function ChatRoom() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  // Hole die Socket-Instanz aus dem Kontext
  const socket = useSocket();

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
      socket.emit('joinRoom', 'test-room');
    });

    socket.on('message', (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('message');
    };
  }, [socket]);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('sendMessage', { room: 'test-room', message });
      setMessage('');
    }
  };

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default ChatRoom;
