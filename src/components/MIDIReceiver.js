import React, { useContext, useEffect, useState } from 'react';
import { BLEContext } from './BLEContext';
import LayoutWrapper from './LayoutWrapper';

const MIDIReceiver = () => {
  const {
    deviceName,
    isConnected,
    connectToDevice,
    disconnectDevice,
    receivedMIDIData
  } = useContext(BLEContext);

  const [formattedMIDIData, setFormattedMIDIData] = useState([]);

  useEffect(() => {
    // Formatieren der empfangenen MIDI-Daten für die Anzeige
    const formattedData = receivedMIDIData.map((dataArray, index) => {
      const hexString = Array.from(dataArray)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join(' ');
      return `Nachricht ${index + 1}: ${hexString}`;
    });
    setFormattedMIDIData(formattedData);
  }, [receivedMIDIData]);

  return (
    <LayoutWrapper>
      <div className="midi-receiver">
        <h1 className="text-2xl font-bold mb-4">MIDI Receiver</h1>
        <div className="mb-4">
          <button
            onClick={connectToDevice}
            className={`${
              isConnected ? 'bg-red-500 hover:bg-red-700' : 'bg-green-500 hover:bg-green-700'
            } text-white font-bold py-2 px-4 rounded`}
          >
            {isConnected ? 'Trennen' : 'Verbinden'}
          </button>
          {isConnected && (
            <span className="ml-4">Verbunden mit: {deviceName}</span>
          )}
        </div>

        {isConnected ? (
          <div className="received-data">
            <h2 className="text-xl font-bold mb-2">Empfangene MIDI-Daten:</h2>
            {formattedMIDIData.length > 0 ? (
              <ul className="list-disc pl-5">
                {formattedMIDIData.map((message, index) => (
                  <li key={index}>{message}</li>
                ))}
              </ul>
            ) : (
              <p>Keine MIDI-Daten empfangen.</p>
            )}
          </div>
        ) : (
          <p>Bitte verbinden Sie sich mit dem Gerät, um MIDI-Daten zu empfangen.</p>
        )}
      </div>
    </LayoutWrapper>
  );
};

export default MIDIReceiver;
