import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import StickFigure from '../anims/StickFigure';
import backgroundImage from '../pics/rainbow-bg.jpg';

const KinectSocket = ({ deviceCharacteristic, setKinectSocket }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [kinectData, setKinectData] = useState(null);
  const [socket, setSocket] = useState(null);
  const [messageCount, setMessageCount] = useState(0);

  const handleReceivedData = useCallback((data) => {
    console.log('Received data:', typeof data, data);
    try {
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      console.log('Parsed Kinect data:', parsedData);
      setKinectData(parsedData);
      setMessageCount(prevCount => prevCount + 1);
    } catch (error) {
      console.error('Error parsing data:', error);
      setKinectData({ rawData: data });
    }
  }, []);

  useEffect(() => {
    console.log('Initializing WebSocket connection...');
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket'],
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);
    });

    newSocket.on('message', handleReceivedData);

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
      setIsConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    setSocket(newSocket);

    return () => {
      console.log('Cleaning up WebSocket connection');
      newSocket.disconnect();
    };
  }, [handleReceivedData]);

  const handleTestClick = () => {
    if (socket) {
      console.log('Sending test request to server');
      socket.emit('test_request');
    } else {
      console.log('Socket not initialized');
    }
  };

  const handleKinectStatusClick = () => {
    if (socket) {
      console.log('Requesting Kinect status');
      socket.emit('get_kinect_status');
    } else {
      console.log('Socket not initialized');
    }
  };

  const handleBackClick = () => {
    setKinectSocket(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full bg-cover bg-center relative" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="flex justify-center items-center min-h-screen w-full p-6 rounded-xl border-8 border-black bg-white bg-opacity-20 backdrop-blur-md" style={{ width: '90vw', height: '80vh' }}>
        <div className="bg-white rounded-xl p-6 border-8 border-black" style={{ width: '80vw', height: '70vh' }}>
          <h1 className="text-3xl font-bold mb-6">Kinect</h1>
          
          <div className="mb-4">
            {isConnected ? (
              kinectData ? (
                <div>
                  <p>Rendering StickFigure with data:</p>
                  <StickFigure skeletonData={kinectData} />
                  <pre className="mt-4 text-sm overflow-auto max-h-40">{JSON.stringify(kinectData, null, 2)}</pre>
                </div>
              ) : (
                <p>Warte auf Kinect-Daten...</p>
              )
            ) : (
              <p>Nicht verbunden mit WebSocket-Server</p>
            )}
          </div>

          <button onClick={handleTestClick} className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4">
            Test Daten Anfragen
          </button>

          <button onClick={handleKinectStatusClick} className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-4">
            Kinect Status Abfragen
          </button>

          <button onClick={handleBackClick} className="mt-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Zurück
          </button>

          <p className="mt-4">Empfangene Nachrichten: {messageCount}</p>
        </div>
      </div>
    </div>
  );
};

export default KinectSocket;