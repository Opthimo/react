// PlayPage.js
import React, { useContext } from 'react';
import { BLEContext } from './BLEContext';
import { useNavigate } from 'react-router-dom';

const PlayPage = () => {
  const { isConnected, deviceCharacteristic } = useContext(BLEContext);
  const navigate = useNavigate();

  const sendPlayCommand = async () => {
    if (!isConnected || !deviceCharacteristic) {
      alert('Bitte zuerst mit dem Gerät verbinden.');
      return;
    }

    const command = 'FILE_PLAY,SweetChild_3.txt';
    try {
      await deviceCharacteristic.writeValue(new TextEncoder().encode(command));
      console.log('Play-Befehl gesendet:', command);
    } catch (error) {
      console.error('Fehler beim Senden des Play-Befehls:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl mb-4">Datei abspielen</h1>
      {isConnected ? (
        <button
          onClick={sendPlayCommand}
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
        >
          SweetChild_3.txt abspielen
        </button>
      ) : (
        <p className="text-red-500">Bitte verbinde dich zuerst mit dem ESP32.</p>
      )}

      <button
        onClick={() => navigate('/')}
        className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
      >
        Zurück
      </button>
    </div>
  );
};

export default PlayPage;
