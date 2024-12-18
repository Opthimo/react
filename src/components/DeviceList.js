import React, { useState, useEffect } from 'react';

const DeviceList = () => {
  const [gamepads, setGamepads] = useState([]);
  
  useEffect(() => {
    const checkGamepads = () => {
      const connected = navigator.getGamepads();
      const active = Array.from(connected)
        .filter(gamepad => gamepad !== null)
        .map(gamepad => ({
          id: gamepad.id,
          name: gamepad.id,
          buttons: gamepad.buttons.length,
          axes: gamepad.axes.length
        }));
      setGamepads(active);
    };

    // Initial Check
    checkGamepads();
    
    window.addEventListener('gamepadconnected', checkGamepads);
    window.addEventListener('gamepaddisconnected', checkGamepads);

    return () => {
      window.removeEventListener('gamepadconnected', checkGamepads);
      window.removeEventListener('gamepaddisconnected', checkGamepads);
    };
  }, []);

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
    },
    deviceList: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '15px',
      marginTop: '20px',
    },
    deviceCard: {
      padding: '15px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#fff',
    },
    title: {
      fontSize: '24px',
      marginBottom: '20px',
    },
    deviceName: {
      fontSize: '16px',
      fontWeight: 'bold',
      marginBottom: '8px',
    },
    deviceInfo: {
      fontSize: '14px',
      color: '#666',
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Angeschlossene Geräte</h2>
      
      <div style={styles.deviceList}>
        {gamepads.map(gamepad => (
          <div key={gamepad.id} style={styles.deviceCard}>
            <div style={styles.deviceName}>{gamepad.name}</div>
            <div style={styles.deviceInfo}>
              Buttons: {gamepad.buttons}
              <br />
              Achsen: {gamepad.axes}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeviceList;