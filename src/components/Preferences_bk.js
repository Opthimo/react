import React, { useState, useEffect } from 'react';
import '../styles/DeviceList.css';

const DeviceList = () => {
  const [bluetoothDevices, setBluetoothDevices] = useState([]);
  const [usbDevices, setUsbDevices] = useState([]);
  const [gamepads, setGamepads] = useState([]);

  // Abfrage verbundener Gamepads
  useEffect(() => {
    const checkGamepads = () => {
      const connectedGamepads = navigator.getGamepads();
      const activeGamepads = Array.from(connectedGamepads)
        .filter(gamepad => gamepad !== null)
        .map(gamepad => ({
          id: gamepad.id,
          name: gamepad.id,
          type: 'gamepad',
          connected: true,
          buttons: gamepad.buttons.length,
          axes: gamepad.axes.length
        }));
      setGamepads(activeGamepads);
    };

    // Initial Check
    checkGamepads();

    // Event Listener für Gamepad Verbindungen
    window.addEventListener('gamepadconnected', checkGamepads);
    window.addEventListener('gamepaddisconnected', checkGamepads);

    return () => {
      window.removeEventListener('gamepadconnected', checkGamepads);
      window.removeEventListener('gamepaddisconnected', checkGamepads);
    };
  }, []);

  // USB Geräte überwachen
  useEffect(() => {
    const handleUSBConnect = async (event) => {
      const device = event.device;
      setUsbDevices(prev => [...prev, {
        id: device.serialNumber || Math.random().toString(),
        name: device.productName || 'USB Gerät',
        type: 'usb',
        connected: true,
        details: {
          manufacturer: device.manufacturerName,
          productId: device.productId,
          vendorId: device.vendorId
        }
      }]);
    };

    const handleUSBDisconnect = (event) => {
      setUsbDevices(prev => 
        prev.filter(device => device.id !== event.device.serialNumber)
      );
    };

    navigator.usb.addEventListener('connect', handleUSBConnect);
    navigator.usb.addEventListener('disconnect', handleUSBDisconnect);

    // Initial verbundene USB Geräte abfragen
    navigator.usb.getDevices()
      .then(devices => {
        const usbDeviceList = devices.map(device => ({
          id: device.serialNumber || Math.random().toString(),
          name: device.productName || 'USB Gerät',
          type: 'usb',
          connected: true,
          details: {
            manufacturer: device.manufacturerName,
            productId: device.productId,
            vendorId: device.vendorId
          }
        }));
        setUsbDevices(usbDeviceList);
      });

    return () => {
      navigator.usb.removeEventListener('connect', handleUSBConnect);
      navigator.usb.removeEventListener('disconnect', handleUSBDisconnect);
    };
  }, []);

  // Bluetooth Scan
  const scanBluetoothDevices = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service']
      });
      
      setBluetoothDevices(prev => [...prev, {
        id: device.id,
        name: device.name || 'Unbekanntes Gerät',
        type: getDeviceType(device.name),
        connected: device.gatt.connected
      }]);
    } catch (error) {
      console.error('Bluetooth Scan Fehler:', error);
    }
  };

  // Gerätetyp ermitteln
  const getDeviceType = (name) => {
    const lowercaseName = (name || '').toLowerCase();
    if (lowercaseName.includes('mouse')) return '🖱️';
    if (lowercaseName.includes('keyboard')) return '⌨️';
    if (lowercaseName.includes('speaker')) return '🔊';
    if (lowercaseName.includes('controller') || lowercaseName.includes('gamepad')) return '🎮';
    return '📱';
  };

  return (
    <div className="device-list">
      <h2>Angeschlossene Geräte</h2>
      
      <div className="button-group">
        <button 
          onClick={scanBluetoothDevices}
          className="scan-button"
        >
          Bluetooth Scan
        </button>
      </div>

      <div className="device-sections">
        {gamepads.length > 0 && (
          <div className="device-section">
            <h3>Gamepads</h3>
            <div className="device-grid">
              {gamepads.map(gamepad => (
                <div key={gamepad.id} className="device-card">
                  <span className="device-icon">🎮</span>
                  <div className="device-info">
                    <h4>{gamepad.name}</h4>
                    <p className="device-status">
                      Buttons: {gamepad.buttons} | Axes: {gamepad.axes}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {usbDevices.length > 0 && (
          <div className="device-section">
            <h3>USB Geräte</h3>
            <div className="device-grid">
              {usbDevices.map(device => (
                <div key={device.id} className="device-card">
                  <span className="device-icon">🔌</span>
                  <div className="device-info">
                    <h4>{device.name}</h4>
                    <p className="device-status">
                      {device.details.manufacturer || 'Unbekannter Hersteller'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {bluetoothDevices.length > 0 && (
          <div className="device-section">
            <h3>Bluetooth Geräte</h3>
            <div className="device-grid">
              {bluetoothDevices.map(device => (
                <div key={device.id} className="device-card">
                  <span className="device-icon">{getDeviceType(device.type)}</span>
                  <div className="device-info">
                    <h4>{device.name}</h4>
                    <p className="device-status">
                      {device.connected ? 'Verbunden' : 'Getrennt'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceList;