// useBLEConnection.js
import { useState, useEffect, useCallback } from 'react';

const MIDI_SERVICE_UUID = '03b80e5a-ede8-4b33-a751-6ce34ec4c700';
const MIDI_CHARACTERISTIC_UUID = '7772e5db-3868-4112-a1a9-f2669d106bf3';
const CUSTOM_SERVICE_UUID = '12345678-1234-1234-1234-123456789012';
const CUSTOM_CHARACTERISTIC_UUID = '87654321-4321-4321-4321-210987654321';

const useBLEConnection = () => {
  const [deviceName, setDeviceName] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [deviceCharacteristic, setDeviceCharacteristic] = useState(null);
  const [midiCharacteristic, setMidiCharacteristic] = useState(null);
  const [bleDevice, setBleDevice] = useState(null);

  const disconnectDevice = useCallback(() => {
    console.log('Disconnecting from current device');
    if (bleDevice && bleDevice.gatt.connected) {
      bleDevice.gatt.disconnect();
    }
    setDeviceName('');
    setIsConnected(false);
    setDeviceCharacteristic(null);
    setMidiCharacteristic(null);
    setBleDevice(null);
  }, [bleDevice]);

  const connectToDevice = async () => {
    if (isConnected) {
      disconnectDevice();
      return;
    }

    try {
      console.log('Requesting Bluetooth Device...');
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ name: 'THORD' }],
        optionalServices: [CUSTOM_SERVICE_UUID, MIDI_SERVICE_UUID],
      });

      console.log('Device selected:', device.name);

      console.log('Connecting to GATT Server...');
      const server = await device.gatt.connect();
      console.log('GATT Server connected');

      // Custom Service
      console.log('Getting Custom Service...');
      const customService = await server.getPrimaryService(CUSTOM_SERVICE_UUID);
      console.log('Custom Service found');

      console.log('Getting Custom Characteristic...');
      const customChar = await customService.getCharacteristic(
        CUSTOM_CHARACTERISTIC_UUID
      );
      console.log('Custom Characteristic found');

      await customChar.startNotifications();
      console.log('Custom Characteristic notifications started');

      customChar.addEventListener('characteristicvaluechanged', (event) => {
        console.log(
          'Custom data received:',
          new TextDecoder().decode(event.target.value)
        );
      });

      setDeviceCharacteristic(customChar);

      // MIDI Service
      console.log('Getting MIDI Service...');
      const midiService = await server.getPrimaryService(MIDI_SERVICE_UUID);
      console.log('MIDI Service found');

      console.log('Getting MIDI Characteristic...');
      const midiChar = await midiService.getCharacteristic(
        MIDI_CHARACTERISTIC_UUID
      );
      console.log('MIDI Characteristic found');

      await midiChar.startNotifications();
      console.log('MIDI Characteristic notifications started');

      midiChar.addEventListener('characteristicvaluechanged', (event) => {
        const data = new Uint8Array(event.target.value.buffer);
        console.log(
          'MIDI data received:',
          Array.from(data)
            .map((byte) => byte.toString(16).padStart(2, '0'))
            .join(' ')
        );
      });

      setMidiCharacteristic(midiChar);

      // Speichern Sie das Gerät in der State-Variable
      setBleDevice(device);

      setDeviceName(device.name || 'Unknown Device');
      setIsConnected(true);

      console.log('Device connected and characteristics set up');

      device.addEventListener('gattserverdisconnected', disconnectDevice);
    } catch (error) {
      console.error('Connection failed:', error);
      disconnectDevice();
    }
  };

  useEffect(() => {
    const handleDisconnect = () => {
      console.log('Device disconnected');
      setIsConnected(false);
    };

    if (bleDevice) {
      bleDevice.addEventListener('gattserverdisconnected', handleDisconnect);
    }

    return () => {
      if (bleDevice) {
        bleDevice.removeEventListener('gattserverdisconnected', handleDisconnect);
      }
    };
  }, [bleDevice]);

  return {
    deviceName,
    isConnected,
    connectToDevice,
    disconnectDevice,
    deviceCharacteristic,
    midiCharacteristic,
  };
};

export default useBLEConnection;
