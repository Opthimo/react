//Preferences.js
import React, { useState, useEffect } from 'react';
import { MdOutlineTouchApp } from "react-icons/md";

const DeviceList = () => {
  const [gamepads, setGamepads] = useState([]);
  const [pointerInfo, setPointerInfo] = useState(null);
  const [keyboardInfo, setKeyboardInfo] = useState({ connected: navigator.keyboard !== undefined });
  const [bluetoothDevices, setBluetoothDevices] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Regelmäßiges Update alle 1000ms
  useEffect(() => {
    const intervalId = setInterval(() => {
      checkGamepads();
      setLastUpdate(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Gamepad-Überprüfung
  const checkGamepads = () => {
    const connected = navigator.getGamepads();
    const active = Array.from(connected)
      .filter(gamepad => gamepad !== null)
      .map(gamepad => ({
        id: gamepad.id,
        name: gamepad.id,
        buttons: gamepad.buttons.length,
        axes: gamepad.axes.length,
        // Aktuelle Button-States
        pressedButtons: gamepad.buttons
          .map((button, index) => button.pressed ? index : null)
          .filter(index => index !== null),
        // Aktuelle Achsen-Werte
        axesValues: gamepad.axes.map(axis => axis.toFixed(2))
      }));
    setGamepads(active);
  };

  // Pointer/Maus Events
  useEffect(() => {
    const handlePointerMove = (event) => {
      setPointerInfo({
        type: event.pointerType,
        pressure: event.pressure,
        tiltX: event.tiltX,
        tiltY: event.tiltY,
        x: event.clientX,
        y: event.clientY
      });
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerdown', handlePointerMove);
    window.addEventListener('pointerup', handlePointerMove);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerMove);
    };
  }, []);

  // Bluetooth-Scan
  const scanBluetoothDevices = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service']
      });
      
      const server = await device.gatt?.connect();
      
      setBluetoothDevices(prev => {
        // Aktualisiere existierende Geräte oder füge neue hinzu
        const exists = prev.find(d => d.id === device.id);
        if (exists) {
          return prev.map(d => d.id === device.id ? {
            ...d,
            connected: device.gatt.connected,
            name: device.name || 'Unbekanntes Gerät'
          } : d);
        }
        return [...prev, {
          id: device.id,
          name: device.name || 'Unbekanntes Gerät',
          connected: device.gatt.connected
        }];
      });
    } catch (error) {
      console.error('Bluetooth Scan Fehler:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Angeschlossene Geräte</h2>
          <div className="text-sm text-gray-500">
            Letztes Update: {lastUpdate.toLocaleTimeString()}
            <MdOutlineTouchApp />
          </div>
        </div>
        
        <button 
          onClick={scanBluetoothDevices}
          className="mb-8 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Bluetooth Scan
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tastatur */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Tastatur</h3>
            <p className="text-gray-600">
              Status: {keyboardInfo.connected ? 'Verfügbar' : 'Nicht erkannt'}
            </p>
          </div>

          {/* Maus/Pointer */}
          {pointerInfo && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Maus/Pointer</h3>
              <p className="text-gray-600">Typ: {pointerInfo.type}</p>
              <p className="text-gray-600">Position: X={pointerInfo.x} Y={pointerInfo.y}</p>
              {pointerInfo.pressure > 0 && (
                <p className="text-gray-600">Druckstärke: {pointerInfo.pressure}</p>
              )}
              {(pointerInfo.tiltX || pointerInfo.tiltY) && (
                <p className="text-gray-600">
                  Neigung: X={pointerInfo.tiltX}° Y={pointerInfo.tiltY}°
                </p>
              )}
            </div>
          )}

          {/* Gamepads */}
          {gamepads.map(gamepad => (
            <div key={gamepad.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Gamepad</h3>
              <p className="text-gray-600">Name: {gamepad.name}</p>
              <p className="text-gray-600">Buttons: {gamepad.buttons}</p>
              <p className="text-gray-600">Achsen: {gamepad.axes}</p>
              {gamepad.pressedButtons.length > 0 && (
                <p className="text-gray-600">
                  Gedrückte Buttons: {gamepad.pressedButtons.join(', ')}
                </p>
              )}
              <p className="text-gray-600 break-words">
                Achsen-Werte: {gamepad.axesValues.join(', ')}
              </p>
            </div>
          ))}

          {/* Bluetooth Geräte */}
          {bluetoothDevices.map(device => (
            <div key={device.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Bluetooth Gerät</h3>
              <p className="text-gray-600">Name: {device.name}</p>
              <p className="text-gray-600">
                Status: {device.connected ? 'Verbunden' : 'Getrennt'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeviceList;