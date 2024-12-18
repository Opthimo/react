import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BLEContext } from './BLEContext';

const FileManagerPage = () => {
  const navigate = useNavigate();
  const { isConnected, deviceCharacteristic } = useContext(BLEContext);
  const [files, setFiles] = useState([]);

  // Funktion zum Anfordern der Dateiliste
  const requestFileList = useCallback(async () => {
    if (!deviceCharacteristic) return;
    try {
      const encoder = new TextEncoder();
      await deviceCharacteristic.writeValue(encoder.encode('FILE_LIST'));
    } catch (error) {
      console.error('Fehler beim Anfordern der Dateiliste:', error);
    }
  }, [deviceCharacteristic]);

  // Funktion zur Verarbeitung der empfangenen BLE-Daten
  const handleBLEResponse = useCallback((data) => {
    console.log('BLE Response (Text):', data);
    if (data.startsWith('FILE_LIST,')) {
      const fileData = data.substring(10).split('|');
      const parsedFiles = fileData
        .filter(f => f)
        .map(file => {
          const [name, type, size] = file.split(';');
          return {
            name,
            isDirectory: (type === 'dir'),
            size: parseInt(size),
          };
        });
      setFiles(parsedFiles);
    } else {
      console.log("Unbekannte Nachricht:", data);
    }
  }, []);

  // Event-Handler für empfangene BLE-Werte
  const handleValueChange = useCallback((event) => {
    const decoder = new TextDecoder();
    const data = decoder.decode(event.target.value);
    handleBLEResponse(data);
  }, [handleBLEResponse]);

  // useEffect, um bei Verbindungsaufbau die Dateiliste anzufordern
  useEffect(() => {
    if (isConnected) {
      requestFileList();
    }
  }, [isConnected, requestFileList]);

  // useEffect, um EventListener für eingehende Daten zu setzen
  useEffect(() => {
    if (deviceCharacteristic) {
      deviceCharacteristic.addEventListener('characteristicvaluechanged', handleValueChange);
      return () => {
        deviceCharacteristic.removeEventListener('characteristicvaluechanged', handleValueChange);
      };
    }
  }, [deviceCharacteristic, handleValueChange]);

  // Funktion zum Senden des Play-Befehls
  const playFile = async (fileName) => {
    if (!isConnected || !deviceCharacteristic) {
      alert('Bitte zuerst mit dem Gerät verbinden.');
      return;
    }
    try {
      const command = `FILE_PLAY,${fileName}`;
      await deviceCharacteristic.writeValue(new TextEncoder().encode(command));
      console.log(`Play command für Datei ${fileName} gesendet.`);
    } catch (error) {
      console.error('Fehler beim Senden des Play-Befehls:', error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">ESP32 Dateimanager</h1>

        {isConnected ? (
          <>
            {/* Upload-Funktion ist deaktiviert */}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    file.isDirectory ? 'bg-blue-50' : 'bg-gray-50'
                  } flex flex-col items-start`}
                >
                  <div className="font-medium">{file.name}</div>
                  <div className="text-sm text-gray-500 mb-2">
                    {file.isDirectory ? 'Ordner' : `${file.size} bytes`}
                  </div>
                  {!file.isDirectory && (
                    <button
                      onClick={() => playFile(file.name)}
                      className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                    >
                      Play
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-red-500">Bitte verbinden Sie sich zuerst mit dem Gerät.</p>
        )}

        <button
          onClick={() => navigate('/')}
          className="mt-6 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Zurück
        </button>
      </div>
    </div>
  );
};

export default FileManagerPage;
