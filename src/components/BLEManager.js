// src/components/BLEManager.js
import React, { createContext, useState, useCallback } from 'react';

// BLEContext erstellen, um die Daten in anderen Komponenten zu verwenden
export const BLEContext = createContext();

const BLEManager = ({ children }) => {
  const [customData, setCustomData] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [bleDevice, setBleDevice] = useState(null);

const MIDI_SERVICE_UUID = "03b80e5a-ede8-4b33-a751-6ce34ec4c700";
const MIDI_CHARACTERISTIC_UUID = "7772e5db-3868-4112-a1a9-f2669d106bf3";
const CUSTOM_SERVICE_UUID = "12345678-1234-1234-1234-123456789012";
const CUSTOM_CHARACTERISTIC_UUID = "87654321-4321-4321-4321-210987654321";

  const disconnectDevice = useCallback(() => {
    console.log('Disconnecting from device');
    if (bleDevice && bleDevice.gatt.connected) {
      bleDevice.gatt.disconnect();
    }
    setCustomData('');
    setIsConnected(false);
    setBleDevice(null);
  }, [bleDevice]);

  const connectToDevice = async () => {
    try {
      console.log("Requesting Bluetooth Device...");
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ name: "THORD" }],
        optionalServices: [
          CUSTOM_SERVICE_UUID.toLowerCase(), // Für Web Bluetooth API
          MIDI_SERVICE_UUID.toLowerCase()
        ]
      });

      console.log('Device selected:', device.name);
      const server = await device.gatt.connect();
      console.log('Connected to GATT server');

      const customService = await server.getPrimaryService(CUSTOM_SERVICE_UUID);
      const customCharacteristic = await customService.getCharacteristic(CUSTOM_CHARACTERISTIC_UUID);

      await customCharacteristic.startNotifications();
      console.log('Started notifications for custom characteristic');

      customCharacteristic.addEventListener('characteristicvaluechanged', handleAngleData);
      setBleDevice(device);
      setIsConnected(true);

      device.addEventListener('gattserverdisconnected', disconnectDevice);

    } catch (error) {
      console.error('Error connecting to device:', error);
      disconnectDevice();
    }
  };

  const handleAngleData = (event) => {
    const buffer = event.target.value.buffer;  // Das ArrayBuffer, das die Rohdaten enthält
    const dataView = new DataView(buffer);
  
    // Beispiel: Interpretation der 4 Bytes als 32-Bit Gleitkommazahl (Float32)
    const value = dataView.getFloat32(0, true); // true = littleEndian, anpassen wenn nötig
    console.log('Decoded float value:', value);
  
    // Verarbeite die Daten weiter, hier setCustomData() anpassen, wenn notwendig
    setCustomData(value.toString());
  };

  return (
    <BLEContext.Provider value={{ customData, connectToDevice, isConnected }}>
      {children}
    </BLEContext.Provider>
  );
};

export default BLEManager;
