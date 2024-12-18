// LEDControlpage.js
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BLEContext } from './BLEContext';
import GradientEditor from './GradientEditor';
import backgroundImage from '../pics/rainbow-bg.jpg';

const LEDControlPage = () => {
  const navigate = useNavigate();
  const { isConnected, deviceCharacteristic } = useContext(BLEContext);
  const [currentGradient, setCurrentGradient] = useState(['#ff0000', '#00ff00', '#0000ff']);
  const [selectedStrip, setSelectedStrip] = useState('0');
  const [effectSpeed, setEffectSpeed] = useState(1);

  useEffect(() => {
    console.log('Connection status:', isConnected);
    console.log('Device characteristic:', deviceCharacteristic);
  }, [isConnected, deviceCharacteristic]);

  const handleGradientChange = (newGradient) => {
    setCurrentGradient(newGradient);
  };

  const sendLEDCommand = async (command) => {
    if (!isConnected || !deviceCharacteristic) {
      alert('Bitte zuerst mit dem Gerät verbinden.');
      return;
    }
    try {
      const encoder = new TextEncoder();
      const dataArray = encoder.encode(command);
      await deviceCharacteristic.writeValue(dataArray);
      console.log('Sende LED-Befehl:', command);
    } catch (error) {
      console.error('Fehler beim Senden der Daten:', error);
    }
  };

  const applyGradient = () => {
    const colors = currentGradient.map(color => color.substring(1));
    const command = `LED_CONTROL,${selectedStrip},EFFECT,GRADIENT,${colors.length},${colors.join(',')}`;
    sendLEDCommand(command);
  };

  const applyRainbowEffect = () => {
    const command = `LED_CONTROL,${selectedStrip},EFFECT,RAINBOW,${effectSpeed}`;
    sendLEDCommand(command);
  };

  const handleBackClick = () => {
    navigate('/'); // Navigiert zur Hauptseite
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen w-full bg-cover bg-center relative"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div
        className="flex justify-center items-center min-h-screen w-full p-6 rounded-xl border-8 border-black bg-white bg-opacity-20 backdrop-blur-md"
        style={{ width: '90vw', height: '80vh' }}
      >
        <div className="bg-white rounded-xl p-6 border-8 border-black" style={{ width: '80vw', height: '70vh' }}>
          <h1 className="text-3xl font-bold mb-6">LED-Steuerung</h1>
          
          {isConnected ? (
            <>
              <div className="mb-4">
                <label className="block mb-2">LED-Streifen auswählen:</label>
                <select
                  value={selectedStrip}
                  onChange={(e) => setSelectedStrip(e.target.value)}
                  className="border rounded p-2"
                >
                  <option value="0">Alle Streifen</option>
                  <option value="1">Streifen 1</option>
                  <option value="2">Streifen 2</option>
                  <option value="3">Streifen 3</option>
                  <option value="4">Streifen 4</option>
                  <option value="5">Streifen 5</option>
                </select>
              </div>

              <GradientEditor onChange={handleGradientChange} initialColors={currentGradient} />
              <button
                onClick={applyGradient}
                className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Farbverlauf anwenden
              </button>

              <div className="mt-4">
                <label className="block mb-2">
                  Effekt-Geschwindigkeit: {effectSpeed}
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={effectSpeed}
                    onChange={(e) => setEffectSpeed(e.target.value)}
                    className="w-full"
                  />
                </label>
              </div>
              <button
                onClick={applyRainbowEffect}
                className="mt-4 bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
              >
                Regenbogen-Effekt anwenden
              </button>
            </>
          ) : (
            <p className="text-red-500">Bitte verbinden Sie sich zuerst mit einem BLE-Gerät.</p>
          )}

          <button
            onClick={handleBackClick}
            className="mt-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Zurück zur Hauptseite
          </button>
        </div>
      </div>
    </div>
  );
};

export default LEDControlPage;