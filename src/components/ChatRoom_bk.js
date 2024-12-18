import React, { useEffect, useState, useRef } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { Navigate } from 'react-router-dom';

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

function ChatRoom() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const socket = useSocket();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!socket || !user) return;

    const joinRoom = () => {
      console.log('Joining room');
      socket.emit('joinRoom', { room: 'test-room', username: user.username });
    };

    if (socket.connected) {
      joinRoom();
    }

    socket.on('connect', joinRoom);

    const handleMessage = (messageData) => {
      console.log('Received message:', messageData);
      setMessages((prevMessages) => [...prevMessages, messageData]);
    };

    const handleConnectError = (error) => {
      console.error('Connection error:', error);
    };

    socket.on('message', handleMessage);
    socket.on('connect_error', handleConnectError);

    return () => {
      socket.off('connect', joinRoom);
      socket.off('message', handleMessage);
      socket.off('connect_error', handleConnectError);
      
    };
  }, [socket, user]);

  useEffect(scrollToBottom, [messages]);

  const sendMessage = () => {
    if (message.trim() && user) {
      const newMessage = { room: 'test-room', message, username: user.username };
      socket.emit('sendMessage', newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessage('');
    }
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-100 mt-16">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`p-3 rounded-lg ${msg.username === user.username ? 'bg-blue-100 ml-auto' : 'bg-white'}`}>
            <div className="font-bold">{msg.username}</div>
            <div>{msg.message}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Nachricht eingeben..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatRoom;