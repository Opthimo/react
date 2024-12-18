// src/components/ChatRoom.js
import React, { useEffect, useState, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext'; // Importiere den AuthContext

// Einfaches Send-Icon als SVG
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

function ChatRoom() {
    const { user } = useAuth();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [usersInRoom, setUsersInRoom] = useState([]);
    const socket = useSocket();

    const leaveRoom = useCallback(() => {
        if (socket && user) {
            socket.emit('leaveRoom', { room: 'test-room', username: user.username });
            // Optional: Navigate to another page or reset the state
            // For example, you could redirect the user to the home page
        }
    }, [socket, user]);

    useEffect(() => {
        if (!socket || !user) return;

        const handleNotification = (message) => {
            setMessages((prevMessages) => [...prevMessages, { username: 'System', message }]);
        };
        
        socket.on('notification', handleNotification);

        const joinRoom = () => {
            console.log('Joining room');
            socket.emit('joinRoom', { room: 'test-room', username: user.username });
        };

        if (socket.connected) {
            joinRoom();
        }

        socket.on('connect', joinRoom);

        const handleMessage = (data) => {
            console.log('Received message:', data);
            setMessages((prevMessages) => [...prevMessages, data]);
        };

        const handleUserList = (users) => {
            setUsersInRoom(users);
        };

        const handleConnectError = (error) => {
            console.error('Connection error:', error);
        };

        const handleBeforeUnload = () => {
            socket.emit('leaveRoom', { room: 'test-room', username: user.username });
        };
    
        window.addEventListener('beforeunload', handleBeforeUnload);

        socket.on('message', handleMessage);
        socket.on('userList', handleUserList);
        socket.on('connect_error', handleConnectError);

        return () => {
            socket.off('connect', joinRoom);
            socket.off('message', handleMessage);
            socket.off('userList', handleUserList);
            socket.off('connect_error', handleConnectError);
            socket.off('notification', handleNotification);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            leaveRoom(); // Call leaveRoom when unmounting
        };
    }, [socket, user, leaveRoom]);

    const sendMessage = () => {
        if (message.trim()) {
            socket.emit('sendMessage', { room: 'test-room', message, username: user.username });
            setMessage('');
        }
    };
  
    // Falls der Benutzer nicht eingeloggt ist, zeige eine Meldung oder leite zur Login-Seite um
    if (!user) {
      return (
        <div className="flex items-center justify-center h-screen">
          <p>Bitte logge dich ein, um den Chat zu nutzen.</p>
        </div>
      );
    }
  
    return (
      <div className="flex flex-col h-screen bg-gray-100">
        {/* Anzeige der Benutzer im Raum */}
        <div className="bg-white border-b border-gray-200 p-4">
          <h3 className="text-lg font-semibold">Benutzer im Raum:</h3>
          <ul className="list-disc pl-5">
            {usersInRoom.map((username, index) => (
              <li key={index}>{username}</li>
            ))}
          </ul>
        </div>
  
        {/* Nachrichten */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`rounded-lg p-3 shadow ${
                msg.username === user.username ? 'bg-blue-100 self-end' : 'bg-white'
              }`}
            >
              <strong>{msg.username}:</strong> {msg.message}
            </div>
          ))}
        </div>
  
        {/* Eingabefeld */}
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
          <button
                onClick={leaveRoom}
                className="bg-red-500 text-white px-4 py-2 rounded"
>
                Raum verlassen
                </button>
        </div>
      </div>
    );
  }
  
  export default ChatRoom;