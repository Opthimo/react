// src/components/BLEContext.js
import React, { createContext, useState, useCallback, useEffect } from 'react';

export const BLEContext = createContext();

// Zentrale UUID-Definitionen in Kleinbuchstaben
const BLE_UUIDS = {
  MIDI_SERVICE: "03b80e5a-ede8-4b33-a751-6ce34ec4c700",
  MIDI_CHARACTERISTIC: "7772e5db-3868-4112-a1a9-f2669d106bf3",
  CUSTOM_SERVICE: "12345678-1234-1234-1234-123456789012",
  CUSTOM_CHARACTERISTIC: "87654321-4321-4321-4321-210987654321"
};

export const BLEProvider = ({ children }) => {
  // State Definitionen
  const [deviceName, setDeviceName] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [deviceCharacteristic, setDeviceCharacteristic] = useState(null);
  const [midiCharacteristic, setMidiCharacteristic] = useState(null);
  const [bleDevice, setBleDevice] = useState(null);
  const [customData, setCustomData] = useState("");
  const [receivedMIDIData, setReceivedMIDIData] = useState([]);
  const [orientationData, setOrientationData] = useState({ heading: 0, roll: 0, pitch: 0 });

  // Disconnect Funktion
  const disconnectDevice = useCallback(() => {
    console.log("Disconnecting from current device");
    if (bleDevice && bleDevice.gatt.connected) {
      bleDevice.gatt.disconnect();
    }
    setDeviceName("");
    setIsConnected(false);
    setDeviceCharacteristic(null);
    setMidiCharacteristic(null);
    setBleDevice(null);
    setCustomData("");
  }, [bleDevice]);

  // Event Handler für Orientierungsdaten
  const handleOrientationData = (event) => {
    const buffer = event.target.value.buffer;
    const dataView = new DataView(buffer);
    const heading = dataView.getFloat32(0, true);
    const roll = dataView.getFloat32(4, true);
    const pitch = dataView.getFloat32(8, true);
    setOrientationData({ heading, roll, pitch });
    //console.log("Orientation data:", { heading, roll, pitch });
  };

  // Event Handler für MIDI-Daten
  const handleMIDIData = (event) => {
    const data = new Uint8Array(event.target.value.buffer);
    console.log('MIDI data received:', Array.from(data).map(byte => 
      byte.toString(16).padStart(2, '0')).join(' '));
    
    const midiMessages = parseBLEMIDIData(data);
    midiMessages.forEach(message => {
      setReceivedMIDIData(prevData => [...prevData, message]);
    });
  };

  // MIDI-Daten Parser
  const parseBLEMIDIData = (data) => {
    let midiMessages = [];
    let dataArray = Array.from(data);
    let index = 0;
    
    while (index < dataArray.length) {
      let header = dataArray[index++];
      
      if (header & 0x80) {
        while (index < dataArray.length && !(dataArray[index] & 0x80)) {
          index++;
        }
      }
      
      if (index < dataArray.length) {
        let statusByte = dataArray[index++];
        let message = [statusByte];
        
        let dataBytesNeeded = 0;
        if ((statusByte & 0xF0) === 0xC0 || (statusByte & 0xF0) === 0xD0) {
          dataBytesNeeded = 1;
        } else if ((statusByte & 0xF0) === 0xF0) {
          break;
        } else {
          dataBytesNeeded = 2;
        }
        
        for (let i = 0; i < dataBytesNeeded; i++) {
          if (index < dataArray.length) {
            message.push(dataArray[index++]);
          } else {
            break;
          }
        }
        
        midiMessages.push(message);
      }
    }
    
    return midiMessages;
  };

  // Connect Funktion
  const connectToDevice = async () => {
    if (isConnected) {
      disconnectDevice();
      return;
    }

    try {
      console.log("Starting BLE connection process...");
      console.log("Custom Service UUID:", BLE_UUIDS.CUSTOM_SERVICE);
      console.log("MIDI Service UUID:", BLE_UUIDS.MIDI_SERVICE);
      
      // Device Auswahl
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ name: "THORD" }],
        optionalServices: [
          BLE_UUIDS.CUSTOM_SERVICE,
          BLE_UUIDS.MIDI_SERVICE
        ]
      });
      
      console.log("Device selected:", device.name);
      console.log("Device ID:", device.id);
      
      // GATT Server Verbindung
      console.log("Connecting to GATT server...");
      const server = await device.gatt.connect();
      console.log("GATT Server connected");

      // Custom Service Setup
      try {
        console.log("Getting Custom Service...");
        const customService = await server.getPrimaryService(BLE_UUIDS.CUSTOM_SERVICE);
        console.log("Custom Service found");
        
        console.log("Getting Custom Characteristic...");
        const customChar = await customService.getCharacteristic(
          BLE_UUIDS.CUSTOM_CHARACTERISTIC
        );
        console.log("Custom Characteristic found");
        
        await customChar.startNotifications();
        console.log("Started notifications for custom characteristic");
        
        customChar.addEventListener(
          "characteristicvaluechanged",
          handleOrientationData
        );
        setDeviceCharacteristic(customChar);
      } catch (error) {
        console.error("Error with Custom Service:", error);
        throw error;
      }

      // MIDI Service Setup
      try {
        console.log("Getting MIDI Service...");
        const midiService = await server.getPrimaryService(BLE_UUIDS.MIDI_SERVICE);
        console.log("MIDI Service found");
        
        console.log("Getting MIDI Characteristic...");
        const midiChar = await midiService.getCharacteristic(
          BLE_UUIDS.MIDI_CHARACTERISTIC
        );
        console.log("MIDI Characteristic found");
        
        await midiChar.startNotifications();
        console.log("Started notifications for MIDI characteristic");
        
        midiChar.addEventListener("characteristicvaluechanged", handleMIDIData);
        setMidiCharacteristic(midiChar);
      } catch (error) {
        console.error("Error with MIDI Service:", error);
        throw error;
      }

      // Finale Setup
      setBleDevice(device);
      setDeviceName(device.name || "Unknown Device");
      setIsConnected(true);
      console.log("Device fully connected and characteristics set up");
      
    } catch (error) {
      console.error("Connection failed:", error);
      console.error("Error stack:", error.stack);
      disconnectDevice();
    }
  };

  // Disconnect Event Listener
  useEffect(() => {
    const handleDisconnect = () => {
      console.log("Device disconnected");
      disconnectDevice();
    };

    if (bleDevice) {
      bleDevice.addEventListener("gattserverdisconnected", handleDisconnect);
    }

    return () => {
      if (bleDevice) {
        bleDevice.removeEventListener(
          "gattserverdisconnected",
          handleDisconnect
        );
      }
    };
  }, [bleDevice, disconnectDevice]);

  // Context Provider
  return (
    <BLEContext.Provider
      value={{
        deviceName,
        isConnected,
        connectToDevice,
        disconnectDevice,
        deviceCharacteristic,
        midiCharacteristic,
        receivedMIDIData,
        orientationData,
        customData,
      }}
    >
      {children}
    </BLEContext.Provider>
  );
};

export default BLEProvider;