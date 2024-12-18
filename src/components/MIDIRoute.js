import React, { useContext, useEffect, useState, useCallback } from 'react';
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
  const [midiOutputs, setMidiOutputs] = useState([]);
  const [selectedMidiOutId, setSelectedMidiOutId] = useState(null);
  const [midiOut, setMidiOut] = useState(null);
  const [statusMessage, setStatusMessage] = useState("Warte auf MIDI-Verbindung...");

  // Initialisiere MIDI-Ausgänge
  const onMIDISuccess = useCallback((midiAccess) => {
    const outputs = Array.from(midiAccess.outputs.values());
    setMidiOutputs(outputs);

    if (outputs.length > 0 && !selectedMidiOutId) {
      setSelectedMidiOutId(outputs[0].id);
    }

    midiAccess.onstatechange = (event) => {
      const updatedOutputs = Array.from(midiAccess.outputs.values());
      setMidiOutputs(updatedOutputs);

      if (!updatedOutputs.find(out => out.id === selectedMidiOutId)) {
        setSelectedMidiOutId(updatedOutputs.length > 0 ? updatedOutputs[0].id : null);
      }
    };
  }, [selectedMidiOutId]);

  const onMIDIFailure = () => {
    setStatusMessage("Zugriff auf die Web MIDI API fehlgeschlagen.");
  };

  useEffect(() => {
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
    } else {
      setStatusMessage("Web MIDI API wird von diesem Browser nicht unterstützt.");
    }
  }, [onMIDISuccess]);

  useEffect(() => {
    if (selectedMidiOutId && midiOutputs.length > 0) {
      const output = midiOutputs.find(out => out.id === selectedMidiOutId);
      if (output) {
        setMidiOut(output);
        setStatusMessage(`Verbunden mit ${output.name}!`);
      } else {
        setMidiOut(null);
        setStatusMessage("Ausgewählter MIDI-Ausgang nicht gefunden.");
      }
    }
  }, [selectedMidiOutId, midiOutputs]);

  const handleMidiOutputChange = (event) => {
    const newSelectedId = event.target.value;
    setSelectedMidiOutId(newSelectedId);
  };

  // Senden der empfangenen MIDI-Daten an den ausgewählten MIDI-Ausgang
  useEffect(() => {
    if (midiOut && receivedMIDIData.length > 0) {
      const latestMessage = receivedMIDIData[receivedMIDIData.length - 1];
      console.log('Sending MIDI message:', latestMessage);
  
      // Senden der MIDI-Nachricht
      midiOut.send(latestMessage);
    }
  }, [receivedMIDIData, midiOut]);

  // Formatieren der MIDI-Daten für die Anzeige
  useEffect(() => {
    const formattedData = receivedMIDIData.map((message, index) => {
      const hexString = message
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

        <div className="mb-4">
          <p>Status: {statusMessage}</p>
          {midiOutputs.length > 0 && (
            <select
              value={selectedMidiOutId || ''}
              onChange={handleMidiOutputChange}
              className="bg-gray-200 text-gray-700 py-2 px-4 rounded mr-2"
            >
              {midiOutputs.map(output => (
                <option key={output.id} value={output.id}>
                  {output.name}
                </option>
              ))}
            </select>
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
