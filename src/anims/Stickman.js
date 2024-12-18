// src/components/StickFigure.js
import React, { useState, useEffect, useRef } from 'react';
import Hand from './Hand';

const StickFigure = ({
  bodyLength = 100,
  armLength = 50,
  legLength = 50,
}) => {
  const [handPosition, setHandPosition] = useState({ x: 200, y: 150 });
  const [handVisible, setHandVisible] = useState(false);
  
  const svgRef = useRef(null);

  useEffect(() => {
    // Zeige die Hand nach 2 Sekunden
    const timer = setTimeout(() => {
      setHandVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleHandMove = (newPosition) => {
    const minY = 50 + bodyLength / 2; // Begrenze die minimale y-Position
    const maxY = 200; // Begrenze die maximale y-Position
    let y = newPosition.y;
    if (y < minY) y = minY;
    if (y > maxY) y = maxY;
    setHandPosition({ x: newPosition.x, y });
  };

  const handleHandRelease = () => {
    setHandPosition({ x: 200, y: 150 }); // Setze die Hand auf die Ausgangsposition zurück
  };

  return (
    <svg
      ref={svgRef}
      width="300"
      height="300"
      style={{ border: '1px solid transparent' }}
    >
      {/* Kopf */}
      <circle cx="150" cy="30" r="20" stroke="black" strokeWidth="2" fill="none" />
      {/* Körper */}
      <line x1="150" y1="50" x2="150" y2={50 + bodyLength} stroke="black" strokeWidth="2" />
      {/* Beine */}
      <line x1="150" y1={50 + bodyLength} x2="130" y2={50 + bodyLength + legLength} stroke="black" strokeWidth="2" />
      <line x1="150" y1={50 + bodyLength} x2="170" y2={50 + bodyLength + legLength} stroke="black" strokeWidth="2" />
      {/* Arme */}
      {/* Linker Arm (fixiert) */}
      <line x1="150" y1={50 + bodyLength / 2} x2="100" y2={50 + bodyLength / 2 + armLength} stroke="black" strokeWidth="2" />
      {/* Rechter Arm (interaktiv, verbunden mit der Hand) */}
      <line x1="150" y1={50 + bodyLength / 2} x2={handPosition.x} y2={handPosition.y} stroke="black" strokeWidth="2" />
      {/* Hand */}
      {handVisible && (
        <Hand
          svgRef={svgRef}
          position={handPosition}
          onMove={handleHandMove}
          onRelease={handleHandRelease}
        />
      )}
    </svg>
  );
};

export default StickFigure;
