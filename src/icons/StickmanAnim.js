import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import '../components/css/Stickman.css';

const AnimatedStickman = () => {
  const [armRaised, setArmRaised] = useState(false);
  const [walking, setWalking] = useState(false);
  const controlsArm = useAnimation();
  const controlsLegs = useAnimation();

  // Timer, um den Arm nach einer einstellbaren Zeit zu heben
  useEffect(() => {
    const timer = setTimeout(() => {
      setArmRaised(true);
      controlsArm.start({ rotate: 60, transition: { duration: 1 } });
    }, 3000); // Diese Zeit kannst du anpassen (3000ms = 3 Sekunden)
    return () => clearTimeout(timer);  // Timer beim Unmount bereinigen
  }, [controlsArm]);

  // Funktion für Drag & Drop der Hand
  const handleDrag = (event, info) => {
    if (info.point.y < 50) {
      setWalking(true);
      controlsLegs.start({ rotate: [10, -10], transition: { repeat: Infinity, duration: 0.5 } });
    }
  };

  // Funktion zum Zurücksetzen der Animation und des States
  const reset = () => {
    setArmRaised(false);
    setWalking(false);
    controlsArm.start({ rotate: 0, transition: { duration: 1 } });
    controlsLegs.start({ rotate: 0, transition: { duration: 0.5 } });
  };

  return (
    <div className="stickman-container">
      {/* Kopf */}
      <div className="head"></div>

      {/* Körper */}
      <div className="body"></div>

      {/* Arme */}
      <motion.div
        className="arm"
        animate={controlsArm}
        drag="y"
        onDrag={handleDrag}
        style={{ cursor: 'grab' }}
      >
        <div className="hand" />
      </motion.div>

      {/* Beine */}
      <motion.div
        className="leg left-leg"
        animate={controlsLegs}
      />
      <motion.div
        className="leg right-leg"
        animate={controlsLegs}
      />

      {/* Reset-Button */}
      <button onClick={reset}>Reset</button>
    </div>
  );
};

export default AnimatedStickman;
