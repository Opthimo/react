import React, { useState, useEffect } from 'react';
import LayoutWrapper from './LayoutWrapper';

const MIDIControlPage = ({ midiCharacteristic, setShowMIDIControl }) => {
  const [note, setNote] = useState(60);
  const [velocity, setVelocity] = useState(127);
  const [startNote, setStartNote] = useState(36); // C2 als Standardstartnote
  const [activeNotes, setActiveNotes] = useState({});

  useEffect(() => {
    console.log('MIDIControlPage mounted');
    console.log('midiCharacteristic:', midiCharacteristic);
    
    if (midiCharacteristic) {
      console.log('Setting up MIDI characteristic listener');
      midiCharacteristic.addEventListener('characteristicvaluechanged', handleMIDIMessage);
      return () => {
        console.log('Removing MIDI characteristic listener');
        midiCharacteristic.removeEventListener('characteristicvaluechanged', handleMIDIMessage);
      };
    }
  }, [midiCharacteristic]);

  const handleMIDIMessage = (event) => {
    const data = new Uint8Array(event.target.value.buffer);
    console.log('Received MIDI data:', Array.from(data).map(byte => byte.toString(16).padStart(2, '0')).join(' '));
  
    // Überspringe den Header und Timestamp
    const [, , status, noteNumber, velocity] = data;
    const command = status >> 4;
    const channel = status & 0xF;
  
    console.log(`Decoded MIDI: Command: ${command.toString(16)}, Channel: ${channel}, Note: ${noteNumber}, Velocity: ${velocity}`);
  
    const isNoteOn = command === 0x9 && velocity > 0;
    const isNoteOff = command === 0x8 || (command === 0x9 && velocity === 0);
  
    if (isNoteOn || isNoteOff) {
      console.log(`Note ${isNoteOn ? 'On' : 'Off'}: ${noteNumber}`);
      setActiveNotes(prev => {
        const newState = {...prev, [noteNumber]: isNoteOn};
        console.log('Updated activeNotes:', newState);
        return newState;
      });
    } else {
      console.log('Unhandled MIDI message');
    }
  };

  const sendMIDINoteOn = () => {
    if (midiCharacteristic) {
      const midiMessage = new Uint8Array([0x90, note, velocity]);
      midiCharacteristic.writeValue(midiMessage);
    }
  };

  const sendMIDINoteOff = () => {
    if (midiCharacteristic) {
      const midiMessage = new Uint8Array([0x80, note, 0]);
      midiCharacteristic.writeValue(midiMessage);
    }
  };

  return (
    <LayoutWrapper>
      <h1 className="text-3xl font-bold mb-6">MIDI-Steuerung</h1>
      <div className="mb-4">
        <label className="block mb-2">Startnote für Quadrate (0-103):</label>
        <input
          type="number"
          min="0"
          max="103"
          value={startNote}
          onChange={(e) => setStartNote(Math.min(103, Math.max(0, parseInt(e.target.value))))}
          className="border rounded p-2"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Note (0-127):</label>
        <input
          type="number"
          min="0"
          max="127"
          value={note}
          onChange={(e) => setNote(parseInt(e.target.value))}
          className="border rounded p-2"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Velocity (0-127):</label>
        <input
          type="number"
          min="0"
          max="127"
          value={velocity}
          onChange={(e) => setVelocity(parseInt(e.target.value))}
          className="border rounded p-2"
        />
      </div>
      <button
        onClick={sendMIDINoteOn}
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
      >
        Note On
      </button>
      <button
        onClick={sendMIDINoteOff}
        className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      >
        Note Off
      </button>
      <div className="mt-8 grid grid-cols-8 gap-2">
        {[...Array(24)].map((_, index) => (
          <div
            key={index}
            className={`w-12 h-12 border border-black ${activeNotes[startNote + index] ? 'bg-blue-500' : 'bg-gray-200'}`}
          >
            {startNote + index}
          </div>
        ))}
      </div>
      <button
        onClick={() => setShowMIDIControl(false)}
        className="mt-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded block"
      >
        Zurück
      </button>
    </LayoutWrapper>
  );
};

export default MIDIControlPage;